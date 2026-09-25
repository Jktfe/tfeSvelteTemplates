/**
 * ExpandingCard Page - Server Load Function
 *
 * Loads expanding card data from the Neon database with graceful fallback to static data.
 */

import { loadExpandingCardsWithSource } from '$lib/server/expandingCards';
import type { DataSourceStatus } from '$lib/server/dataSource';
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
	dataSource: DataSourceStatus;
	dataSourceMessage?: string;
}> => {
	const result = await loadExpandingCardsWithSource();

	return {
		expandingCards: result.data,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message
	};
};
