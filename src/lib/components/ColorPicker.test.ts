/**
 * ============================================================
 * ColorPicker Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders the group with its ARIA label
 *   ✓ Exposes the SV plane and hue track as ARIA sliders
 *   ✓ Mirrors the bound value into the hex input
 *   ✓ Renders the supplied preset swatches
 *   ✓ Hides the hex input when showHex is false
 *   ✓ Marks the matching swatch as pressed/active
 *   ✓ Selecting a swatch commits its colour to the hex input
 *
 * Run:
 *   bun run test -- ColorPicker
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ColorPicker from './ColorPicker.svelte';

describe('ColorPicker', () => {
	it('renders the picker group with its ARIA label', () => {
		const { getByRole } = render(ColorPicker, { props: { label: 'Brand colour' } });
		expect(getByRole('group', { name: 'Brand colour' })).toBeTruthy();
	});

	it('exposes the saturation/value plane and hue track as sliders', () => {
		const { getByLabelText } = render(ColorPicker);
		expect(getByLabelText('Saturation and brightness').getAttribute('role')).toBe('slider');
		expect(getByLabelText('Hue').getAttribute('role')).toBe('slider');
	});

	it('mirrors the bound value into the hex input', () => {
		const { getByLabelText } = render(ColorPicker, { props: { value: '#ff0000' } });
		const input = getByLabelText('Hex colour value') as HTMLInputElement;
		expect(input.value.toLowerCase()).toBe('#ff0000');
	});

	it('renders the supplied preset swatches', () => {
		const { getByLabelText } = render(ColorPicker, {
			props: { swatches: ['#123456', '#abcdef'] }
		});
		expect(getByLabelText('Select colour #123456')).toBeTruthy();
		expect(getByLabelText('Select colour #abcdef')).toBeTruthy();
	});

	it('hides the hex input when showHex is false', () => {
		const { queryByLabelText } = render(ColorPicker, { props: { showHex: false } });
		expect(queryByLabelText('Hex colour value')).toBeNull();
	});

	it('marks the swatch matching the current value as pressed', () => {
		const { getByLabelText } = render(ColorPicker, {
			props: { value: '#123456', swatches: ['#123456', '#abcdef'] }
		});
		expect(getByLabelText('Select colour #123456').getAttribute('aria-pressed')).toBe('true');
		expect(getByLabelText('Select colour #abcdef').getAttribute('aria-pressed')).toBe('false');
	});

	it('selecting a swatch commits its colour to the hex input', async () => {
		const { getByLabelText } = render(ColorPicker, {
			props: { value: '#ffffff', swatches: ['#00ff00'] }
		});
		await fireEvent.click(getByLabelText('Select colour #00ff00'));
		const input = getByLabelText('Hex colour value') as HTMLInputElement;
		expect(input.value.toLowerCase()).toBe('#00ff00');
	});
});
