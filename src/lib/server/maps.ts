/**
 * Server utilities for Map component data loading
 *
 * Provides database operations with graceful fallback to constants when DATABASE_URL is not configured
 * (a missing URL and the .env.example placeholder are treated the same).
 * This module handles:
 * - Loading map markers from Neon database or fallback constants
 * - Transforming database rows (snake_case) to component props (camelCase)
 * - CRUD operations for markers
 * - Error handling and logging
 */

import { neon } from '@neondatabase/serverless';
import type { MapMarker, MapMarkerRow, MapMarkerMetadata } from '$lib/types';
import { FALLBACK_MAP_MARKERS } from '$lib/constants';
import { calculateMapBounds } from '$lib/mapUtils';
import { getConfiguredDatabaseUrl, loadWithFallback, type DataSourceResult } from './dataSource';

/**
 * Load map markers plus where they came from (database / fallback / error).
 *
 * - Not configured (missing or placeholder URL) → FALLBACK_MAP_MARKERS, source `fallback`
 * - Query succeeds → active markers, transformed to camelCase
 * - `map_markers` table missing → fallback with a hint to run schema_maps.sql
 * - Any other failure → FALLBACK_MAP_MARKERS, source `error`
 *
 * The fallback is filtered by the same category on every non-database path.
 *
 * @param category - Optional category to filter markers
 */
export async function loadMapMarkersWithSource(
	category?: string
): Promise<DataSourceResult<MapMarker[]>> {
	const fallback = category
		? FALLBACK_MAP_MARKERS.filter((m) => m.category === category)
		: FALLBACK_MAP_MARKERS;

	return loadWithFallback(
		fallback,
		async (databaseUrl) => {
			const sql = neon(databaseUrl);

			const rows = (
				category
					? await sql`
						SELECT *
						FROM map_markers
						WHERE is_active = TRUE AND category = ${category}
						ORDER BY display_order ASC, created_at DESC
					`
					: await sql`
						SELECT *
						FROM map_markers
						WHERE is_active = TRUE
						ORDER BY display_order ASC, created_at DESC
					`
			) as unknown as MapMarkerRow[];

			return rows.map((row) => transformRowToMarker(row));
		},
		{ label: 'Maps', schemaFile: 'schema_maps.sql' }
	);
}

/**
 * Load map markers from database with fallback to constants (rows only).
 *
 * @param category - Optional category to filter markers
 */
export async function loadMapMarkersFromDatabase(category?: string): Promise<MapMarker[]> {
	return (await loadMapMarkersWithSource(category)).data;
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
 * Uses SELECT DISTINCT for efficiency rather than loading all markers
 *
 * @returns Promise<string[]> - Sorted array of unique categories
 */
export async function getMarkerCategories(): Promise<string[]> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		return fallbackMarkerCategories();
	}

	try {
		const sql = neon(databaseUrl);

		// Use SELECT DISTINCT for efficiency
		const rows = (await sql`
			SELECT DISTINCT category
			FROM map_markers
			WHERE is_active = TRUE AND category IS NOT NULL
			ORDER BY category ASC
		`) as unknown as { category: string }[];

		return rows.map((r) => r.category);
	} catch (error) {
		console.error('[Maps] Error loading categories:', error);
		return fallbackMarkerCategories();
	}
}

/** Unique, sorted categories from the fixture markers. */
function fallbackMarkerCategories(): string[] {
	const categories = new Set(FALLBACK_MAP_MARKERS.map((m) => m.category).filter(Boolean));
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
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[Maps] DATABASE_URL not configured, cannot create marker');
		return null;
	}

	try {
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
 * @returns Promise<boolean> - True if a marker was deleted, false if not configured / not found / failed
 */
export async function deleteMapMarker(id: number): Promise<boolean> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[Maps] DATABASE_URL not configured, cannot delete marker');
		return false;
	}

	try {
		const sql = neon(databaseUrl);

		// RETURNING id lets us report "nothing matched" honestly — the Neon HTTP
		// driver returns rows rather than an affected-row count.
		const result = (await sql`
			UPDATE map_markers
			SET is_active = FALSE
			WHERE id = ${id} AND is_active = TRUE
			RETURNING id
		`) as unknown as Array<{ id: number }>;

		return result.length > 0;
	} catch (error) {
		console.error('[Maps] Error deleting marker:', error);
		return false;
	}
}

/**
 * Calculate map bounds to fit all markers
 * Wrapper around shared calculateMapBounds utility
 *
 * @param markers - Array of markers
 * @returns Object with center and recommended zoom
 */
export function calculateMarkerBounds(markers: MapMarker[]): {
	center: { lat: number; lng: number };
	zoom: number;
} {
	return calculateMapBounds(markers.map((m) => m.position));
}
