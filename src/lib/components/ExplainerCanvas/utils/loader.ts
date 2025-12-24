/**
 * Data loading utilities for ExplainerCanvas
 *
 * Handles fetching and validating canvas data from various sources:
 * - Direct data object
 * - URL to JSON file
 * - Custom async loader function
 *
 * @module ExplainerCanvas/utils/loader
 */

import type { ExplainerCanvasData, ExplainerCard } from '$lib/types';

/**
 * Error thrown when data loading fails
 */
export class DataLoadError extends Error {
	constructor(
		message: string,
		public readonly source: 'url' | 'loader' | 'validation'
	) {
		super(message);
		this.name = 'DataLoadError';
	}
}

/**
 * Validate that a card object has the required properties
 *
 * @param card - Object to validate
 * @param path - Path string for error messages
 * @returns True if valid
 * @throws DataLoadError if invalid
 */
function validateCard(card: unknown, path: string): card is ExplainerCard {
	if (!card || typeof card !== 'object') {
		throw new DataLoadError(`Invalid card at ${path}: not an object`, 'validation');
	}

	const c = card as Record<string, unknown>;

	if (typeof c.id !== 'string' || !c.id) {
		throw new DataLoadError(`Invalid card at ${path}: missing or invalid 'id'`, 'validation');
	}

	if (typeof c.title !== 'string' || !c.title) {
		throw new DataLoadError(`Invalid card at ${path}: missing or invalid 'title'`, 'validation');
	}

	if (typeof c.summary !== 'string') {
		throw new DataLoadError(`Invalid card at ${path}: missing or invalid 'summary'`, 'validation');
	}

	if (!Array.isArray(c.content)) {
		throw new DataLoadError(`Invalid card at ${path}: 'content' must be an array`, 'validation');
	}

	if (!c.position || typeof c.position !== 'object') {
		throw new DataLoadError(`Invalid card at ${path}: missing or invalid 'position'`, 'validation');
	}

	const pos = c.position as Record<string, unknown>;
	if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
		throw new DataLoadError(
			`Invalid card at ${path}: position must have numeric 'x' and 'y'`,
			'validation'
		);
	}

	// Validate children recursively
	if (c.children) {
		if (!Array.isArray(c.children)) {
			throw new DataLoadError(`Invalid card at ${path}: 'children' must be an array`, 'validation');
		}
		for (let i = 0; i < c.children.length; i++) {
			validateCard(c.children[i], `${path}.children[${i}]`);
		}
	}

	return true;
}

/**
 * Validate complete canvas data structure
 *
 * @param data - Data object to validate
 * @returns True if valid
 * @throws DataLoadError if invalid
 */
export function validateCanvasData(data: unknown): data is ExplainerCanvasData {
	if (!data || typeof data !== 'object') {
		throw new DataLoadError('Canvas data must be an object', 'validation');
	}

	const d = data as Record<string, unknown>;

	if (typeof d.id !== 'string' || !d.id) {
		throw new DataLoadError("Canvas data missing or invalid 'id'", 'validation');
	}

	if (typeof d.title !== 'string' || !d.title) {
		throw new DataLoadError("Canvas data missing or invalid 'title'", 'validation');
	}

	if (typeof d.defaultCardId !== 'string') {
		throw new DataLoadError("Canvas data missing 'defaultCardId'", 'validation');
	}

	if (!Array.isArray(d.cards)) {
		throw new DataLoadError("Canvas data 'cards' must be an array", 'validation');
	}

	// Validate each card
	for (let i = 0; i < d.cards.length; i++) {
		validateCard(d.cards[i], `cards[${i}]`);
	}

	// Verify defaultCardId exists
	const allCardIds = collectCardIds(d.cards as ExplainerCard[]);
	if (!allCardIds.has(d.defaultCardId as string)) {
		throw new DataLoadError(
			`defaultCardId '${d.defaultCardId}' not found in cards`,
			'validation'
		);
	}

	return true;
}

/**
 * Collect all card IDs from nested structure
 *
 * @param cards - Array of cards
 * @returns Set of all card IDs
 */
function collectCardIds(cards: ExplainerCard[]): Set<string> {
	const ids = new Set<string>();

	function collect(cardList: ExplainerCard[]) {
		for (const card of cardList) {
			ids.add(card.id);
			if (card.children) {
				collect(card.children);
			}
		}
	}

	collect(cards);
	return ids;
}

/**
 * Load canvas data from a URL
 *
 * @param url - URL to fetch JSON from
 * @returns Validated canvas data
 * @throws DataLoadError on fetch or validation failure
 */
export async function loadFromUrl(url: string): Promise<ExplainerCanvasData> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new DataLoadError(
				`Failed to fetch canvas data: ${response.status} ${response.statusText}`,
				'url'
			);
		}

		const data = await response.json();
		validateCanvasData(data);

		return data;
	} catch (error) {
		if (error instanceof DataLoadError) {
			throw error;
		}
		throw new DataLoadError(
			`Failed to load canvas data from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
			'url'
		);
	}
}

/**
 * Load canvas data using a custom loader function
 *
 * @param loader - Async function that returns canvas data
 * @returns Validated canvas data
 * @throws DataLoadError on loader or validation failure
 */
export async function loadFromLoader(
	loader: () => Promise<ExplainerCanvasData>
): Promise<ExplainerCanvasData> {
	try {
		const data = await loader();
		validateCanvasData(data);
		return data;
	} catch (error) {
		if (error instanceof DataLoadError) {
			throw error;
		}
		throw new DataLoadError(
			`Custom loader failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			'loader'
		);
	}
}

/**
 * Resolve canvas data from props
 * Handles data, src, and loader props with priority
 *
 * @param options - Object containing data, src, or loader
 * @returns Resolved and validated canvas data
 * @throws DataLoadError if no data source provided or loading fails
 */
export async function resolveCanvasData(options: {
	data?: ExplainerCanvasData;
	src?: string;
	loader?: () => Promise<ExplainerCanvasData>;
}): Promise<ExplainerCanvasData> {
	const { data, src, loader } = options;

	// Priority: data > src > loader
	if (data) {
		validateCanvasData(data);
		return data;
	}

	if (src) {
		return loadFromUrl(src);
	}

	if (loader) {
		return loadFromLoader(loader);
	}

	throw new DataLoadError(
		'No data source provided. Specify data, src, or loader prop.',
		'validation'
	);
}

/**
 * Check if link IDs reference valid cards
 * Useful for debugging broken links
 *
 * @param cards - Array of cards to check
 * @returns Array of { cardId, invalidLinks } for cards with broken links
 */
export function findBrokenLinks(
	cards: ExplainerCard[]
): Array<{ cardId: string; invalidLinks: string[] }> {
	const allIds = collectCardIds(cards);
	const broken: Array<{ cardId: string; invalidLinks: string[] }> = [];

	function check(cardList: ExplainerCard[]) {
		for (const card of cardList) {
			if (card.links) {
				const invalidLinks = card.links.filter((linkId) => !allIds.has(linkId));
				if (invalidLinks.length > 0) {
					broken.push({ cardId: card.id, invalidLinks });
				}
			}
			if (card.children) {
				check(card.children);
			}
		}
	}

	check(cards);
	return broken;
}
