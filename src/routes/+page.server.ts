/**
 * Server Load Function for Home Page
 *
 * Fetches card data from the database on the server side
 * This runs before the page loads, providing data for SSR
 *
 * BENEFITS OF SERVER-SIDE LOADING:
 * - SEO friendly (cards rendered in HTML)
 * - Faster initial page load
 * - No loading spinner needed
 * - Database credentials stay secure on server
 */

import type { PageServerLoad } from './$types';
import { neon } from '@neondatabase/serverless';
import type { Card, CardRow } from '$lib/types';
import { FALLBACK_CARDS } from '$lib/constants';

export const load: PageServerLoad = async (): Promise<{ cards: Card[] }> => {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// If DATABASE_URL is not configured, return fallback cards
		// This allows the app to work without a database connection
		if (!databaseUrl) {
			console.warn('DATABASE_URL not configured, using fallback data');
			return {
				cards: FALLBACK_CARDS
			};
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query cards from database
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

		// Transform database records to match component expectations
		// Maps database column names to Card interface properties
		const formattedCards: Card[] = rows.map(row => ({
			title: row.title,
			content: row.description,
			image: row.image_url
		}));

		return {
			cards: formattedCards
		};

	} catch (err) {
		// Log error but don't crash - use fallback data instead
		console.error('Error loading cards from database:', err);

		// Return fallback cards so the demo still works
		return {
			cards: FALLBACK_CARDS
		};
	}
};
