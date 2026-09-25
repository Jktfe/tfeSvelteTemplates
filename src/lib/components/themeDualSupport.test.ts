/**
 * Dual-theme regression tests for the second theming wave.
 *
 * Each component below used to render light-only chrome. These tests pin
 * the pieces that make it follow prefers-color-scheme (see docs/THEMING.md)
 * so a future edit can't quietly drop the dark block or re-hard-code a
 * colour that has to flip.
 */
import { describe, expect, it } from 'vitest';
import { getCatalogEntryByHref } from '$lib/componentCatalog';
import { ACCURACY_CIRCLE_FALLBACK, readAccuracyCircleColour } from './MapLocateMe.svelte';

import geoBubbleMap from './GeoBubbleMap.svelte?raw';
import geoChoropleth from './GeoChoropleth.svelte?raw';
import geoSpikeMap from './GeoSpikeMap.svelte?raw';
import mapBasic from './MapBasic.svelte?raw';
import mapLive from './MapLive.svelte?raw';
import mapMarkers from './MapMarkers.svelte?raw';
import mapSearch from './MapSearch.svelte?raw';
import mapLocateMe from './MapLocateMe.svelte?raw';
import themeTokenInspector from './ThemeTokenInspector.svelte?raw';
import componentHealthMatrix from './ComponentHealthMatrix.svelte?raw';
import agentLaneBoard from './AgentLaneBoard.svelte?raw';
import evidenceCard from './EvidenceCard.svelte?raw';
import holoCard from './HoloCard.svelte?raw';
import routePreviewRail from './RoutePreviewRail.svelte?raw';
import commandPalette from './CommandPalette.svelte?raw';
import expandingCard from './ExpandingCard.svelte?raw';

const DARK_BLOCK = '@media (prefers-color-scheme: dark)';

const flippingSources: Record<string, string> = {
	GeoBubbleMap: geoBubbleMap,
	GeoChoropleth: geoChoropleth,
	GeoSpikeMap: geoSpikeMap,
	MapBasic: mapBasic,
	MapLive: mapLive,
	MapMarkers: mapMarkers,
	MapSearch: mapSearch,
	MapLocateMe: mapLocateMe,
	ThemeTokenInspector: themeTokenInspector,
	ComponentHealthMatrix: componentHealthMatrix,
	AgentLaneBoard: agentLaneBoard,
	EvidenceCard: evidenceCard,
	RoutePreviewRail: routePreviewRail,
	CommandPalette: commandPalette,
	ExpandingCard: expandingCard
};

/** The <style> block with every custom-property declaration line removed. */
function styleRulesWithoutTokenDeclarations(source: string): string {
	const start = source.indexOf('<style>');
	const end = source.lastIndexOf('</style>');
	return source
		.slice(start, end)
		.split('\n')
		.filter((line) => !/^\s*--[\w-]+\s*:/.test(line))
		.join('\n');
}

describe('dual-theme components ship a dark-scheme flip', () => {
	for (const [name, source] of Object.entries(flippingSources)) {
		it(`${name} declares a prefers-color-scheme: dark block`, () => {
			expect(source).toContain(DARK_BLOCK);
		});
	}

	it('HoloCard documents why it has no chrome to flip and exposes effect tokens', () => {
		expect(holoCard).toContain('no chrome of its own');
		expect(holoCard).toContain('--holo-foil-blend');
		expect(holoCard).toContain('mix-blend-mode: var(--holo-foil-blend)');
	});
});

describe('chrome colours route through tokens instead of literals', () => {
	it('Map components no longer paint white/#f0f0f0 chrome directly', () => {
		for (const source of [mapBasic, mapLive, mapMarkers, mapSearch]) {
			const rules = styleRulesWithoutTokenDeclarations(source);
			expect(rules).not.toMatch(/background(-color)?:\s*(white|#fff\b|#ffffff|#f0f0f0|#f5f5f5)/);
			expect(rules).not.toMatch(/\bcolor:\s*#(333|666|555)\b/);
		}
	});

	it('Map components theme Leaflet popups and attribution', () => {
		for (const source of [mapBasic, mapLive, mapMarkers, mapSearch, mapLocateMe]) {
			expect(source).toContain(':global(.leaflet-popup-content-wrapper)');
			expect(source).toContain(':global(.leaflet-control-attribution)');
		}
	});

	it('Geo components paint land and legends from tokens', () => {
		for (const source of [geoBubbleMap, geoSpikeMap]) {
			expect(source).toContain('fill: var(--geo-land-fill)');
		}
		for (const source of [geoBubbleMap, geoSpikeMap, geoChoropleth]) {
			const rules = styleRulesWithoutTokenDeclarations(source);
			expect(rules).not.toMatch(/background:\s*(white|#f9fafb)/);
		}
	});

	it('GeoChoropleth marks regions without data so their fill can flip', () => {
		expect(geoChoropleth).toContain("'region region--no-data'");
		expect(geoChoropleth).toContain('fill: var(--geo-no-data)');
	});

	it('CommandPalette keeps no hard-coded slate chrome outside its token block', () => {
		const rules = styleRulesWithoutTokenDeclarations(commandPalette);
		expect(rules).not.toMatch(/#(fff|e2e8f0|1e293b|f1f5f9|f8fafc)\b/);
	});

	it('ExpandingCard derives its dark surface on the element that owns --ec-bg', () => {
		// --ec-bg is an inline style on the button, so a var() on the shell
		// would resolve too early and paint every card lime.
		expect(expandingCard).toMatch(/\.layouta \{\s*--ec-surface: color-mix\(in srgb, var\(--ec-bg/);
		expect(expandingCard).not.toMatch(/\.expanding-card-shell \{[^}]*--ec-surface/);
	});
});

describe('MapLocateMe accuracy circle colour', () => {
	it('falls back to the light accent when no element is available', () => {
		expect(readAccuracyCircleColour(null)).toBe(ACCURACY_CIRCLE_FALLBACK);
		expect(readAccuracyCircleColour(undefined, '#123456')).toBe('#123456');
	});

	it('reads --mlm-accuracy-circle from the element so it follows the theme', () => {
		const el = document.createElement('div');
		el.style.setProperty('--mlm-accuracy-circle', '#3b82f6');
		document.body.appendChild(el);
		expect(readAccuracyCircleColour(el)).toBe('#3b82f6');
		el.remove();
	});

	it('falls back when the token is empty', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		expect(readAccuracyCircleColour(el)).toBe(ACCURACY_CIRCLE_FALLBACK);
		el.remove();
	});

	it('no longer hard-codes the circle colour in the Leaflet options', () => {
		expect(mapLocateMe).not.toMatch(/color:\s*'#146ef5'/);
		expect(mapLocateMe).toContain('--mlm-accuracy-circle: var(--mlm-accent)');
	});
});

describe('catalogue theme support', () => {
	const dualRoutes = [
		'/maps',
		'/location',
		'/geo',
		'/themetokeninspector',
		'/componenthealthmatrix',
		'/agentlaneboard',
		'/evidencecard',
		'/holocard',
		'/routepreviewrail',
		'/commandpalette',
		'/expandingcard'
	];

	for (const href of dualRoutes) {
		it(`${href} is marked dual`, () => {
			expect(getCatalogEntryByHref(href)?.item.themeSupport).toBe('dual');
		});
	}
});
