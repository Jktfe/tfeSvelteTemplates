import type { PageServerLoad } from './$types';
import { isDatabaseConfigured } from '$lib/server/dataSource';
import { FALLBACK_SUNBURST_DATA, FALLBACK_SUNBURST_SALES } from '$lib/constants';

/**
 * Server-side data loading for Sunburst demo page
 * Uses fallback data directly (database integration can be added later)
 */
export const load: PageServerLoad = async () => {
	// Check if using database (for future integration)
	const usingDatabase = isDatabaseConfigured();

	return {
		fileSystemData: FALLBACK_SUNBURST_DATA,
		salesData: FALLBACK_SUNBURST_SALES,
		usingDatabase
	};
};
