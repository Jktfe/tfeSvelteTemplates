/**
 * Sankey page server-side data loading
 * Loads Sankey nodes and links from Neon database with fallback to constants
 */

import { loadSankeyDataWithSource } from '$lib/server/sankeyData';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const result = await loadSankeyDataWithSource('energy');

	return {
		sankeyData: result.data,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message
	};
};
