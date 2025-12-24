/**
 * Search utilities for ExplainerCanvas
 *
 * Fuzzy search implementation using Fuse.js for finding cards
 * by title, summary, or content.
 *
 * @module ExplainerCanvas/utils/search
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { ExplainerCard, ExplainerSearchResult } from '$lib/types';

/**
 * Fuse.js configuration for card search
 * Optimised for searching card titles, summaries, and content
 */
const FUSE_OPTIONS: IFuseOptions<ExplainerCard> = {
	// Keys to search with their weights
	keys: [
		{ name: 'title', weight: 2 },
		{ name: 'summary', weight: 1.5 },
		{ name: 'content.content', weight: 1 }
	],
	// Search options
	includeScore: true,
	threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
	ignoreLocation: true,
	minMatchCharLength: 2
};

/**
 * Flatten nested cards into a single array with path information
 *
 * @param cards - Array of cards (potentially nested)
 * @param currentPath - Current path array (for recursion)
 * @returns Flattened array of cards with their paths
 */
export function flattenCards(
	cards: ExplainerCard[],
	currentPath: string[] = []
): Array<{ card: ExplainerCard; path: string[] }> {
	const result: Array<{ card: ExplainerCard; path: string[] }> = [];

	for (const card of cards) {
		const path = [...currentPath, card.id];
		result.push({ card, path });

		// Recursively flatten children
		if (card.children && card.children.length > 0) {
			result.push(...flattenCards(card.children, path));
		}
	}

	return result;
}

/**
 * Create a search index from cards
 *
 * @param cards - Array of top-level cards
 * @returns Fuse search instance
 */
export function createSearchIndex(cards: ExplainerCard[]): Fuse<ExplainerCard> {
	const flatCards = flattenCards(cards).map((item) => item.card);
	return new Fuse(flatCards, FUSE_OPTIONS);
}

/**
 * Search cards using fuzzy matching
 *
 * @param searchIndex - Fuse search instance
 * @param query - Search query string
 * @param cards - Original cards array (for path resolution)
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Array of search results with scores
 */
export function searchCards(
	searchIndex: Fuse<ExplainerCard>,
	query: string,
	cards: ExplainerCard[],
	maxResults = 10
): ExplainerSearchResult[] {
	if (!query || query.trim().length < 2) {
		return [];
	}

	const fuseResults = searchIndex.search(query, { limit: maxResults });
	const flattenedCards = flattenCards(cards);

	return fuseResults.map((result) => {
		// Find the path for this card
		const cardWithPath = flattenedCards.find((item) => item.card.id === result.item.id);
		const path = cardWithPath?.path ?? [result.item.id];

		// Determine which field matched (approximate based on score and matches)
		let matchField: 'title' | 'summary' | 'content' = 'title';
		if (result.matches && result.matches.length > 0) {
			const firstMatch = result.matches[0];
			if (firstMatch.key === 'summary') {
				matchField = 'summary';
			} else if (firstMatch.key?.includes('content')) {
				matchField = 'content';
			}
		}

		return {
			card: result.item,
			path,
			matchField,
			score: result.score ?? 1
		};
	});
}

/**
 * Find a card by ID in nested structure
 *
 * @param cards - Array of cards to search
 * @param id - Card ID to find
 * @returns Card and its path, or undefined if not found
 */
export function findCardById(
	cards: ExplainerCard[],
	id: string
): { card: ExplainerCard; path: string[] } | undefined {
	const flattened = flattenCards(cards);
	return flattened.find((item) => item.card.id === id);
}

/**
 * Get cards at a specific path level
 *
 * @param cards - Root cards array
 * @param path - Path to the level (array of card IDs)
 * @returns Array of cards at that level, or undefined if path is invalid
 */
export function getCardsAtPath(
	cards: ExplainerCard[],
	path: string[]
): ExplainerCard[] | undefined {
	if (path.length === 0) {
		return cards;
	}

	let current: ExplainerCard[] = cards;

	for (let i = 0; i < path.length; i++) {
		const card = current.find((c) => c.id === path[i]);
		if (!card) {
			return undefined;
		}

		// If this is the last item in path, return its children
		if (i === path.length - 1) {
			return card.children ?? [];
		}

		// Move to children for next iteration
		if (!card.children) {
			return undefined;
		}
		current = card.children;
	}

	return current;
}

/**
 * Get the parent card at a given path
 *
 * @param cards - Root cards array
 * @param path - Path to the current level
 * @returns Parent card or undefined if at root level
 */
export function getParentCard(
	cards: ExplainerCard[],
	path: string[]
): ExplainerCard | undefined {
	if (path.length <= 1) {
		return undefined;
	}

	const parentPath = path.slice(0, -1);
	const result = findCardById(cards, parentPath[parentPath.length - 1]);
	return result?.card;
}

/**
 * Build path labels for breadcrumb navigation
 *
 * @param cards - Root cards array
 * @param path - Current path
 * @returns Array of { id, title } for each level in path
 */
export function buildBreadcrumbPath(
	cards: ExplainerCard[],
	path: string[]
): Array<{ id: string; title: string }> {
	const result: Array<{ id: string; title: string }> = [];

	for (const id of path) {
		const found = findCardById(cards, id);
		if (found) {
			result.push({ id, title: found.card.title });
		}
	}

	return result;
}
