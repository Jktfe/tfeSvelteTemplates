/**
 * ExpandingCard Page - Server Load Function
 *
 * Loads expanding card data from the Neon database with graceful fallback to static data.
 */

import { loadExpandingCardsFromDatabase } from '$lib/server/expandingCards';
import type { ExpandingCardData } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the ExpandingCard demo page
 *
 * Loads expanding card data from database (or fallback data if DATABASE_URL not configured).
 */
export const load: PageServerLoad = async (): Promise<{
	expandingCards: ExpandingCardData[];
	usingDatabase: boolean;
}> => {
	// Load expanding cards from database (or fallback data)
	const expandingCards = await loadExpandingCardsFromDatabase();

	// Determine if we're using the database or fallback data
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		expandingCards,
		usingDatabase
	};
};
