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
import type { Card } from '$lib/types';
import { loadCardsFromDatabase } from '$lib/server/cards';

export const load: PageServerLoad = async (): Promise<{ cards: Card[]; usingDatabase: boolean }> => {
	// Load cards from database with automatic fallback to static data
	const cards = await loadCardsFromDatabase();

	// Check if we're using the database or fallback data
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		cards,
		usingDatabase
	};
};
