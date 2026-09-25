/**
 * LinkImageHover Page - Server Load Function
 *
 * Loads link preview data from the Neon database with graceful fallback to static data.
 * Separates links by category for different grid sections.
 */

import { loadLinkPreviewsWithSource } from '$lib/server/linkPreviews';
import { combineDataSources, type DataSourceStatus } from '$lib/server/dataSource';
import type { LinkPreview } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the LinkImageHover demo page
 *
 * Loads link previews from database and separates them by category:
 * - cityLinks: Links to major cities (Mumbai, New York, Tokyo, London)
 * - natureLinks: Links to natural landmarks (Mount Everest, Amazon, Great Barrier Reef)
 *
 * Falls back to static data if DATABASE_URL is not configured. The two
 * results are combined so one failing query is enough to flag the page.
 */
export const load: PageServerLoad = async (): Promise<{
	cityLinks: LinkPreview[];
	natureLinks: LinkPreview[];
	usingDatabase: boolean;
	dataSource: DataSourceStatus;
	dataSourceMessage?: string;
}> => {
	const [cities, nature] = await Promise.all([
		loadLinkPreviewsWithSource('cities'),
		loadLinkPreviewsWithSource('nature')
	]);
	const status = combineDataSources(cities, nature);

	return {
		cityLinks: cities.data,
		natureLinks: nature.data,
		usingDatabase: status.usingDatabase,
		dataSource: status.source,
		dataSourceMessage: status.message
	};
};
