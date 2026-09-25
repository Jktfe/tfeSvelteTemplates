import type { PageServerLoad } from './$types';
import { FALLBACK_SUNBURST_DATA, FALLBACK_SUNBURST_SALES } from '$lib/constants';
import { fromStatic } from '$lib/server/dataSource';

/**
 * Server-side data loading for Sunburst demo page
 *
 * This route intentionally uses static demo data (there is no sunburst table
 * yet), so it reports `static` rather than guessing from DATABASE_URL — an
 * unrelated database being configured doesn't mean this data came from it.
 */
export const load: PageServerLoad = async () => {
	const status = fromStatic(null);

	return {
		fileSystemData: FALLBACK_SUNBURST_DATA,
		salesData: FALLBACK_SUNBURST_SALES,
		usingDatabase: status.usingDatabase,
		dataSource: status.source
	};
};
