/*
 * Slider Tests
 *
 * Covers:
 *   ✓ Renders with default value 0
 *   ✓ Initial value prop reflects in input
 *   ✓ Native input[type=range] used
 *   ✓ min/max/step props applied
 *   ✓ Disabled prevents interaction
 *   ✓ onChange fires with new value
 *   ✓ Applies size class (sm/md/lg)
 *   ✓ Applies variant class
 *   ✓ Label renders when provided
 *   ✓ Value bubble renders when showValue=true
 *   ✓ formatValue customises bubble label
 *   ✓ aria-label fallback when no visible label
 *
 * Run:
 *   bun run test -- Slider
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Slider from './Slider.svelte';

describe('Slider', () => {
	it('renders with default value 0', () => {
		const { container } = render(Slider);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.value).toBe('0');
	});

	it('initial value prop reflects in input', () => {
		const { container } = render(Slider, { props: { value: 42 } });
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.value).toBe('42');
	});

	it('uses native input[type=range]', () => {
		const { container } = render(Slider);
		const input = container.querySelector('input');
		expect(input?.getAttribute('type')).toBe('range');
	});

	it('applies min/max/step props', () => {
		const { container } = render(Slider, {
			props: { min: 10, max: 200, step: 5, value: 50 }
		});
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.min).toBe('10');
		expect(input.max).toBe('200');
		expect(input.step).toBe('5');
	});

	it('disabled prevents interaction', () => {
		const { container } = render(Slider, { props: { disabled: true } });
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it('onChange callback fires with new value', async () => {
		const onChange = vi.fn();
		const { container } = render(Slider, { props: { onChange } });
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: '75' } });
		expect(onChange).toHaveBeenCalledWith(75);
	});

	it('applies the size class', () => {
		const { container } = render(Slider, { props: { size: 'lg' } });
		expect(container.querySelector('.slider-lg')).toBeTruthy();
	});

	it('applies the variant class on the input', () => {
		const { container } = render(Slider, { props: { variant: 'success' } });
		const input = container.querySelector('input[type="range"]');
		expect(input?.classList.contains('slider-success')).toBe(true);
	});

	it('renders the label when provided', () => {
		const { getByText } = render(Slider, { props: { label: 'Volume' } });
		expect(getByText('Volume')).toBeTruthy();
	});

	it('renders value bubble when showValue=true', () => {
		const { container } = render(Slider, { props: { value: 50, showValue: true } });
		const bubble = container.querySelector('.slider-bubble');
		expect(bubble?.textContent).toBe('50');
	});

	it('formatValue customises bubble label', () => {
		const { container } = render(Slider, {
			props: {
				value: 0.5,
				min: 0,
				max: 1,
				step: 0.1,
				showValue: true,
				formatValue: (v: number) => `${Math.round(v * 100)}%`
			}
		});
		const bubble = container.querySelector('.slider-bubble');
		expect(bubble?.textContent).toBe('50%');
	});

	it('uses ariaLabel fallback when no visible label', () => {
		const { container } = render(Slider);
		const input = container.querySelector('input[type="range"]');
		expect(input?.getAttribute('aria-label')).toBe('Slider');
	});
});
