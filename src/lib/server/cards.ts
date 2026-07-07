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

import type { Card, CardRow } from '$lib/types';
import { FALLBACK_CARDS } from '$lib/constants';
import { withDatabase, type DataSourceResult } from './dataSource';

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
	// withDatabase handles the URL guard, connection, error translation and the
	// missing-table hint; we supply only the query and the snake_case → camelCase
	// mapping.
	return withDatabase(
		FALLBACK_CARDS,
		async (sql) => {
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

			return rows.map((row) => ({
				title: row.title,
				content: row.description,
				image: row.image_url
			}));
		},
		{ schemaFile: 'schema.sql' }
	);
}
