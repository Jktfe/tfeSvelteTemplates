/**
 * ============================================================
 * Per-instance id regression tests
 * ============================================================
 *
 * These components used to hard-code ids that other attributes point at
 * (aria-labelledby, aria-controls, aria-describedby, label[for], SVG
 * url(#...) / href="#..."). Mounting any of them twice produced duplicate
 * ids, so the second instance's references silently resolved to the first
 * instance's elements. Each now derives its ids from `$props.id()`.
 *
 * For every component we mount two instances and assert that:
 *   1. no id is used twice in the document, and
 *   2. every id reference inside an instance resolves to an element inside
 *      that same instance.
 * ============================================================
 */

import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import type { Component } from 'svelte';
import type { ExplainerCard } from '$lib/types';

import Accordion from './Accordion.svelte';
import AnimatedBeam from './AnimatedBeam.svelte';
import AnimatedText from './AnimatedText.svelte';
import CopyPasteComposer, { type CopyPasteCatalogEntry } from './CopyPasteComposer.svelte';
import DataGridFilters from './DataGridFilters.svelte';
import DataVizInspector, { type DataVizSpec } from './DataVizInspector.svelte';
import Editor from './Editor.svelte';
import GsapSplitTextHero from './GsapSplitTextHero.svelte';
import InteractionLab, { type InteractionScenario } from './InteractionLab.svelte';
import LiquidTabBar from './LiquidTabBar.svelte';
import MembraneSurface from './MembraneHero/MembraneSurface.svelte';
import RippleGrid from './RippleGrid.svelte';
import Tabs from './Tabs.svelte';
import TokenSwatchGrid, { type TokenSwatch } from './TokenSwatchGrid.svelte';
import TopologyColorGrid from './TopologyColorGrid.svelte';
import UploadDropzone from './UploadDropzone.svelte';
import WaveText from './WaveText.svelte';
import ConnectionLines from './ExplainerCanvas/ConnectionLines.svelte';
import SearchPanel from './ExplainerCanvas/SearchPanel.svelte';

const specs: DataVizSpec[] = [
	{
		title: 'Revenue trend',
		chartType: 'line',
		rowCount: 52,
		hasSource: true,
		hasAltText: true,
		hasUnits: true,
		hasColorLegend: true
	}
];

const tokens: TokenSwatch[] = [
	{ name: '--surface', value: '#ffffff', group: 'chrome', usage: 'Page backgrounds' }
];

const scenarios: InteractionScenario[] = [
	{ id: 'hover', label: 'Hover lift', mode: 'hover', durationMs: 180, easing: 'ease-out', risk: 'low' }
];

const composerEntry: CopyPasteCatalogEntry = {
	name: 'ShineBorder',
	href: '/shineborder',
	category: 'Effects',
	description: 'Animated border wrapper.',
	source: 'src/lib/components/ShineBorder.svelte',
	docs: 'src/lib/components/ShineBorder.md',
	demo: 'src/routes/shineborder/+page.svelte',
	dependencies: [],
	relatedFiles: [],
	usage: '<ShineBorder>Content</ShineBorder>'
};

const cards: ExplainerCard[] = [
	{ id: 'a', title: 'Alpha', summary: 'First', content: [], position: { x: 0, y: 0 }, links: ['b'] },
	{ id: 'b', title: 'Beta', summary: 'Second', content: [], position: { x: 1, y: 0 } }
];

interface Case {
	name: string;
	// Components have different prop shapes; the table only needs "mountable".
	component: Component<any>;
	props: Record<string, unknown>;
	/**
	 * Ids owned by a nested shared primitive rather than this component (the
	 * forms family derives ids from each field's `name`), left out of the check.
	 */
	ignoreIds?: RegExp;
}

const cases: Case[] = [
	{ name: 'GsapSplitTextHero', component: GsapSplitTextHero, props: {} },
	{ name: 'TopologyColorGrid', component: TopologyColorGrid, props: {} },
	{ name: 'DataVizInspector', component: DataVizInspector, props: { specs } },
	{ name: 'TokenSwatchGrid', component: TokenSwatchGrid, props: { tokens } },
	{ name: 'InteractionLab', component: InteractionLab, props: { scenarios } },
	{ name: 'CopyPasteComposer', component: CopyPasteComposer, props: { entries: [composerEntry] } },
	{ name: 'Editor', component: Editor, props: {}, ignoreIds: /^field-|-error$/ },
	{ name: 'UploadDropzone', component: UploadDropzone, props: {} },
	{ name: 'DataGridFilters', component: DataGridFilters, props: { initiallyExpanded: true } },
	{ name: 'LiquidTabBar', component: LiquidTabBar, props: { tabs: [{ id: 't1', label: 'Tab 1' }] } },
	{ name: 'AnimatedBeam', component: AnimatedBeam, props: { gradient: true } },
	{ name: 'WaveText', component: WaveText, props: { text: 'Hello' } },
	{ name: 'AnimatedText', component: AnimatedText, props: { originalText: 'A', morphedText: 'B' } },
	{
		name: 'Accordion',
		component: Accordion,
		props: { items: [{ id: 'a', title: 'Section A', content: 'Content A' }] }
	},
	{ name: 'Tabs', component: Tabs, props: { tabs: [{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Specs' }] } },
	{ name: 'RippleGrid', component: RippleGrid, props: { rows: 2, cols: 2 } },
	{ name: 'MembraneSurface', component: MembraneSurface, props: {} },
	{ name: 'ConnectionLines', component: ConnectionLines, props: { cards, activeCardId: 'a' } },
	{
		name: 'SearchPanel',
		component: SearchPanel,
		props: {
			isOpen: true,
			query: 'al',
			results: [{ card: cards[0], path: ['Alpha'], matchField: 'title', score: 1 }]
		}
	}
];

/** Every id an element in `root` points at, via ARIA idrefs, label[for] or url(#)/href="#". */
function referencedIds(root: Element): string[] {
	const ids: string[] = [];
	for (const el of root.querySelectorAll('*')) {
		for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby', 'for']) {
			const value = el.getAttribute(attr);
			if (value) ids.push(...value.split(/\s+/).filter(Boolean));
		}
		for (const attr of ['href', 'xlink:href']) {
			const value = el.getAttribute(attr);
			if (value?.startsWith('#') && value.length > 1) ids.push(value.slice(1));
		}
		for (const attr of ['style', 'stroke', 'fill', 'filter', 'marker-end', 'marker-start', 'mask', 'clip-path']) {
			const value = el.getAttribute(attr);
			for (const match of value?.matchAll(/url\(#([^)]+)\)/g) ?? []) ids.push(match[1]);
		}
	}
	return ids;
}

afterEach(() => cleanup());

describe('per-instance ids ($props.id)', () => {
	it.each(cases.map((c) => [c.name, c] as const))('%s: two mounts never share an id', (_name, c) => {
		const first = render(c.component, { props: c.props });
		const second = render(c.component, { props: c.props });

		const ignored = (id: string) => c.ignoreIds?.test(id) ?? false;
		const allIds = [...document.querySelectorAll('[id]')].map((el) => el.id).filter((id) => !ignored(id));
		const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
		expect(duplicates).toEqual([]);

		for (const { container } of [first, second]) {
			const refs = referencedIds(container).filter((id) => !ignored(id));
			for (const id of refs) {
				const target = document.getElementById(id);
				expect(target, `#${id} should exist`).toBeTruthy();
				expect(container.contains(target), `#${id} should belong to the same instance`).toBe(true);
			}
		}
	});
});
