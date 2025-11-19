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

/**
 * Loads testimonial data from the Neon database
 *
 * Falls back to FALLBACK_TESTIMONIALS if:
 * - DATABASE_URL environment variable is not set
 * - Database connection fails
 * - Query execution fails
 *
 * @param category - Optional category filter ('static', 'interactive', etc.)
 * @returns Promise resolving to array of Testimonial objects
 *
 * @example
 * ```ts
 * // Get all testimonials
 * const all = await loadTestimonialsFromDatabase();
 *
 * // Get only static marquee testimonials
 * const static = await loadTestimonialsFromDatabase('static');
 *
 * // Get only interactive/draggable testimonials
 * const interactive = await loadTestimonialsFromDatabase('interactive');
 * ```
 */
export async function loadTestimonialsFromDatabase(category?: string): Promise<Testimonial[]> {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// If DATABASE_URL is not configured, return fallback testimonials
		// This allows the app to work without a database connection
		if (!databaseUrl) {
			// NOTE: In production, replace with proper logging service
			console.warn('DATABASE_URL not configured, using fallback testimonial data');

			// Filter fallback data by category if provided
			if (category) {
				return FALLBACK_TESTIMONIALS.filter((t) => t.category === category);
			}
			return FALLBACK_TESTIMONIALS;
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query testimonials from database
		// Orders by display_order to maintain consistent sequence
		// Filters by category if provided, and only returns active testimonials
		let rows: TestimonialRow[];

		if (category) {
			rows = (await sql`
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
			`) as unknown as TestimonialRow[];
		} else {
			rows = (await sql`
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
			`) as unknown as TestimonialRow[];
		}

		// Transform database records to match Testimonial interface
		// Maps database snake_case column names to camelCase properties
		const formattedTestimonials: Testimonial[] = rows.map((row) => ({
			id: row.id,
			name: row.name,
			role: row.role,
			company: row.company,
			quote: row.quote,
			avatar: row.avatar,
			category: row.category
		}));

		return formattedTestimonials;
	} catch (err) {
		// Log error but don't crash - use fallback data instead
		// This ensures the app remains functional even if database is unavailable
		// NOTE: In production, replace with proper error tracking (e.g., Sentry)
		console.error('Error loading testimonials from database:', err);

		// Return fallback testimonials so the demo still works
		// Filter by category if provided
		if (category) {
			return FALLBACK_TESTIMONIALS.filter((t) => t.category === category);
		}
		return FALLBACK_TESTIMONIALS;
	}
}
// Claude is happy that this file is mint. Signed off 19.11.25.
