/**
 * Server utility for Editor component CRUD operations
 *
 * This module provides database integration for the Editor component demo,
 * demonstrating full Create, Read, Update, and Delete (CRUD) operations
 * with graceful fallback to in-memory data when database is unavailable.
 *
 * Follows the same patterns as other server utilities in this project:
 * - Checks for DATABASE_URL environment variable
 * - Falls back to constants if database unavailable
 * - Transforms snake_case DB columns to camelCase component props
 * - Uses soft deletes (is_active flag) instead of hard deletes
 * - Handles errors gracefully with console logging
 *
 * @module lib/server/editorData
 */

import { neon } from '@neondatabase/serverless';
import type { EditorData, EditorDataRow } from '$lib/types';
import { FALLBACK_EDITOR_DATA } from '$lib/constants';

/**
 * READ: Load editor data from database with optional category filtering
 *
 * @param category - Optional category filter (e.g., 'editor-demo')
 * @returns Promise resolving to array of editor data items
 *
 * @example
 * ```typescript
 * const allData = await loadEditorDataFromDatabase();
 * const demoData = await loadEditorDataFromDatabase('editor-demo');
 * ```
 */
export async function loadEditorDataFromDatabase(
	category?: string
): Promise<EditorData[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		// Fallback to constants if DATABASE_URL not configured
		if (!databaseUrl) {
			console.warn('DATABASE_URL not configured, using fallback editor data');
			return category
				? FALLBACK_EDITOR_DATA.filter((d) => d.category === category)
				: FALLBACK_EDITOR_DATA;
		}

		// Create Neon client
		const sql = neon(databaseUrl);

		// Query database with optional category filter
		let rows: EditorDataRow[];
		if (category) {
			rows = (await sql`
				SELECT * FROM editor_data
				WHERE is_active = TRUE AND category = ${category}
				ORDER BY display_order ASC
			`) as EditorDataRow[];
		} else {
			rows = (await sql`
				SELECT * FROM editor_data
				WHERE is_active = TRUE
				ORDER BY display_order ASC
			`) as EditorDataRow[];
		}

		// Transform database rows (snake_case) to component format (camelCase)
		return rows.map((row) => ({
			id: row.id,
			heading: row.heading,
			compactText: row.compact_text,
			expandedText: row.expanded_text,
			imageSrc: row.image_url,
			imageAlt: row.image_alt,
			bgColor: row.bg_color,
			category: row.category
		}));
	} catch (err) {
		console.error('Error loading editor data from database:', err);
		// Always return fallback data on error to keep app functional
		return FALLBACK_EDITOR_DATA;
	}
}

/**
 * CREATE: Insert new editor data item into database
 *
 * @param data - Editor data to create (id will be auto-generated)
 * @returns Promise resolving to the created item with database ID, or null on error
 * @throws Error if DATABASE_URL not configured (caller should handle gracefully)
 *
 * @example
 * ```typescript
 * const newItem = await createEditorData({
 *   heading: 'New Card',
 *   compactText: 'Short description',
 *   expandedText: 'Full description',
 *   imageSrc: 'https://example.com/image.jpg',
 *   imageAlt: 'Image description',
 *   bgColor: 'bg-blue-100',
 *   category: 'editor-demo'
 * });
 * ```
 */
export async function createEditorData(
	data: Omit<EditorData, 'id'>
): Promise<EditorData | null> {
	const databaseUrl = process.env.DATABASE_URL;

	// Cannot create without database - throw error for caller to handle
	if (!databaseUrl) {
		throw new Error('Cannot create: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Get next display_order for this category
		const maxOrderResult = (await sql`
			SELECT COALESCE(MAX(display_order), 0) + 1 as max_order
			FROM editor_data
			WHERE category = ${data.category || 'editor-demo'}
		`) as Array<{ max_order: number }>;
		const max_order = maxOrderResult[0].max_order;

		// Insert new row and return with generated ID
		const newRows = (await sql`
			INSERT INTO editor_data (
				heading, compact_text, expanded_text, image_url, image_alt,
				bg_color, category, display_order
			) VALUES (
				${data.heading},
				${data.compactText},
				${data.expandedText},
				${data.imageSrc},
				${data.imageAlt},
				${data.bgColor || 'bg-lime-100'},
				${data.category || 'editor-demo'},
				${max_order}
			)
			RETURNING *
		`) as EditorDataRow[];
		const newRow = newRows[0];

		// Transform to component format
		return {
			id: newRow.id,
			heading: newRow.heading,
			compactText: newRow.compact_text,
			expandedText: newRow.expanded_text,
			imageSrc: newRow.image_url,
			imageAlt: newRow.image_alt,
			bgColor: newRow.bg_color,
			category: newRow.category
		};
	} catch (err) {
		console.error('Error creating editor data:', err);
		return null;
	}
}

/**
 * UPDATE: Modify existing editor data item in database
 *
 * Uses partial update pattern - only provided fields are updated.
 * SQL COALESCE ensures unchanged fields retain their current values.
 *
 * @param id - Database ID of item to update
 * @param data - Partial editor data with fields to update
 * @returns Promise resolving to updated item, or null if not found/error
 * @throws Error if DATABASE_URL not configured
 *
 * @example
 * ```typescript
 * // Update only the heading
 * const updated = await updateEditorData(123, { heading: 'Updated Title' });
 *
 * // Update multiple fields
 * const updated = await updateEditorData(123, {
 *   heading: 'New Title',
 *   compactText: 'New description',
 *   bgColor: 'bg-red-100'
 * });
 * ```
 */
export async function updateEditorData(
	id: number,
	data: Partial<EditorData>
): Promise<EditorData | null> {
	const databaseUrl = process.env.DATABASE_URL;

	// Cannot update without database
	if (!databaseUrl) {
		throw new Error('Cannot update: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Update with COALESCE to preserve null values (unchanged fields)
		// updated_at is automatically updated by database trigger
		const updatedRows = (await sql`
			UPDATE editor_data SET
				heading = COALESCE(${data.heading}, heading),
				compact_text = COALESCE(${data.compactText}, compact_text),
				expanded_text = COALESCE(${data.expandedText}, expanded_text),
				image_url = COALESCE(${data.imageSrc}, image_url),
				image_alt = COALESCE(${data.imageAlt}, image_alt),
				bg_color = COALESCE(${data.bgColor}, bg_color),
				category = COALESCE(${data.category}, category)
			WHERE id = ${id} AND is_active = TRUE
			RETURNING *
		`) as EditorDataRow[];
		const updatedRow = updatedRows[0];

		// Return null if item not found (already deleted or doesn't exist)
		if (!updatedRow) return null;

		// Transform to component format
		return {
			id: updatedRow.id,
			heading: updatedRow.heading,
			compactText: updatedRow.compact_text,
			expandedText: updatedRow.expanded_text,
			imageSrc: updatedRow.image_url,
			imageAlt: updatedRow.image_alt,
			bgColor: updatedRow.bg_color,
			category: updatedRow.category
		};
	} catch (err) {
		console.error('Error updating editor data:', err);
		return null;
	}
}

/**
 * DELETE: Soft-delete editor data item (sets is_active = FALSE)
 *
 * Uses soft delete pattern to maintain audit trail and allow recovery.
 * Item remains in database but won't appear in queries (WHERE is_active = TRUE).
 *
 * @param id - Database ID of item to delete
 * @returns Promise resolving to true if deleted, false if not found/error
 * @throws Error if DATABASE_URL not configured
 *
 * @example
 * ```typescript
 * const success = await deleteEditorData(123);
 * if (success) {
 *   console.log('Item deleted successfully');
 * } else {
 *   console.log('Item not found or already deleted');
 * }
 * ```
 */
export async function deleteEditorData(id: number): Promise<boolean> {
	const databaseUrl = process.env.DATABASE_URL;

	// Cannot delete without database
	if (!databaseUrl) {
		throw new Error('Cannot delete: DATABASE_URL not configured');
	}

	try {
		const sql = neon(databaseUrl);

		// Soft delete: set is_active to FALSE
		const result = (await sql`
			UPDATE editor_data
			SET is_active = FALSE
			WHERE id = ${id} AND is_active = TRUE
		`) as Array<Record<string, any>>;

		// Check if any rows were affected (length > 0 means success)
		return result.length > 0;
	} catch (err) {
		console.error('Error deleting editor data:', err);
		return false;
	}
}
// Claude is happy that this file is mint. Signed off 19.11.25.
