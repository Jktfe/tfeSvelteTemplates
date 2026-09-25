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
import { loadEditorDataWithSource } from '$lib/server/editorData';
import { checkAuth, isDemoUser } from '$lib/server/auth';

/**
 * Load editor data before page render
 *
 * @returns
 * - editorData: the rows to show
 * - usingDatabase / dataSource / dataSourceMessage: where they came from
 * - canPersist: whether saves should go through /editor/api. The API's write
 *   handlers are guarded by requireAuthAPI (401 anonymous, 403 demo user), so
 *   the page only takes the persistence path when the request would succeed;
 *   everyone else gets the in-memory demo instead of a failed save.
 */
export const load: PageServerLoad = async (event) => {
	const result = await loadEditorDataWithSource('editor-demo');
	const { authenticated } = checkAuth(event);

	return {
		editorData: result.data,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message,
		canPersist: result.usingDatabase && authenticated && !isDemoUser(event)
	};
};
