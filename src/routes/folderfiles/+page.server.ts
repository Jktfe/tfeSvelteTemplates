/**
 * Server-side data loading for FolderFiles demo page
 *
 * Loads folders and files with graceful database fallback
 *
 * @module routes/folderfiles/+page.server
 */

import type { PageServerLoad } from './$types';
import { loadFoldersFromDatabase, loadFilesFromDatabase } from '$lib/server/folderFiles';

export const load: PageServerLoad = async () => {
	// Load all folders and files for the demo category
	const folders = await loadFoldersFromDatabase('folderfiles-demo');
	const files = await loadFilesFromDatabase();

	// Check if database is configured
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		folders,
		files,
		usingDatabase
	};
};
