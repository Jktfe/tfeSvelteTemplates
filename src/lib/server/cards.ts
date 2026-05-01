/**
 * Shared Server Utilities for Card Data Loading
 *
 * This module provides reusable server-side functions for loading card data
 * from the Neon database with fallback to static data when unavailable.
 *
 * USAGE:
 * Import this in your +page.server.ts files:
 * ```ts
 * import { loadCardsFromDatabase } from '$lib/server/cards';
 *
 * export const load: PageServerLoad = async () => {
 *   return { cards: await loadCardsFromDatabase() };
 * };
 * ```
 *
 * PRODUCTION LOGGING:
 * This module uses console.warn and console.error for logging.
 * In production, replace these with a proper logging service (e.g., Sentry, Winston, Pino).
 */

import { neon } from '@neondatabase/serverless';
import type { Card, CardRow } from '$lib/types';
import { FALLBACK_CARDS } from '$lib/constants';
import {
	fromDatabase,
	fromDatabaseError,
	fromFallback,
	getConfiguredDatabaseUrl,
	type DataSourceResult
} from './dataSource';

/**
 * Loads card data from the Neon database
 *
 * Falls back to FALLBACK_CARDS if:
 * - DATABASE_URL environment variable is not set
 * - Database connection fails
 * - Query execution fails
 *
 * @returns Promise resolving to array of Card objects
 *
 * @example
 * ```ts
 * const cards = await loadCardsFromDatabase();
 * // Returns: [{ title: '...', content: '...', image: '...' }, ...]
 * ```
 */
export async function loadCardsFromDatabase(): Promise<Card[]> {
	const result = await loadCardsWithSource();
	return result.data;
}

export async function loadCardsWithSource(): Promise<DataSourceResult<Card[]>> {
	try {
		const databaseUrl = getConfiguredDatabaseUrl();

		if (!databaseUrl) {
			console.warn('DATABASE_URL not configured, using demo fixture card data');
			return fromFallback(FALLBACK_CARDS);
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query cards from database
		// Orders by display_order to maintain consistent card sequence
		const rows = (await sql`
			SELECT
				id,
				title,
				description,
				image_url,
				display_order,
				created_at
			FROM cards
			ORDER BY display_order ASC
		`) as unknown as CardRow[];

		// Transform database records to match Card interface
		// Maps database snake_case column names to camelCase properties
		const formattedCards: Card[] = rows.map((row) => ({
			title: row.title,
			content: row.description,
			image: row.image_url
		}));

		return fromDatabase(formattedCards);
	} catch (err) {
		// Log error but don't crash - use fallback data instead
		// This ensures the app remains functional even if database is unavailable
		// NOTE: In production, replace with proper error tracking (e.g., Sentry)
		console.error('Error loading cards from database:', err);

		return fromDatabaseError(FALLBACK_CARDS, err);
	}
}

/**
 * Creates a Neon database connection
 *
 * @returns Neon SQL client instance
 * @throws Error if DATABASE_URL is not configured
 *
 * @example
 * ```ts
 * const sql = createDatabaseConnection();
 * const result = await sql`SELECT * FROM cards`;
 * ```
 */
export function createDatabaseConnection() {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		throw new Error(
			'DATABASE_URL environment variable is not configured. ' +
				'Please add it to your .env file or environment settings.'
		);
	}

	return neon(databaseUrl);
}
// Claude is happy that this file is mint. Signed off 19.11.25.
