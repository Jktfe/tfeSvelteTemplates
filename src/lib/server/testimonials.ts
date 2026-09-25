/**
 * Shared Server Utilities for Testimonial Data Loading
 *
 * This module provides reusable server-side functions for loading testimonial data
 * from the Neon database with fallback to static data when unavailable.
 *
 * USAGE:
 * Import this in your +page.server.ts files:
 * ```ts
 * import { loadTestimonialsFromDatabase } from '$lib/server/testimonials';
 *
 * export const load: PageServerLoad = async () => {
 *   // Load all testimonials
 *   const allTestimonials = await loadTestimonialsFromDatabase();
 *
 *   // Or load by category
 *   const staticTestimonials = await loadTestimonialsFromDatabase('static');
 *   const interactiveTestimonials = await loadTestimonialsFromDatabase('interactive');
 *
 *   return { testimonials: allTestimonials };
 * };
 * ```
 *
 * PRODUCTION LOGGING:
 * This module uses console.warn and console.error for logging.
 * In production, replace these with a proper logging service (e.g., Sentry, Winston, Pino).
 */

import { neon } from '@neondatabase/serverless';
import type { Testimonial, TestimonialRow } from '$lib/types';
import { FALLBACK_TESTIMONIALS } from '$lib/constants';
import { loadWithFallback, type DataSourceResult } from './dataSource';

/**
 * Loads testimonial data from the Neon database
 *
 * Falls back to FALLBACK_TESTIMONIALS if:
 * - DATABASE_URL is not set (or is still the .env.example placeholder)
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('static', 'interactive', etc.)
 * @returns The rows plus their DataSourceResult status (database / fallback / error)
 *
 * @example
 * ```ts
 * // Get all testimonials
 * const all = await loadTestimonialsWithSource();
 *
 * // Get only static marquee testimonials
 * const static = await loadTestimonialsWithSource('static');
 *
 * // Get only interactive/draggable testimonials
 * const interactive = await loadTestimonialsWithSource('interactive');
 * ```
 */
export async function loadTestimonialsWithSource(
	category?: string
): Promise<DataSourceResult<Testimonial[]>> {
	// Filter the fallback by the same category as the query so the demo shows
	// the same subset whether or not the database is reachable.
	const fallback = category
		? FALLBACK_TESTIMONIALS.filter((t) => t.category === category)
		: FALLBACK_TESTIMONIALS;

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
							name,
							role,
							company,
							quote,
							avatar,
							category,
							display_order,
							is_active,
							created_at
						FROM testimonials
						WHERE is_active = TRUE AND category = ${category}
						ORDER BY display_order ASC
					`
					: await sql`
						SELECT
							id,
							name,
							role,
							company,
							quote,
							avatar,
							category,
							display_order,
							is_active,
							created_at
						FROM testimonials
						WHERE is_active = TRUE
						ORDER BY display_order ASC
					`
			) as unknown as TestimonialRow[];

			// snake_case columns → camelCase props at the data-layer boundary
			return rows.map((row) => ({
				id: row.id,
				name: row.name,
				role: row.role,
				company: row.company,
				quote: row.quote,
				avatar: row.avatar,
				category: row.category
			}));
		},
		{ label: 'Testimonials', schemaFile: 'schema_v2.sql' }
	);
}

/**
 * Convenience wrapper for callers that only need the rows.
 *
 * @param category - Optional category filter
 */
export async function loadTestimonialsFromDatabase(category?: string): Promise<Testimonial[]> {
	return (await loadTestimonialsWithSource(category)).data;
}
