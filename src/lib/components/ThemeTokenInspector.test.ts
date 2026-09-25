import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ThemeTokenInspector, {
	contrastLabel,
	contrastRatio,
	cssOverrideSnippet,
	defaultThemeTokenRows,
	flipsInDark,
	groupTokenRows,
	hexToRgb,
	resolvePreviewMode,
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

describe('ThemeTokenInspector preview mode resolution', () => {
	it('follows the OS scheme until the viewer picks a mode', () => {
		expect(resolvePreviewMode(null, false)).toBe('light');
		expect(resolvePreviewMode(null, true)).toBe('dark');
		expect(resolvePreviewMode('light', true)).toBe('light');
		expect(resolvePreviewMode('dark', false)).toBe('dark');
	});
});

describe('ThemeTokenInspector component', () => {
	it('defaults to auto so CSS can follow prefers-color-scheme', async () => {
		const { container } = render(ThemeTokenInspector);
		const root = container.querySelector('section.tti');

		expect(root?.classList.contains('tti-auto')).toBe(true);
		expect(root?.classList.contains('tti-dark')).toBe(false);

		// An explicit pick takes over from the OS scheme.
		await fireEvent.click(screen.getByRole('button', { name: /Dark/i }));
		expect(root?.classList.contains('tti-auto')).toBe(false);
		expect(root?.classList.contains('tti-dark')).toBe(true);

		await fireEvent.click(screen.getByRole('button', { name: /Light/i }));
		expect(root?.classList.contains('tti-auto')).toBe(false);
		expect(root?.classList.contains('tti-dark')).toBe(false);
	});

	it('honours an explicit initialMode', () => {
		const { container } = render(ThemeTokenInspector, { initialMode: 'dark' });
		const root = container.querySelector('section.tti');
		expect(root?.classList.contains('tti-dark')).toBe(true);
		expect(root?.classList.contains('tti-auto')).toBe(false);
	});

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
