import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TokenSwatchGrid, {
	contrastRatio,
	groupTokenSwatches,
	readableTokenName,
	tokenContrastLabel,
	type TokenSwatch
} from './TokenSwatchGrid.svelte';

const tokens: TokenSwatch[] = [
	{ name: '--surface', value: '#ffffff', group: 'chrome', usage: 'Page backgrounds' },
	{ name: '--brand-primary', value: '#0f766e', group: 'brand', usage: 'Primary actions', foreground: '#ffffff' },
	{ name: '--status-pass', value: '#dcfce7', group: 'semantic', usage: 'Success states' }
];

describe('TokenSwatchGrid helpers', () => {
	it('formats token names for display', () => {
		expect(readableTokenName('--brand-primary')).toBe('brand primary');
	});

	it('calculates contrast labels', () => {
		expect(contrastRatio('#ffffff', '#111827')).toBeGreaterThan(10);
		expect(tokenContrastLabel(contrastRatio('#ffffff', '#111827'))).toBe('AA');
		expect(tokenContrastLabel(undefined)).toBe('Unknown');
	});

	it('groups tokens by purpose', () => {
		expect(groupTokenSwatches(tokens).brand).toHaveLength(1);
		expect(groupTokenSwatches(tokens).semantic[0].name).toBe('--status-pass');
	});
});

describe('TokenSwatchGrid component', () => {
	it('renders token groups and swatch values', () => {
		render(TokenSwatchGrid, { tokens, title: 'Theme swatches' });

		expect(screen.getByRole('heading', { name: 'Theme swatches' })).toBeTruthy();
		expect(screen.getByText('--brand-primary')).toBeTruthy();
		expect(screen.getByText('Primary actions')).toBeTruthy();
	});
});
