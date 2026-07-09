/**
 * Server-side data loading for FolderFiles demo page
 *
 * Loads folders and files with graceful database fallback
 *
 * @module routes/folderfiles/+page.server
 */

import type { PageServerLoad } from './$types';
import { isDatabaseConfigured } from '$lib/server/dataSource';
import { loadFoldersFromDatabase, loadFilesFromDatabase } from '$lib/server/folderFiles';

export const load: PageServerLoad = async () => {
	// Load all folders and files for the demo category
	const folders = await loadFoldersFromDatabase('folderfiles-demo');
	const files = await loadFilesFromDatabase();

	// Check if database is configured
	const usingDatabase = isDatabaseConfigured();

	return {
		folders,
		files,
		usingDatabase
	};
};
