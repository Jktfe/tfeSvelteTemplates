/**
 * Server-side data loading for Editor demo page
 *
 * This file demonstrates the standard SvelteKit pattern for loading data
 * on the server before rendering the page. It integrates with the graceful
 * fallback pattern used throughout the application.
 *
 * @module routes/editor/+page.server
 */

import type { PageServerLoad } from './$types';
import { loadEditorDataFromDatabase } from '$lib/server/editorData';

/**
 * Load editor data before page render
 *
 * This function runs on the server for every page request.
 * It fetches editor data and checks database connection status.
 *
 * @returns Object with editorData array and usingDatabase boolean
 */
export const load: PageServerLoad = async () => {
	// Load all editor demo data
	const editorData = await loadEditorDataFromDatabase('editor-demo');

	// Check if database is configured
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		editorData,
		usingDatabase
	};
};
