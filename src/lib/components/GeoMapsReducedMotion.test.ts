/**
 * Reduced-motion contract for the three LayerChart geo maps.
 *
 * Imports the components as raw source only (no LayerChart / d3 at runtime) so
 * this stays fast and clear of the heavy-module worker timeouts, and because
 * happy-dom cannot evaluate media queries anyway.
 */
import { describe, expect, it } from 'vitest';
import choropleth from './GeoChoropleth.svelte?raw';
import bubble from './GeoBubbleMap.svelte?raw';
import spike from './GeoSpikeMap.svelte?raw';

const styleOf = (source: string) =>
	source.slice(source.indexOf('<style>')).replace(/\/\*[\s\S]*?\*\//g, '');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cases: Array<[string, string, string]> = [
	['GeoChoropleth', choropleth, '.geo-choropleth :global(.region)'],
	['GeoBubbleMap', bubble, '.geo-bubble-map :global(.bubble)'],
	['GeoSpikeMap', spike, '.geo-spike-map :global(.spike)']
];

describe('geo map hover transitions honour prefers-reduced-motion', () => {
	it.each(cases)('%s disables its hover transition', (_name, source, selector) => {
		expect(styleOf(source)).toMatch(
			new RegExp(
				`@media \\(prefers-reduced-motion: reduce\\)\\s*\\{\\s*${escapeRegExp(selector)}\\s*\\{\\s*transition:\\s*none;`
			)
		);
	});
});
