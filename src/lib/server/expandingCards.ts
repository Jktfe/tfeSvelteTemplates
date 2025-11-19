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

/**
 * Loads expanding card data from the Neon database
 *
 * Falls back to FALLBACK_EXPANDING_CARDS if:
 * - DATABASE_URL environment variable is not set
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('nature', 'general', etc.)
 * @returns Promise resolving to array of ExpandingCardData objects
 *
 * @example
 * ```ts
 * // Get all expanding cards
 * const all = await loadExpandingCardsFromDatabase();
 *
 * // Get only nature-themed cards
 * const nature = await loadExpandingCardsFromDatabase('nature');
 * ```
 */
export async function loadExpandingCardsFromDatabase(
	category?: string
): Promise<ExpandingCardData[]> {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// If DATABASE_URL is not configured, return fallback expanding cards
		// This allows the app to work without a database connection
		if (!databaseUrl) {
			// NOTE: In production, replace with proper logging service
			console.warn('DATABASE_URL not configured, using fallback expanding card data');

			// Filter fallback data by category if provided
			if (category) {
				return FALLBACK_EXPANDING_CARDS.filter((c) => c.category === category);
			}
			return FALLBACK_EXPANDING_CARDS;
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query expanding cards from database
		// Orders by display_order to maintain consistent sequence
		// Filters by category if provided, and only returns active cards
		let rows: ExpandingCardRow[];

		if (category) {
			rows = (await sql`
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
			`) as unknown as ExpandingCardRow[];
		} else {
			rows = (await sql`
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
			`) as unknown as ExpandingCardRow[];
		}

		// Transform database records to match ExpandingCardData interface
		// Maps database snake_case column names to camelCase properties
		const formattedCards: ExpandingCardData[] = rows.map((row) => ({
			id: row.id,
			heading: row.heading,
			compactText: row.compact_text,
			expandedText: row.expanded_text,
			imageSrc: row.image_url,
			imageAlt: row.image_alt,
			bgColor: row.bg_color,
			category: row.category
		}));

		return formattedCards;
	} catch (err) {
		// Log error but don't crash - use fallback data instead
		// This ensures the app remains functional even if database is unavailable
		// NOTE: In production, replace with proper error tracking (e.g., Sentry)
		console.error('Error loading expanding cards from database:', err);

		// Return fallback expanding cards so the demo still works
		// Filter by category if provided
		if (category) {
			return FALLBACK_EXPANDING_CARDS.filter((c) => c.category === category);
		}
		return FALLBACK_EXPANDING_CARDS;
	}
}
// Claude is happy that this file is mint. Signed off 19.11.25.
