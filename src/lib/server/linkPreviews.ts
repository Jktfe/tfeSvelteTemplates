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
import { loadWithFallback, type DataSourceResult } from './dataSource';

/**
 * Loads link preview data from the Neon database
 *
 * Falls back to FALLBACK_LINK_PREVIEWS if:
 * - DATABASE_URL is not set (or is still the .env.example placeholder)
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('cities', 'nature', etc.)
 * @returns The rows plus their DataSourceResult status (database / fallback / error)
 *
 * @example
 * ```ts
 * // Get all link previews
 * const all = await loadLinkPreviewsWithSource();
 *
 * // Get only city links
 * const cities = await loadLinkPreviewsWithSource('cities');
 *
 * // Get only nature links
 * const nature = await loadLinkPreviewsWithSource('nature');
 * ```
 */
export async function loadLinkPreviewsWithSource(
	category?: string
): Promise<DataSourceResult<LinkPreview[]>> {
	// Filter the fallback by the same category as the query so the demo shows
	// the same subset whether or not the database is reachable.
	const fallback = category
		? FALLBACK_LINK_PREVIEWS.filter((l) => l.category === category)
		: FALLBACK_LINK_PREVIEWS;

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
					`
					: await sql`
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
					`
			) as unknown as LinkPreviewRow[];

			// snake_case columns → camelCase props at the data-layer boundary
			return rows.map((row) => ({
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
		},
		{ label: 'LinkPreviews', schemaFile: 'schema_v2.sql' }
	);
}

/**
 * Convenience wrapper for callers that only need the rows.
 *
 * @param category - Optional category filter
 */
export async function loadLinkPreviewsFromDatabase(category?: string): Promise<LinkPreview[]> {
	return (await loadLinkPreviewsWithSource(category)).data;
}
