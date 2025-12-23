/**
 * Server utilities for Map component data loading
 *
 * Provides database operations with graceful fallback to constants when DATABASE_URL is not configured.
 * This module handles:
 * - Loading map markers from Neon database or fallback constants
 * - Transforming database rows (snake_case) to component props (camelCase)
 * - CRUD operations for markers
 * - Error handling and logging
 */

import { neon } from '@neondatabase/serverless';
import type { MapMarker, MapMarkerRow, MapMarkerMetadata } from '$lib/types';
import { FALLBACK_MAP_MARKERS } from '$lib/constants';

/**
 * Load map markers from database with fallback to constants
 *
 * @param category - Optional category to filter markers
 * @returns Promise<MapMarker[]> - Array of map marker records
 *
 * Behavior:
 * - If DATABASE_URL is not set, returns FALLBACK_MAP_MARKERS
 * - If database query succeeds, returns transformed database rows
 * - If database query fails, logs error and returns FALLBACK_MAP_MARKERS
 * - Only returns active markers (is_active = TRUE)
 */
export async function loadMapMarkersFromDatabase(category?: string): Promise<MapMarker[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[Maps] DATABASE_URL not configured, using fallback marker data');
			if (category) {
				return FALLBACK_MAP_MARKERS.filter((m) => m.category === category);
			}
			return FALLBACK_MAP_MARKERS;
		}

		const sql = neon(databaseUrl);

		// Query active markers, optionally filtered by category
		let rows: MapMarkerRow[];
		if (category) {
			rows = (await sql`
				SELECT *
				FROM map_markers
				WHERE is_active = TRUE AND category = ${category}
				ORDER BY display_order ASC, created_at DESC
			`) as unknown as MapMarkerRow[];
		} else {
			rows = (await sql`
				SELECT *
				FROM map_markers
				WHERE is_active = TRUE
				ORDER BY display_order ASC, created_at DESC
			`) as unknown as MapMarkerRow[];
		}

		console.log(`[Maps] Loaded ${rows.length} markers from database`);

		// Transform database rows (snake_case) to component props (camelCase)
		return rows.map((row) => transformRowToMarker(row));
	} catch (error) {
		console.error('[Maps] Error loading markers from database:', error);
		console.warn('[Maps] Falling back to constant marker data');
		return FALLBACK_MAP_MARKERS;
	}
}

/**
 * Transform database row to MapMarker format
 */
function transformRowToMarker(row: MapMarkerRow): MapMarker {
	let metadata: MapMarkerMetadata | undefined;

	// Parse JSON metadata if present
	if (row.metadata) {
		try {
			metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
		} catch {
			console.warn(`[Maps] Failed to parse metadata for marker ${row.id}`);
		}
	}

	return {
		id: row.id,
		position: {
			lat: Number(row.latitude),
			lng: Number(row.longitude)
		},
		title: row.title,
		description: row.description || undefined,
		category: row.category,
		iconType: row.icon_type as MapMarker['iconType'],
		imageUrl: row.image_url || undefined,
		metadata
	};
}

/**
 * Get unique categories from markers
 *
 * @returns Promise<string[]> - Sorted array of unique categories
 */
export async function getMarkerCategories(): Promise<string[]> {
	const markers = await loadMapMarkersFromDatabase();
	const categories = new Set(markers.map((m) => m.category).filter(Boolean));
	return Array.from(categories).sort() as string[];
}

/**
 * Create a new map marker
 *
 * @param marker - Marker data (without ID)
 * @returns Promise<MapMarker | null> - Created marker with ID or null if failed
 */
export async function createMapMarker(
	marker: Omit<MapMarker, 'id'>
): Promise<MapMarker | null> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[Maps] DATABASE_URL not configured, cannot create marker');
			return null;
		}

		const sql = neon(databaseUrl);

		// Get next display_order
		const maxOrder = (await sql`
			SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
			FROM map_markers
		`) as unknown as { next_order: number }[];

		const result = (await sql`
			INSERT INTO map_markers (
				latitude, longitude, title, description, category,
				icon_type, image_url, metadata, display_order
			) VALUES (
				${marker.position.lat}, ${marker.position.lng}, ${marker.title},
				${marker.description || null}, ${marker.category || 'default'},
				${marker.iconType || 'default'}, ${marker.imageUrl || null},
				${marker.metadata ? JSON.stringify(marker.metadata) : null}::jsonb,
				${maxOrder[0].next_order}
			)
			RETURNING *
		`) as unknown as MapMarkerRow[];

		console.log(`[Maps] Created marker ${result[0].id}`);
		return transformRowToMarker(result[0]);
	} catch (error) {
		console.error('[Maps] Error creating marker:', error);
		return null;
	}
}

/**
 * Delete a map marker (soft delete)
 *
 * @param id - Marker ID to delete
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function deleteMapMarker(id: number): Promise<boolean> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[Maps] DATABASE_URL not configured, cannot delete marker');
			return false;
		}

		const sql = neon(databaseUrl);

		await sql`
			UPDATE map_markers
			SET is_active = FALSE
			WHERE id = ${id} AND is_active = TRUE
		`;

		console.log(`[Maps] Deleted marker ${id}`);
		return true;
	} catch (error) {
		console.error('[Maps] Error deleting marker:', error);
		return false;
	}
}

/**
 * Calculate map bounds to fit all markers
 *
 * @param markers - Array of markers
 * @returns Object with center and recommended zoom
 */
export function calculateMarkerBounds(markers: MapMarker[]): {
	center: { lat: number; lng: number };
	zoom: number;
} {
	if (markers.length === 0) {
		return { center: { lat: 51.5074, lng: -0.1278 }, zoom: 13 };
	}

	if (markers.length === 1) {
		return { center: markers[0].position, zoom: 15 };
	}

	const lats = markers.map((m) => m.position.lat);
	const lngs = markers.map((m) => m.position.lng);

	const center = {
		lat: (Math.min(...lats) + Math.max(...lats)) / 2,
		lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
	};

	// Calculate appropriate zoom based on spread
	const latSpread = Math.max(...lats) - Math.min(...lats);
	const lngSpread = Math.max(...lngs) - Math.min(...lngs);
	const maxSpread = Math.max(latSpread, lngSpread);

	let zoom = 13;
	if (maxSpread > 5) zoom = 6;
	else if (maxSpread > 2) zoom = 8;
	else if (maxSpread > 0.5) zoom = 10;
	else if (maxSpread > 0.1) zoom = 12;
	else if (maxSpread > 0.01) zoom = 14;
	else zoom = 15;

	return { center, zoom };
}
