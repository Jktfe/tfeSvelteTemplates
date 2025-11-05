/**
 * API Route: /api/cards
 *
 * Fetches card data from Neon database
 *
 * USAGE:
 * GET /api/cards - Returns all cards ordered by display_order
 *
 * RESPONSE FORMAT:
 * {
 *   "cards": [
 *     {
 *       "id": 1,
 *       "title": "Card Title",
 *       "description": "Card description",
 *       "image_url": "https://...",
 *       "display_order": 1
 *     },
 *     ...
 *   ]
 * }
 *
 * ERROR HANDLING:
 * - Returns 500 if database connection fails
 * - Returns 500 if query fails
 * - Logs errors to console for debugging
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { neon } from '@neondatabase/serverless';
import type { Card, CardRow } from '$lib/types';

/**
 * GET handler - Fetch all cards from database
 */
export const GET: RequestHandler = async () => {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// Ensure DATABASE_URL is configured
		if (!databaseUrl) {
			console.error('DATABASE_URL environment variable is not set');
			throw error(500, {
				message: 'Database configuration error. Please set DATABASE_URL environment variable.'
			});
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query cards ordered by display_order
		// This ensures cards appear in the correct sequence
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

		// Return cards as JSON
		return json({
			cards: formattedCards
		});

	} catch (err) {
		// Log error for debugging
		console.error('Error fetching cards from database:', err);

		// Return error response
		throw error(500, {
			message: 'Failed to fetch cards from database. Check server logs for details.'
		});
	}
};
