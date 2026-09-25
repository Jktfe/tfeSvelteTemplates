/**
 * Shared Server Utilities for Expanding Card Data Loading
 *
 * This module provides reusable server-side functions for loading expanding card data
 * from the Neon database with fallback to static data when unavailable.
 *
 * USAGE:
 * Import this in your +page.server.ts files:
 * ```ts
 * import { loadExpandingCardsFromDatabase } from '$lib/server/expandingCards';
 *
 * export const load: PageServerLoad = async () => {
 *   // Load all expanding cards
 *   const allCards = await loadExpandingCardsFromDatabase();
 *
 *   // Or load by category
 *   const natureCards = await loadExpandingCardsFromDatabase('nature');
 *
 *   return { expandingCards: allCards };
 * };
 * ```
 *
 * PRODUCTION LOGGING:
 * This module uses console.warn and console.error for logging.
 * In production, replace these with a proper logging service (e.g., Sentry, Winston, Pino).
 */

import { neon } from '@neondatabase/serverless';
import type { ExpandingCardData, ExpandingCardRow } from '$lib/types';
import { FALLBACK_EXPANDING_CARDS } from '$lib/constants';
import { loadWithFallback, type DataSourceResult } from './dataSource';

/**
 * Loads expanding card data from the Neon database
 *
 * Falls back to FALLBACK_EXPANDING_CARDS if:
 * - DATABASE_URL is not set (or is still the .env.example placeholder)
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('nature', 'general', etc.)
 * @returns The rows plus their DataSourceResult status (database / fallback / error)
 *
 * @example
 * ```ts
 * // Get all expanding cards
 * const all = await loadExpandingCardsWithSource();
 *
 * // Get only nature-themed cards
 * const nature = await loadExpandingCardsWithSource('nature');
 * ```
 */
export async function loadExpandingCardsWithSource(
	category?: string
): Promise<DataSourceResult<ExpandingCardData[]>> {
	// Filter the fallback by the same category as the query so the demo shows
	// the same subset whether or not the database is reachable.
	const fallback = category
		? FALLBACK_EXPANDING_CARDS.filter((c) => c.category === category)
		: FALLBACK_EXPANDING_CARDS;

	return loadWithFallback(
		fallback,
		async (databaseUrl) => {
			const sql = neon(databaseUrl);

			// Only active rows, in display_order, optionally narrowed by category
			const rows = (
				category
					? await sql`
						SELECT
							id,
							heading,
							compact_text,
							expanded_text,
							image_url,
							image_alt,
							bg_color,
							category,
							display_order,
							is_active,
							created_at
						FROM expanding_cards
						WHERE is_active = TRUE AND category = ${category}
						ORDER BY display_order ASC
					`
					: await sql`
						SELECT
							id,
							heading,
							compact_text,
							expanded_text,
							image_url,
							image_alt,
							bg_color,
							category,
							display_order,
							is_active,
							created_at
						FROM expanding_cards
						WHERE is_active = TRUE
						ORDER BY display_order ASC
					`
			) as unknown as ExpandingCardRow[];

			// snake_case columns → camelCase props at the data-layer boundary
			return rows.map((row) => ({
				id: row.id,
				heading: row.heading,
				compactText: row.compact_text,
				expandedText: row.expanded_text,
				imageSrc: row.image_url,
				imageAlt: row.image_alt,
				bgColor: row.bg_color,
				category: row.category
			}));
		},
		{ label: 'ExpandingCards', schemaFile: 'schema_v2.sql' }
	);
}

/**
 * Convenience wrapper for callers that only need the rows.
 *
 * @param category - Optional category filter
 */
export async function loadExpandingCardsFromDatabase(category?: string): Promise<ExpandingCardData[]> {
	return (await loadExpandingCardsWithSource(category)).data;
}
