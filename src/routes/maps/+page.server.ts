/**
 * Server-side data loading for Maps demo page
 *
 * Loads map markers from database with graceful fallback to constants.
 * Demonstrates the standard TFE pattern for data loading with DatabaseStatus support.
 */

import { loadMapMarkersFromDatabase, getMarkerCategories } from '$lib/server/maps';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const markers = await loadMapMarkersFromDatabase();
	const categories = await getMarkerCategories();
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		markers,
		categories,
		usingDatabase
	};
};
