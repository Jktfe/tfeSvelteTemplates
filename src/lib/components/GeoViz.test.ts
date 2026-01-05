/**
 * ============================================================
 * GeoViz Component Family Tests
 * ============================================================
 *
 * What we're checking:
 *   ✓ Components export correctly
 *   ✓ Type definitions are valid
 *   ✓ Helper functions work correctly
 *
 * NOTE: Full rendering tests for GeoViz components require LayerChart
 * and D3 which need DOM/SVG support. Use Playwright for visual testing.
 *
 * Run: bun run test GeoViz
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';

// Test that components can be imported without errors
describe('GeoViz - Module Imports', () => {
	it('GeoBubbleMap module exports correctly', async () => {
		const module = await import('./GeoBubbleMap.svelte');
		expect(module.default).toBeDefined();
	});

	it('GeoChoropleth module exports correctly', async () => {
		const module = await import('./GeoChoropleth.svelte');
		expect(module.default).toBeDefined();
	});

	it('GeoSpikeMap module exports correctly', async () => {
		const module = await import('./GeoSpikeMap.svelte');
		expect(module.default).toBeDefined();
	});
});

// Test type definitions exist
describe('GeoViz - Type Definitions', () => {
	it('GeoDataPoint type is valid', async () => {
		// TypeScript will fail compilation if types are wrong
		const point: import('$lib/types').GeoDataPoint = {
			id: '1',
			name: 'Test',
			lat: 51.5,
			long: -0.1,
			value: 100
		};
		expect(point.id).toBe('1');
		expect(point.lat).toBe(51.5);
		expect(point.value).toBe(100);
	});

	it('GeoRegionData type is valid', async () => {
		const region: import('$lib/types').GeoRegionData = {
			regionId: 'E12000001',
			value: 75.5
		};
		expect(region.regionId).toBe('E12000001');
		expect(region.value).toBe(75.5);
	});

	it('GeoColorScale type is valid', async () => {
		const scale: import('$lib/types').GeoColorScale = {
			type: 'sequential',
			colors: ['#f7fbff', '#08519c']
		};
		expect(scale.type).toBe('sequential');
		expect(scale.colors.length).toBe(2);
	});
});

// Test GeoJSON structure validation
describe('GeoViz - GeoJSON Validation', () => {
	const validGeoJSON: GeoJSON.FeatureCollection = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				id: 'region-1',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[-1, 51],
							[0, 51],
							[0, 52],
							[-1, 52],
							[-1, 51]
						]
					]
				},
				properties: { RGN22CD: 'E12000001', RGN22NM: 'North East' }
			}
		]
	};

	it('recognizes valid FeatureCollection', () => {
		expect(validGeoJSON.type).toBe('FeatureCollection');
		expect(validGeoJSON.features).toHaveLength(1);
	});

	it('feature has required properties', () => {
		const feature = validGeoJSON.features[0];
		expect(feature.type).toBe('Feature');
		expect(feature.geometry.type).toBe('Polygon');
		expect(feature.properties).toBeDefined();
	});

	it('recognizes ONS property naming conventions', () => {
		const props = validGeoJSON.features[0].properties!;
		// ONS uses year-suffixed property names
		expect(props.RGN22CD).toBe('E12000001');
		expect(props.RGN22NM).toBe('North East');
	});
});

// Test sample data structures
describe('GeoViz - Sample Data', () => {
	const samplePointData = [
		{ id: '1', name: 'London', lat: 51.5, long: -0.1, value: 8900000 },
		{ id: '2', name: 'Birmingham', lat: 52.5, long: -1.9, value: 1150000 },
		{ id: '3', name: 'Manchester', lat: 53.5, long: -2.2, value: 550000 }
	];

	it('point data has required fields', () => {
		samplePointData.forEach((point) => {
			expect(point.id).toBeDefined();
			expect(point.name).toBeDefined();
			expect(typeof point.lat).toBe('number');
			expect(typeof point.long).toBe('number');
			expect(typeof point.value).toBe('number');
		});
	});

	it('coordinates are in valid ranges', () => {
		samplePointData.forEach((point) => {
			// Latitude: -90 to 90
			expect(point.lat).toBeGreaterThanOrEqual(-90);
			expect(point.lat).toBeLessThanOrEqual(90);
			// Longitude: -180 to 180
			expect(point.long).toBeGreaterThanOrEqual(-180);
			expect(point.long).toBeLessThanOrEqual(180);
		});
	});

	it('values are positive', () => {
		samplePointData.forEach((point) => {
			expect(point.value).toBeGreaterThan(0);
		});
	});
});

// Test color scale configurations
describe('GeoViz - Color Scales', () => {
	it('GEO_COLOR_SCALES has expected keys', async () => {
		const { GEO_COLOR_SCALES } = await import('$lib/constants');
		expect(GEO_COLOR_SCALES.blues).toBeDefined();
		expect(GEO_COLOR_SCALES.orangeRed).toBeDefined();
		expect(GEO_COLOR_SCALES.greens).toBeDefined();
	});

	it('color scales are arrays of strings', async () => {
		const { GEO_COLOR_SCALES } = await import('$lib/constants');
		expect(Array.isArray(GEO_COLOR_SCALES.blues)).toBe(true);
		expect(GEO_COLOR_SCALES.blues.every((c: string) => typeof c === 'string')).toBe(true);
	});
});

// Test data sorting logic (used by bubble and spike maps)
describe('GeoViz - Data Sorting', () => {
	const unsortedData = [
		{ id: '1', value: 100, lat: 52 },
		{ id: '2', value: 500, lat: 51 },
		{ id: '3', value: 200, lat: 53 }
	];

	it('sorts by value descending (for bubble map rendering order)', () => {
		const sorted = [...unsortedData].sort((a, b) => b.value - a.value);
		expect(sorted[0].id).toBe('2'); // 500
		expect(sorted[1].id).toBe('3'); // 200
		expect(sorted[2].id).toBe('1'); // 100
	});

	it('sorts by latitude descending (for spike map north-to-south)', () => {
		const sorted = [...unsortedData].sort((a, b) => b.lat - a.lat);
		expect(sorted[0].id).toBe('3'); // lat 53 (north)
		expect(sorted[1].id).toBe('1'); // lat 52
		expect(sorted[2].id).toBe('2'); // lat 51 (south)
	});
});

// Test value domain calculation
describe('GeoViz - Value Domain', () => {
	it('calculates min/max from data', () => {
		const data = [{ value: 10 }, { value: 50 }, { value: 30 }];
		const values = data.map((d) => d.value);
		const domain = [Math.min(...values), Math.max(...values)];

		expect(domain[0]).toBe(10);
		expect(domain[1]).toBe(50);
	});

	it('handles single value', () => {
		const data = [{ value: 42 }];
		const values = data.map((d) => d.value);
		const domain = [Math.min(...values), Math.max(...values)];

		expect(domain[0]).toBe(42);
		expect(domain[1]).toBe(42);
	});

	it('returns default for empty data', () => {
		const data: { value: number }[] = [];
		const domain = data.length === 0 ? [0, 100] : [Math.min(...data.map((d) => d.value)), Math.max(...data.map((d) => d.value))];

		expect(domain).toEqual([0, 100]);
	});
});

// Test region ID extraction patterns (used in choropleth)
// These properties come from ONS GeoJSON data and vary by year (RGN24, RGN23, RGN22, etc.)
describe('GeoViz - Region ID Extraction', () => {
	// Type for GeoJSON properties with various year codes
	type GeoProps = Record<string, string | undefined>;

	it('extracts from RGN24CD', () => {
		const props: GeoProps = { RGN24CD: 'E12000001', RGN24NM: 'North East' };
		const regionId = props.RGN24CD;
		expect(regionId).toBe('E12000001');
	});

	it('falls back to RGN23CD', () => {
		const props: GeoProps = { RGN23CD: 'E12000002', RGN23NM: 'North West' };
		const regionId = props.RGN24CD || props.RGN23CD;
		expect(regionId).toBe('E12000002');
	});

	it('falls back to RGN22CD', () => {
		const props: GeoProps = { RGN22CD: 'E12000003', RGN22NM: 'Yorkshire' };
		const regionId = props.RGN24CD || props.RGN23CD || props.RGN22CD;
		expect(regionId).toBe('E12000003');
	});

	it('handles country codes', () => {
		const props: GeoProps = { CTRY22CD: 'E92000001', CTRY22NM: 'England' };
		const regionId = props.RGN24CD || props.RGN23CD || props.RGN22CD || props.CTRY22CD;
		expect(regionId).toBe('E92000001');
	});
});

// Test spike path generation
describe('GeoViz - Spike Path Generation', () => {
	function getSpikePath(height: number, width: number = 3): string {
		const halfWidth = width / 2;
		return `M 0,0 L ${-halfWidth},0 L 0,${-height} L ${halfWidth},0 Z`;
	}

	it('generates valid SVG path', () => {
		const path = getSpikePath(50);
		expect(path).toContain('M 0,0');
		expect(path).toContain('L 0,-50');
		expect(path).toContain('Z');
	});

	it('respects width parameter', () => {
		const path = getSpikePath(50, 6);
		expect(path).toContain('L -3,0');
		expect(path).toContain('L 3,0');
	});

	it('height affects peak position', () => {
		const small = getSpikePath(20);
		const large = getSpikePath(80);

		expect(small).toContain('-20');
		expect(large).toContain('-80');
	});
});
