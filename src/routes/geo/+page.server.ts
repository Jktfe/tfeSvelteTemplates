/**
 * Geo Demo Page Server Loader
 *
 * Fetches UK GeoJSON data from ONS Open Geography Portal:
 * - UK Countries: For bubble/spike maps (includes Scotland, Wales, NI)
 * - England Regions: For choropleth (detailed regional breakdown)
 *
 * ============================================================
 * 🌍 FINDING GEOJSON FOR OTHER GEOGRAPHIES
 * ============================================================
 *
 * UK Data (ONS Open Geography Portal):
 *   https://geoportal.statistics.gov.uk/
 *   - Search for "boundaries" + year + area type
 *   - Use FeatureServer REST API with f=geojson&outSR=4326
 *   - Example: Countries, Regions, Counties, Local Authorities
 *
 * US Data (Census Bureau):
 *   https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html
 *   - States, Counties, Congressional Districts
 *
 * World Data:
 *   https://github.com/datasets/geo-countries (Natural Earth)
 *   https://geojson-maps.ash.ms/ (Interactive selector)
 *
 * Europe:
 *   https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data
 *
 * Tips:
 *   - Always use WGS84 (EPSG:4326) for web maps
 *   - Simplify geometries for performance (mapshaper.org)
 *   - Cache GeoJSON server-side when possible
 * ============================================================
 */

import type { PageServerLoad } from './$types';
import { UK_REGIONS_GEOJSON_URL, UK_COUNTRIES_GEOJSON_URL } from '$lib/constants';

export const load: PageServerLoad = async ({ fetch }) => {
	let regionsGeojson: GeoJSON.FeatureCollection | null = null;
	let countriesGeojson: GeoJSON.FeatureCollection | null = null;
	let usingFallback = false;

	// Fetch both datasets in parallel
	const [regionsRes, countriesRes] = await Promise.all([
		fetch(UK_REGIONS_GEOJSON_URL).catch(() => null),
		fetch(UK_COUNTRIES_GEOJSON_URL).catch(() => null)
	]);

	// Process England Regions (for choropleth)
	if (regionsRes?.ok) {
		try {
			regionsGeojson = await regionsRes.json();
		} catch {
			console.warn('[Geo] Failed to parse regions GeoJSON');
		}
	}

	// Process UK Countries (for bubble/spike maps)
	if (countriesRes?.ok) {
		try {
			countriesGeojson = await countriesRes.json();
		} catch {
			console.warn('[Geo] Failed to parse countries GeoJSON');
		}
	}

	// Use fallback if neither worked
	if (!regionsGeojson && !countriesGeojson) {
		console.warn('[Geo] Using fallback GeoJSON');
		usingFallback = true;
		const fallback = createSimplifiedUKGeoJSON();
		regionsGeojson = fallback;
		countriesGeojson = fallback;
	}

	// If only one worked, use it for both
	if (!regionsGeojson) regionsGeojson = countriesGeojson;
	if (!countriesGeojson) countriesGeojson = regionsGeojson;

	return {
		geojson: regionsGeojson,          // For choropleth (England regions)
		countriesGeojson: countriesGeojson, // For bubble/spike (full UK)
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
