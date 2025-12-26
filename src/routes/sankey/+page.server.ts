/**
 * Sankey page server-side data loading
 * Loads Sankey nodes and links from Neon database with fallback to constants
 */

import { loadSankeyDataFromDatabase } from '$lib/server/sankeyData';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const sankeyData = await loadSankeyDataFromDatabase('energy');
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		sankeyData,
		usingDatabase
	};
};
