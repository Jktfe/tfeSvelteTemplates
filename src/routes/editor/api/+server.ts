/**
 * REST API endpoints for Editor CRUD operations
 *
 * This file implements standard HTTP methods for Create, Read, Update, and Delete
 * operations on editor data. It demonstrates best practices for SvelteKit API routes:
 * - Type-safe request handlers with RequestHandler type
 * - Proper HTTP status codes (200, 201, 400, 404, 500)
 * - JSON request/response handling
 * - Error handling with descriptive messages
 * - Integration with server utilities
 *
 * @module routes/editor/api
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	loadEditorDataFromDatabase,
	createEditorData,
	updateEditorData,
	deleteEditorData
} from '$lib/server/editorData';

/**
 * GET - Read all editor data items
 *
 * Query Parameters:
 * - category (optional): Filter by category (e.g., '?category=editor-demo')
 *
 * Response: { data: EditorData[] }
 *
 * @example
 * ```typescript
 * // Fetch all items
 * const res = await fetch('/editor/api');
 * const { data } = await res.json();
 *
 * // Fetch items by category
 * const res = await fetch('/editor/api?category=editor-demo');
 * const { data } = await res.json();
 * ```
 */
export const GET: RequestHandler = async ({ url }) => {
	const category = url.searchParams.get('category') || undefined;

	try {
		const data = await loadEditorDataFromDatabase(category);
		return json({ data });
	} catch (err) {
		console.error('GET /editor/api failed:', err);
		throw error(500, { message: 'Failed to load editor data' });
	}
};

/**
 * POST - Create new editor data item
 *
 * Request Body: EditorData (without id)
 * {
 *   heading: string;
 *   compactText: string;
 *   expandedText: string;
 *   imageSrc: string;
 *   imageAlt: string;
 *   bgColor?: string;
 *   category?: string;
 * }
 *
 * Response: { success: true, data: EditorData } (status 201)
 * Error: { message: string } (status 500)
 *
 * @example
 * ```typescript
 * const res = await fetch('/editor/api', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     heading: 'New Card',
 *     compactText: 'Short description',
 *     expandedText: 'Full description',
 *     imageSrc: 'https://example.com/image.jpg',
 *     imageAlt: 'Image alt text',
 *     bgColor: 'bg-blue-100',
 *     category: 'editor-demo'
 *   })
 * });
 * const { data } = await res.json();
 * ```
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Basic validation
		if (!body.heading || !body.compactText || !body.expandedText || !body.imageSrc || !body.imageAlt) {
			throw error(400, { message: 'Missing required fields: heading, compactText, expandedText, imageSrc, imageAlt' });
		}

		const newItem = await createEditorData(body);

		if (!newItem) {
			throw error(500, { message: 'Failed to create item' });
		}

		return json({ success: true, data: newItem }, { status: 201 });
	} catch (err) {
		console.error('POST /editor/api failed:', err);
		// Re-throw if already an HTTP error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// Check for specific error message from server utility
		if (err instanceof Error && err.message.includes('DATABASE_URL')) {
			throw error(503, { message: 'Database not configured. Cannot create items without database connection.' });
		}
		throw error(500, { message: 'Failed to create item' });
	}
};

/**
 * PUT - Update existing editor data item
 *
 * Request Body: Partial<EditorData> with id
 * {
 *   id: number;
 *   heading?: string;
 *   compactText?: string;
 *   expandedText?: string;
 *   imageSrc?: string;
 *   imageAlt?: string;
 *   bgColor?: string;
 *   category?: string;
 * }
 *
 * Response: { success: true, data: EditorData } (status 200)
 * Error: { message: string } (status 400, 404, or 500)
 *
 * @example
 * ```typescript
 * const res = await fetch('/editor/api', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     id: 123,
 *     heading: 'Updated Title'
 *   })
 * });
 * const { data } = await res.json();
 * ```
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const { id, ...data } = await request.json();

		// Validate ID is present
		if (!id) {
			throw error(400, { message: 'ID required for update' });
		}

		const updated = await updateEditorData(id, data);

		// Item not found (may be deleted or never existed)
		if (!updated) {
			throw error(404, { message: 'Item not found or has been deleted' });
		}

		return json({ success: true, data: updated });
	} catch (err) {
		console.error('PUT /editor/api failed:', err);
		// Re-throw if already an HTTP error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// Check for database not configured error
		if (err instanceof Error && err.message.includes('DATABASE_URL')) {
			throw error(503, { message: 'Database not configured. Cannot update items without database connection.' });
		}
		throw error(500, { message: 'Failed to update item' });
	}
};

/**
 * DELETE - Soft delete editor data item
 *
 * Query Parameters:
 * - id (required): ID of item to delete (e.g., '?id=123')
 *
 * Response: { success: true } (status 200)
 * Error: { message: string } (status 400, 404, or 500)
 *
 * @example
 * ```typescript
 * const res = await fetch('/editor/api?id=123', {
 *   method: 'DELETE'
 * });
 * const { success } = await res.json();
 * ```
 */
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = parseInt(url.searchParams.get('id') || '');

		// Validate ID is present and is a number
		if (!id || isNaN(id)) {
			throw error(400, { message: 'Valid ID required for delete' });
		}

		const success = await deleteEditorData(id);

		// Item not found (may be already deleted or never existed)
		if (!success) {
			throw error(404, { message: 'Item not found or already deleted' });
		}

		return json({ success: true });
	} catch (err) {
		console.error('DELETE /editor/api failed:', err);
		// Re-throw if already an HTTP error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// Check for database not configured error
		if (err instanceof Error && err.message.includes('DATABASE_URL')) {
			throw error(503, { message: 'Database not configured. Cannot delete items without database connection.' });
		}
		throw error(500, { message: 'Failed to delete item' });
	}
};
