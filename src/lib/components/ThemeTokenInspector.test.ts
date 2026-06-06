import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ThemeTokenInspector, {
	contrastLabel,
	contrastRatio,
	cssOverrideSnippet,
	defaultThemeTokenRows,
	flipsInDark,
	groupTokenRows,
	hexToRgb,
	tokenValueForMode,
	type ThemeTokenRow
} from './ThemeTokenInspector.svelte';

const rows: ThemeTokenRow[] = [
	{
		property: '--surface',
		kind: 'chrome',
		component: 'Demo',
		selector: 'body .demo.demo',
		role: 'Panel surface',
		light: '#ffffff',
		dark: '#111827',
		note: 'Chrome flips.'
	},
	{
		property: '--accent',
		kind: 'brand',
		component: 'Demo',
		selector: ':root',
		role: 'Product accent',
		light: '#315f9f',
		note: 'Brand stays.'
	},
	{
		property: '--success',
		kind: 'semantic',
		component: 'Demo',
		selector: ':root',
		role: 'Success state',
		light: '#16a34a',
		note: 'Semantic stays.'
	}
];

describe('ThemeTokenInspector helpers', () => {
	it('groups token rows by taxonomy kind', () => {
		const grouped = groupTokenRows(rows);

		expect(grouped.chrome).toHaveLength(1);
		expect(grouped.brand[0].property).toBe('--accent');
		expect(grouped.semantic[0].property).toBe('--success');
	});

	it('resolves dark mode values and stable fallbacks', () => {
		expect(tokenValueForMode(rows[0], 'dark')).toBe('#111827');
		expect(tokenValueForMode(rows[1], 'dark')).toBe('#315f9f');
		expect(flipsInDark(rows[0])).toBe(true);
		expect(flipsInDark(rows[1])).toBe(false);
	});

	it('parses hex colors and computes contrast ratios', () => {
		expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
		expect(contrastLabel('#111827', 'light').tone).toBe('high');
		expect(contrastLabel('rgba(0,0,0,0.2)', 'light')).toEqual({
			ratio: null,
			tone: 'n/a',
			label: 'N/A'
		});
	});

	it('builds grouped CSS override snippets', () => {
		expect(cssOverrideSnippet([rows[0]], 'light')).toContain('body .demo.demo');
		expect(cssOverrideSnippet([rows[0]], 'dark')).toContain(':root.dark .demo.demo');
		expect(cssOverrideSnippet([rows[1], rows[2]], 'light')).toContain('--success: #16a34a;');
	});
});

describe('ThemeTokenInspector component', () => {
	it('renders default taxonomy controls and token rows', () => {
		render(ThemeTokenInspector);

		expect(screen.getByRole('heading', { name: 'Theme token inspector' })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Light/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Dark/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Chrome/i })).toBeTruthy();
		expect(screen.getAllByText('--tooltip-bg').length).toBeGreaterThan(0);
		expect(defaultThemeTokenRows.length).toBeGreaterThan(0);
	});

	it('renders custom rows and a copyable snippet panel', () => {
		render(ThemeTokenInspector, { rows, title: 'Token QA' });

		expect(screen.getByRole('heading', { name: 'Token QA' })).toBeTruthy();
		expect(screen.getAllByText('--surface').length).toBeGreaterThan(0);
		expect(screen.getByRole('button', { name: 'Copy CSS' })).toBeTruthy();
		expect(screen.getByText(/body \.demo\.demo/)).toBeTruthy();
	});
});
