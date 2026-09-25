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
import CheckboxField from './forms/CheckboxField.svelte';
import CheckboxGroup from './forms/CheckboxGroup.svelte';
import ColorField from './forms/ColorField.svelte';
import DateField from './forms/DateField.svelte';
import FormsTestHarness from './forms/FormsTestHarness.test.svelte';
import NumberField from './forms/NumberField.svelte';
import RadioGroup from './forms/RadioGroup.svelte';
import RangeField from './forms/RangeField.svelte';
import SelectField from './forms/SelectField.svelte';
import SwitchField from './forms/SwitchField.svelte';
import TextareaField from './forms/TextareaField.svelte';
import TextField from './forms/TextField.svelte';
import TimeField from './forms/TimeField.svelte';
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
}

// Forms family: identical `name`s on purpose — that is exactly what two copies
// of the same form on one page look like. Touched + error + help text so every
// help / error / char-count element (and every id pointing at it) renders.
const fieldOptions = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Beta' }
];
const fieldCommon = { helpText: 'Help', error: 'Error', touched: true };
const formCases: Case[] = [
	{ name: 'FormsTestHarness (full form)', component: FormsTestHarness, props: {} },
	{ name: 'TextField', component: TextField, props: { name: 'email', label: 'Email', ...fieldCommon } },
	{
		name: 'TextareaField',
		component: TextareaField,
		props: { name: 'bio', label: 'Bio', maxlength: 100, showCharCount: true, ...fieldCommon }
	},
	{ name: 'NumberField', component: NumberField, props: { name: 'age', label: 'Age', ...fieldCommon } },
	{
		name: 'SelectField',
		component: SelectField,
		props: { name: 'country', label: 'Country', options: fieldOptions, ...fieldCommon }
	},
	{
		name: 'RadioGroup',
		component: RadioGroup,
		props: { name: 'plan', label: 'Plan', options: fieldOptions, ...fieldCommon }
	},
	{ name: 'CheckboxField', component: CheckboxField, props: { name: 'terms', label: 'Terms', ...fieldCommon } },
	{
		name: 'CheckboxGroup',
		component: CheckboxGroup,
		props: { name: 'topics', label: 'Topics', options: fieldOptions, ...fieldCommon }
	},
	{
		name: 'RangeField',
		component: RangeField,
		props: { name: 'volume', label: 'Volume', min: 0, max: 10, ...fieldCommon }
	},
	{ name: 'DateField', component: DateField, props: { name: 'start', label: 'Start', ...fieldCommon } },
	{ name: 'TimeField', component: TimeField, props: { name: 'at', label: 'Time', ...fieldCommon } },
	{ name: 'SwitchField', component: SwitchField, props: { name: 'alerts', label: 'Alerts', ...fieldCommon } },
	{ name: 'ColorField', component: ColorField, props: { name: 'accent', label: 'Accent', ...fieldCommon } }
];

const cases: Case[] = [
	{ name: 'GsapSplitTextHero', component: GsapSplitTextHero, props: {} },
	{ name: 'TopologyColorGrid', component: TopologyColorGrid, props: {} },
	{ name: 'DataVizInspector', component: DataVizInspector, props: { specs } },
	{ name: 'TokenSwatchGrid', component: TokenSwatchGrid, props: { tokens } },
	{ name: 'InteractionLab', component: InteractionLab, props: { scenarios } },
	{ name: 'CopyPasteComposer', component: CopyPasteComposer, props: { entries: [composerEntry] } },
	{ name: 'Editor', component: Editor, props: {} },
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
	},
	...formCases
];

/** Every id an element in `root` points at, via ARIA idrefs, label[for] or url(#)/href="#". */
function referencedIds(root: Element): string[] {
	const ids: string[] = [];
	for (const el of root.querySelectorAll('*')) {
		for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby', 'aria-errormessage', 'for']) {
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

		const allIds = [...document.querySelectorAll('[id]')].map((el) => el.id);
		const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
		expect(duplicates).toEqual([]);

		for (const { container } of [first, second]) {
			const refs = referencedIds(container);
			for (const id of refs) {
				const target = document.getElementById(id);
				expect(target, `#${id} should exist`).toBeTruthy();
				expect(container.contains(target), `#${id} should belong to the same instance`).toBe(true);
			}
		}
	});
});
