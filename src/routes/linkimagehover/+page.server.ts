/**
 * LinkImageHover Page - Server Load Function
 *
 * Loads link preview data from the Neon database with graceful fallback to static data.
 * Separates links by category for different grid sections.
 */

import { loadLinkPreviewsFromDatabase } from '$lib/server/linkPreviews';
import type { LinkPreview } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the LinkImageHover demo page
 *
 * Loads link previews from database and separates them by category:
 * - cityLinks: Links to major cities (Mumbai, New York, Tokyo, London)
 * - natureLinks: Links to natural landmarks (Mount Everest, Amazon, Great Barrier Reef)
 *
 * Falls back to static data if DATABASE_URL is not configured.
 */
export const load: PageServerLoad = async (): Promise<{
	cityLinks: LinkPreview[];
	natureLinks: LinkPreview[];
	usingDatabase: boolean;
}> => {
	// Load link previews from database (or fallback data)
	const cityLinks = await loadLinkPreviewsFromDatabase('cities');
	const natureLinks = await loadLinkPreviewsFromDatabase('nature');

	// Determine if we're using the database or fallback data
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		cityLinks,
		natureLinks,
		usingDatabase
	};
};
