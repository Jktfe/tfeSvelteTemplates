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
import { loadCardsWithSource } from '$lib/server/cards';
import type { DataSourceStatus } from '$lib/server/dataSource';

export const load: PageServerLoad = async (): Promise<{
	cards: Card[];
	usingDatabase: boolean;
	dataSource: DataSourceStatus;
	dataSourceMessage?: string;
}> => {
	// usingDatabase comes from the result, not from "is DATABASE_URL set?", so a
	// placeholder URL or a failed query is reported honestly as not-connected.
	const result = await loadCardsWithSource();

	return {
		cards: result.data,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message
	};
};
