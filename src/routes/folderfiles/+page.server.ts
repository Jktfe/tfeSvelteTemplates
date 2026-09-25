/**
 * Server-side data loading for FolderFiles demo page
 *
 * Loads folders and files with graceful database fallback
 *
 * @module routes/folderfiles/+page.server
 */

import type { PageServerLoad } from './$types';
import { loadFoldersWithSource, loadFilesWithSource } from '$lib/server/folderFiles';
import { combineDataSources } from '$lib/server/dataSource';

export const load: PageServerLoad = async () => {
	const [folders, files] = await Promise.all([
		loadFoldersWithSource('folderfiles-demo'),
		loadFilesWithSource()
	]);
	// One badge for the page: if either query fell back or failed, say so.
	const status = combineDataSources(folders, files);

	return {
		folders: folders.data,
		files: files.data,
		usingDatabase: status.usingDatabase,
		dataSource: status.source,
		dataSourceMessage: status.message
	};
};
