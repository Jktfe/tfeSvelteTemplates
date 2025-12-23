/**
 * Server utility for FolderFiles component
 *
 * Provides database integration for hierarchical folder/file viewer
 * with graceful fallback to constants when database is unavailable.
 *
 * @module lib/server/folderFiles
 */

import { neon } from '@neondatabase/serverless';
import type {
	Folder,
	FolderRow,
	FileItem,
	FileItemRow,
	FolderWithFiles,
	FileMetadata
} from '$lib/types';
import { FALLBACK_FOLDERS, FALLBACK_FILES } from '$lib/constants';

// ==================================================
// READ OPERATIONS
// ==================================================

/**
 * Load all folders from database
 *
 * @param category - Optional category filter
 * @returns Promise resolving to array of folders
 */
export async function loadFoldersFromDatabase(category?: string): Promise<Folder[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[FolderFiles] DATABASE_URL not configured, using fallback folders');
			return category
				? FALLBACK_FOLDERS.filter((f) => f.category === category)
				: FALLBACK_FOLDERS;
		}

		const sql = neon(databaseUrl);

		let rows: FolderRow[];
		if (category) {
			rows = (await sql`
        SELECT * FROM folders
        WHERE is_active = TRUE AND category = ${category}
        ORDER BY display_order ASC
      `) as FolderRow[];
		} else {
			rows = (await sql`
        SELECT * FROM folders
        WHERE is_active = TRUE
        ORDER BY display_order ASC
      `) as FolderRow[];
		}

		// Transform snake_case to camelCase
		return rows.map((row) => ({
			id: row.id,
			label: row.label,
			color: row.color,
			textColor: row.text_color,
			icon: row.icon ?? undefined,
			description: row.description ?? undefined,
			category: row.category
		}));
	} catch (err) {
		console.error('[FolderFiles] Error loading folders:', err);
		return FALLBACK_FOLDERS;
	}
}

/**
 * Load all files from database, optionally filtered by folder
 *
 * @param folderId - Optional folder ID to filter files
 * @returns Promise resolving to array of files
 */
export async function loadFilesFromDatabase(folderId?: number): Promise<FileItem[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[FolderFiles] DATABASE_URL not configured, using fallback files');
			return folderId
				? FALLBACK_FILES.filter((f) => f.folderId === folderId)
				: FALLBACK_FILES;
		}

		const sql = neon(databaseUrl);

		let rows: FileItemRow[];
		if (folderId) {
			rows = (await sql`
        SELECT * FROM files
        WHERE is_active = TRUE AND folder_id = ${folderId}
        ORDER BY display_order ASC
      `) as FileItemRow[];
		} else {
			rows = (await sql`
        SELECT * FROM files
        WHERE is_active = TRUE
        ORDER BY folder_id ASC, display_order ASC
      `) as FileItemRow[];
		}

		// Transform and parse JSON fields
		return rows.map((row) => ({
			id: row.id,
			folderId: row.folder_id,
			title: row.title,
			subtitle: row.subtitle ?? undefined,
			previewText: row.preview_text,
			content: row.content ?? undefined,
			pages: row.pages ? JSON.parse(row.pages) : undefined,
			thumbnailUrl: row.thumbnail_url ?? undefined,
			metadata: row.metadata ? (JSON.parse(row.metadata) as FileMetadata) : undefined,
			fileType: row.file_type as 'document' | 'image' | 'pdf' | 'text'
		}));
	} catch (err) {
		console.error('[FolderFiles] Error loading files:', err);
		return FALLBACK_FILES;
	}
}

/**
 * Load complete folder structure (folders with their files)
 *
 * @param category - Optional category filter
 * @returns Promise resolving to array of folders with files
 */
export async function loadFolderStructure(category?: string): Promise<FolderWithFiles[]> {
	const folders = await loadFoldersFromDatabase(category);
	const files = await loadFilesFromDatabase();

	return folders.map((folder) => ({
		folder,
		files: files.filter((file) => file.folderId === folder.id)
	}));
}

// ==================================================
// CREATE OPERATIONS
// ==================================================

/**
 * Create new folder
 *
 * @param folder - Folder data to create (id will be auto-generated)
 * @returns Promise resolving to created folder or null on error
 */
export async function createFolder(folder: Omit<Folder, 'id'>): Promise<Folder | null> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot create: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Get next display_order for this category
		const maxOrderResult = (await sql`
      SELECT COALESCE(MAX(display_order), 0) + 1 as max_order
      FROM folders
      WHERE category = ${folder.category || 'folderfiles-demo'}
    `) as Array<{ max_order: number }>;
		const max_order = maxOrderResult[0].max_order;

		const newRows = (await sql`
      INSERT INTO folders (
        label, color, text_color, icon, description, category, display_order
      ) VALUES (
        ${folder.label},
        ${folder.color},
        ${folder.textColor || 'text-white'},
        ${folder.icon || null},
        ${folder.description || null},
        ${folder.category || 'folderfiles-demo'},
        ${max_order}
      )
      RETURNING *
    `) as FolderRow[];
		const newRow = newRows[0];

		return {
			id: newRow.id,
			label: newRow.label,
			color: newRow.color,
			textColor: newRow.text_color,
			icon: newRow.icon ?? undefined,
			description: newRow.description ?? undefined,
			category: newRow.category
		};
	} catch (err) {
		console.error('[FolderFiles] Error creating folder:', err);
		return null;
	}
}

/**
 * Create new file
 *
 * @param file - File data to create (id will be auto-generated)
 * @returns Promise resolving to created file or null on error
 */
export async function createFile(file: Omit<FileItem, 'id'>): Promise<FileItem | null> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot create: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Get next display_order for this folder
		const maxOrderResult = (await sql`
      SELECT COALESCE(MAX(display_order), 0) + 1 as max_order
      FROM files
      WHERE folder_id = ${file.folderId}
    `) as Array<{ max_order: number }>;
		const max_order = maxOrderResult[0].max_order;

		const newRows = (await sql`
      INSERT INTO files (
        folder_id, title, subtitle, preview_text, content, pages,
        thumbnail_url, metadata, file_type, display_order
      ) VALUES (
        ${file.folderId},
        ${file.title},
        ${file.subtitle || null},
        ${file.previewText},
        ${file.content || null},
        ${file.pages ? JSON.stringify(file.pages) : null},
        ${file.thumbnailUrl || null},
        ${file.metadata ? JSON.stringify(file.metadata) : null},
        ${file.fileType || 'document'},
        ${max_order}
      )
      RETURNING *
    `) as FileItemRow[];
		const newRow = newRows[0];

		return {
			id: newRow.id,
			folderId: newRow.folder_id,
			title: newRow.title,
			subtitle: newRow.subtitle ?? undefined,
			previewText: newRow.preview_text,
			content: newRow.content ?? undefined,
			pages: newRow.pages ? JSON.parse(newRow.pages) : undefined,
			thumbnailUrl: newRow.thumbnail_url ?? undefined,
			metadata: newRow.metadata ? (JSON.parse(newRow.metadata) as FileMetadata) : undefined,
			fileType: newRow.file_type as 'document' | 'image' | 'pdf' | 'text'
		};
	} catch (err) {
		console.error('[FolderFiles] Error creating file:', err);
		return null;
	}
}

// ==================================================
// UPDATE OPERATIONS
// ==================================================

/**
 * Update existing folder
 *
 * @param id - Folder ID to update
 * @param folder - Partial folder data with fields to update
 * @returns Promise resolving to updated folder or null
 */
export async function updateFolder(id: number, folder: Partial<Folder>): Promise<Folder | null> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot update: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		const updatedRows = (await sql`
      UPDATE folders SET
        label = COALESCE(${folder.label}, label),
        color = COALESCE(${folder.color}, color),
        text_color = COALESCE(${folder.textColor}, text_color),
        icon = COALESCE(${folder.icon}, icon),
        description = COALESCE(${folder.description}, description),
        category = COALESCE(${folder.category}, category)
      WHERE id = ${id} AND is_active = TRUE
      RETURNING *
    `) as FolderRow[];
		const updatedRow = updatedRows[0];

		if (!updatedRow) return null;

		return {
			id: updatedRow.id,
			label: updatedRow.label,
			color: updatedRow.color,
			textColor: updatedRow.text_color,
			icon: updatedRow.icon ?? undefined,
			description: updatedRow.description ?? undefined,
			category: updatedRow.category
		};
	} catch (err) {
		console.error('[FolderFiles] Error updating folder:', err);
		return null;
	}
}

/**
 * Update existing file
 *
 * @param id - File ID to update
 * @param file - Partial file data with fields to update
 * @returns Promise resolving to updated file or null
 */
export async function updateFile(id: number, file: Partial<FileItem>): Promise<FileItem | null> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot update: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		const updatedRows = (await sql`
      UPDATE files SET
        folder_id = COALESCE(${file.folderId}, folder_id),
        title = COALESCE(${file.title}, title),
        subtitle = COALESCE(${file.subtitle}, subtitle),
        preview_text = COALESCE(${file.previewText}, preview_text),
        content = COALESCE(${file.content}, content),
        pages = COALESCE(${file.pages ? JSON.stringify(file.pages) : null}, pages),
        thumbnail_url = COALESCE(${file.thumbnailUrl}, thumbnail_url),
        metadata = COALESCE(${file.metadata ? JSON.stringify(file.metadata) : null}, metadata),
        file_type = COALESCE(${file.fileType}, file_type)
      WHERE id = ${id} AND is_active = TRUE
      RETURNING *
    `) as FileItemRow[];
		const updatedRow = updatedRows[0];

		if (!updatedRow) return null;

		return {
			id: updatedRow.id,
			folderId: updatedRow.folder_id,
			title: updatedRow.title,
			subtitle: updatedRow.subtitle ?? undefined,
			previewText: updatedRow.preview_text,
			content: updatedRow.content ?? undefined,
			pages: updatedRow.pages ? JSON.parse(updatedRow.pages) : undefined,
			thumbnailUrl: updatedRow.thumbnail_url ?? undefined,
			metadata: updatedRow.metadata ? (JSON.parse(updatedRow.metadata) as FileMetadata) : undefined,
			fileType: updatedRow.file_type as 'document' | 'image' | 'pdf' | 'text'
		};
	} catch (err) {
		console.error('[FolderFiles] Error updating file:', err);
		return null;
	}
}

// ==================================================
// DELETE OPERATIONS (Soft Delete)
// ==================================================

/**
 * Soft-delete folder (and cascade to files)
 *
 * @param id - Folder ID to delete
 * @returns Promise resolving to true if deleted, false otherwise
 */
export async function deleteFolder(id: number): Promise<boolean> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot delete: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Soft delete folder and its files
		await sql`
      UPDATE files
      SET is_active = FALSE
      WHERE folder_id = ${id}
    `;

		const result = (await sql`
      UPDATE folders
      SET is_active = FALSE
      WHERE id = ${id} AND is_active = TRUE
    `) as Array<Record<string, unknown>>;

		return result.length > 0;
	} catch (err) {
		console.error('[FolderFiles] Error deleting folder:', err);
		return false;
	}
}

/**
 * Soft-delete file
 *
 * @param id - File ID to delete
 * @returns Promise resolving to true if deleted, false otherwise
 */
export async function deleteFile(id: number): Promise<boolean> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('Cannot delete: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		const result = (await sql`
      UPDATE files
      SET is_active = FALSE
      WHERE id = ${id} AND is_active = TRUE
    `) as Array<Record<string, unknown>>;

		return result.length > 0;
	} catch (err) {
		console.error('[FolderFiles] Error deleting file:', err);
		return false;
	}
}
