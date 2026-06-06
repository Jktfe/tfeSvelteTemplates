/**
 * ============================================================
 * RangeSlider Tests
 * ============================================================
 *
 * Verifies the dual-thumb range slider:
 *   - Renders two slider thumbs
 *   - Exposes correct ARIA value attributes per thumb
 *   - Keyboard Arrow keys step a thumb
 *   - Shift+Arrow uses the large step
 *   - Thumbs clamp so they never cross
 *   - Home/End jump to the bounds
 *
 * Run: bun run test -- RangeSlider
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import RangeSlider from './RangeSlider.svelte';

describe('RangeSlider', () => {
	it('renders two slider thumbs', () => {
		render(RangeSlider, { props: { value: { min: 20, max: 80 }, min: 0, max: 100 } });
		const sliders = screen.getAllByRole('slider');
		expect(sliders).toHaveLength(2);
	});

	it('sets ARIA value attributes on each thumb', () => {
		render(RangeSlider, { props: { value: { min: 25, max: 75 }, min: 0, max: 100, label: 'Price' } });
		const lower = screen.getByRole('slider', { name: 'Price minimum' });
		const upper = screen.getByRole('slider', { name: 'Price maximum' });

		expect(lower).toHaveAttribute('aria-valuenow', '25');
		// The lower thumb's ceiling is the upper thumb's value (non-crossing).
		expect(lower).toHaveAttribute('aria-valuemax', '75');
		expect(upper).toHaveAttribute('aria-valuenow', '75');
		expect(upper).toHaveAttribute('aria-valuemin', '25');
	});

	it('steps a thumb up with ArrowRight', async () => {
		render(RangeSlider, { props: { value: { min: 20, max: 80 }, min: 0, max: 100, step: 5 } });
		const lower = screen.getByRole('slider', { name: 'Range minimum' });

		await fireEvent.keyDown(lower, { key: 'ArrowRight' });

		expect(lower).toHaveAttribute('aria-valuenow', '25');
	});

	it('uses the large step with Shift+Arrow', async () => {
		render(RangeSlider, { props: { value: { min: 20, max: 80 }, min: 0, max: 100, step: 1, largeStep: 10 } });
		const lower = screen.getByRole('slider', { name: 'Range minimum' });

		await fireEvent.keyDown(lower, { key: 'ArrowRight', shiftKey: true });

		expect(lower).toHaveAttribute('aria-valuenow', '30');
	});

	it('prevents the lower thumb from crossing the upper thumb', async () => {
		render(RangeSlider, { props: { value: { min: 48, max: 50 }, min: 0, max: 100, step: 5 } });
		const lower = screen.getByRole('slider', { name: 'Range minimum' });

		// Pushing the lower thumb past the upper should clamp it to the upper.
		await fireEvent.keyDown(lower, { key: 'ArrowRight' });

		expect(lower).toHaveAttribute('aria-valuenow', '50');
	});

	it('Home pins the lower thumb to the overall minimum', async () => {
		render(RangeSlider, { props: { value: { min: 40, max: 80 }, min: 0, max: 100 } });
		const lower = screen.getByRole('slider', { name: 'Range minimum' });

		await fireEvent.keyDown(lower, { key: 'Home' });

		expect(lower).toHaveAttribute('aria-valuenow', '0');
	});

	it('End pins the upper thumb to the overall maximum', async () => {
		render(RangeSlider, { props: { value: { min: 40, max: 80 }, min: 0, max: 100 } });
		const upper = screen.getByRole('slider', { name: 'Range maximum' });

		await fireEvent.keyDown(upper, { key: 'End' });

		expect(upper).toHaveAttribute('aria-valuenow', '100');
	});

	it('removes thumbs from the tab order when disabled', () => {
		render(RangeSlider, { props: { value: { min: 20, max: 80 }, disabled: true } });
		const sliders = screen.getAllByRole('slider');
		for (const thumb of sliders) {
			expect(thumb).toHaveAttribute('tabindex', '-1');
		}
	});
});
