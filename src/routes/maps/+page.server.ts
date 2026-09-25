/**
 * Server-side data loading for Maps demo page
 *
 * Loads map markers from database with graceful fallback to constants.
 * Demonstrates the standard TFE pattern for data loading with DatabaseStatus support.
 */

import { loadMapMarkersWithSource, getMarkerCategories } from '$lib/server/maps';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [result, categories] = await Promise.all([
		loadMapMarkersWithSource(),
		getMarkerCategories()
	]);

	return {
		markers: result.data,
		categories,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message
	};
};
