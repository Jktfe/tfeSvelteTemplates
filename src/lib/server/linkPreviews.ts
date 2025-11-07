/**
 * Shared Server Utilities for Link Preview Data Loading
 *
 * This module provides reusable server-side functions for loading link preview data
 * from the Neon database with fallback to static data when unavailable.
 *
 * USAGE:
 * Import this in your +page.server.ts files:
 * ```ts
 * import { loadLinkPreviewsFromDatabase } from '$lib/server/linkPreviews';
 *
 * export const load: PageServerLoad = async () => {
 *   // Load all link previews
 *   const allLinks = await loadLinkPreviewsFromDatabase();
 *
 *   // Or load by category
 *   const cityLinks = await loadLinkPreviewsFromDatabase('cities');
 *   const natureLinks = await loadLinkPreviewsFromDatabase('nature');
 *
 *   return { linkPreviews: allLinks };
 * };
 * ```
 *
 * PRODUCTION LOGGING:
 * This module uses console.warn and console.error for logging.
 * In production, replace these with a proper logging service (e.g., Sentry, Winston, Pino).
 */

import { neon } from '@neondatabase/serverless';
import type { LinkPreview, LinkPreviewRow } from '$lib/types';
import { FALLBACK_LINK_PREVIEWS } from '$lib/constants';

/**
 * Loads link preview data from the Neon database
 *
 * Falls back to FALLBACK_LINK_PREVIEWS if:
 * - DATABASE_URL environment variable is not set
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('cities', 'nature', etc.)
 * @returns Promise resolving to array of LinkPreview objects
 *
 * @example
 * ```ts
 * // Get all link previews
 * const all = await loadLinkPreviewsFromDatabase();
 *
 * // Get only city links
 * const cities = await loadLinkPreviewsFromDatabase('cities');
 *
 * // Get only nature links
 * const nature = await loadLinkPreviewsFromDatabase('nature');
 * ```
 */
export async function loadLinkPreviewsFromDatabase(category?: string): Promise<LinkPreview[]> {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// If DATABASE_URL is not configured, return fallback link previews
		// This allows the app to work without a database connection
		if (!databaseUrl) {
			// NOTE: In production, replace with proper logging service
			console.warn('DATABASE_URL not configured, using fallback link preview data');

			// Filter fallback data by category if provided
			if (category) {
				return FALLBACK_LINK_PREVIEWS.filter((l) => l.category === category);
			}
			return FALLBACK_LINK_PREVIEWS;
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query link previews from database
		// Orders by display_order to maintain consistent sequence
		// Filters by category if provided, and only returns active links
		let rows: LinkPreviewRow[];

		if (category) {
			rows = (await sql`
				SELECT
					id,
					text,
					href,
					image_url,
					image_alt,
					image_width,
					target,
					category,
					description,
					display_order,
					is_active,
					created_at
				FROM link_previews
				WHERE is_active = TRUE AND category = ${category}
				ORDER BY display_order ASC
			`) as unknown as LinkPreviewRow[];
		} else {
			rows = (await sql`
				SELECT
					id,
					text,
					href,
					image_url,
					image_alt,
					image_width,
					target,
					category,
					description,
					display_order,
					is_active,
					created_at
				FROM link_previews
				WHERE is_active = TRUE
				ORDER BY display_order ASC
			`) as unknown as LinkPreviewRow[];
		}

		// Transform database records to match LinkPreview interface
		// Maps database snake_case column names to camelCase properties
		const formattedLinks: LinkPreview[] = rows.map((row) => ({
			id: row.id,
			text: row.text,
			href: row.href,
			imageSrc: row.image_url,
			imageAlt: row.image_alt,
			imageWidth: row.image_width,
			target: row.target,
			category: row.category,
			description: row.description || undefined
		}));

		return formattedLinks;
	} catch (err) {
		// Log error but don't crash - use fallback data instead
		// This ensures the app remains functional even if database is unavailable
		// NOTE: In production, replace with proper error tracking (e.g., Sentry)
		console.error('Error loading link previews from database:', err);

		// Return fallback link previews so the demo still works
		// Filter by category if provided
		if (category) {
			return FALLBACK_LINK_PREVIEWS.filter((l) => l.category === category);
		}
		return FALLBACK_LINK_PREVIEWS;
	}
}
