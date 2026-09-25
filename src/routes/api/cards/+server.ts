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
 *     { "title": "Card Title", "content": "Card description", "image": "https://..." },
 *     ...
 *   ]
 * }
 *
 * ERROR HANDLING:
 * This endpoint is a thin JSON view over the database, so unlike the demo
 * pages it does not quietly serve fixture cards:
 * - 503 when DATABASE_URL is missing or still the .env.example placeholder
 * - 500 when the database is configured but the query fails
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadCardsWithSource } from '$lib/server/cards';

/**
 * GET handler - Fetch all cards from database
 */
export const GET: RequestHandler = async () => {
	// Reuse the shared loader so the query and snake_case → camelCase mapping
	// live in one place; the status on the result tells us which answer to give.
	const result = await loadCardsWithSource();

	if (result.source === 'database') {
		return json({ cards: result.data });
	}

	if (!result.databaseConfigured) {
		throw error(503, {
			message: 'Database not configured. Please set the DATABASE_URL environment variable.'
		});
	}

	throw error(500, {
		message: 'Failed to fetch cards from database. Check server logs for details.'
	});
};
