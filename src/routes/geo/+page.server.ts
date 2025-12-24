/**
 * Geo Demo Page Server Loader
 *
 * Fetches UK regions GeoJSON from ONS Open Geography Portal
 * with fallback to simplified data if fetch fails.
 */

import type { PageServerLoad } from './$types';
import { UK_REGIONS_GEOJSON_URL } from '$lib/constants';

export const load: PageServerLoad = async ({ fetch }) => {
	let geojson: GeoJSON.FeatureCollection | null = null;
	let usingFallback = false;

	try {
		// Fetch UK regions GeoJSON from ONS
		const response = await fetch(UK_REGIONS_GEOJSON_URL);
		if (response.ok) {
			geojson = await response.json();
		} else {
			console.warn('[Geo] Failed to fetch GeoJSON:', response.status);
			usingFallback = true;
		}
	} catch (error) {
		console.warn('[Geo] Error fetching GeoJSON:', error);
		usingFallback = true;
	}

	// If fetch failed, use a simplified UK outline
	if (!geojson) {
		geojson = createSimplifiedUKGeoJSON();
	}

	return {
		geojson,
		usingFallback
	};
};

/**
 * Create a simplified UK GeoJSON for fallback
 * Contains rough outlines of UK regions
 */
function createSimplifiedUKGeoJSON(): GeoJSON.FeatureCollection {
	return {
		type: 'FeatureCollection',
		features: [
			// England regions - simplified polygons
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000001', RGN24NM: 'North East', id: 'E12000001', name: 'North East' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-2.5, 54.5], [-1.0, 54.5], [-1.0, 55.8], [-2.5, 55.8], [-2.5, 54.5]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000002', RGN24NM: 'North West', id: 'E12000002', name: 'North West' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-3.5, 53.0], [-2.0, 53.0], [-2.0, 55.0], [-3.5, 55.0], [-3.5, 53.0]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000003', RGN24NM: 'Yorkshire and The Humber', id: 'E12000003', name: 'Yorkshire and The Humber' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-2.5, 53.3], [-0.2, 53.3], [-0.2, 54.5], [-2.5, 54.5], [-2.5, 53.3]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000004', RGN24NM: 'East Midlands', id: 'E12000004', name: 'East Midlands' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-1.8, 52.3], [0.5, 52.3], [0.5, 53.5], [-1.8, 53.5], [-1.8, 52.3]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000005', RGN24NM: 'West Midlands', id: 'E12000005', name: 'West Midlands' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-3.0, 52.0], [-1.5, 52.0], [-1.5, 53.0], [-3.0, 53.0], [-3.0, 52.0]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000006', RGN24NM: 'East of England', id: 'E12000006', name: 'East of England' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-0.5, 51.5], [1.8, 51.5], [1.8, 52.8], [-0.5, 52.8], [-0.5, 51.5]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000007', RGN24NM: 'London', id: 'E12000007', name: 'London' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-0.5, 51.3], [0.3, 51.3], [0.3, 51.7], [-0.5, 51.7], [-0.5, 51.3]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000008', RGN24NM: 'South East', id: 'E12000008', name: 'South East' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-1.5, 50.7], [1.5, 50.7], [1.5, 51.8], [-1.5, 51.8], [-1.5, 50.7]]]
				}
			},
			{
				type: 'Feature',
				properties: { RGN24CD: 'E12000009', RGN24NM: 'South West', id: 'E12000009', name: 'South West' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-5.7, 50.0], [-1.5, 50.0], [-1.5, 52.0], [-5.7, 52.0], [-5.7, 50.0]]]
				}
			},
			// Wales
			{
				type: 'Feature',
				properties: { RGN24CD: 'W92000004', RGN24NM: 'Wales', id: 'W92000004', name: 'Wales' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-5.3, 51.3], [-2.7, 51.3], [-2.7, 53.4], [-5.3, 53.4], [-5.3, 51.3]]]
				}
			},
			// Scotland
			{
				type: 'Feature',
				properties: { RGN24CD: 'S92000003', RGN24NM: 'Scotland', id: 'S92000003', name: 'Scotland' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-7.5, 54.6], [-0.7, 54.6], [-0.7, 60.8], [-7.5, 60.8], [-7.5, 54.6]]]
				}
			},
			// Northern Ireland
			{
				type: 'Feature',
				properties: { RGN24CD: 'N92000002', RGN24NM: 'Northern Ireland', id: 'N92000002', name: 'Northern Ireland' },
				geometry: {
					type: 'Polygon',
					coordinates: [[[-8.2, 54.0], [-5.4, 54.0], [-5.4, 55.4], [-8.2, 55.4], [-8.2, 54.0]]]
				}
			}
		]
	};
}
