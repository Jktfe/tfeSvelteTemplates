/**
 * ============================================================
 * ProgressBar Tests
 * ============================================================
 *
 * Verifies determinate/indeterminate modes, value clamping,
 * label rendering and positioning, custom formatter, size and
 * variant classes, completion state, and ARIA wiring via the
 * native <progress> element.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar.svelte';

describe('ProgressBar', () => {
	it('renders with default value of 0', () => {
		const { container } = render(ProgressBar);
		const native = container.querySelector('progress') as HTMLProgressElement;
		expect(native).toBeTruthy();
		expect(native.value).toBe(0);
		expect(native.max).toBe(100);
	});

	it('reflects the value prop on the native <progress>', () => {
		const { container } = render(ProgressBar, { props: { value: 42 } });
		const native = container.querySelector('progress') as HTMLProgressElement;
		expect(native.value).toBe(42);
	});

	it('clamps values above max into [0, max]', () => {
		const { container } = render(ProgressBar, { props: { value: 150, max: 100 } });
		const fill = container.querySelector('.pb-fill') as HTMLElement;
		expect(fill.style.width).toBe('100%');
	});

	it('clamps negative values to 0', () => {
		const { container } = render(ProgressBar, { props: { value: -25 } });
		const fill = container.querySelector('.pb-fill') as HTMLElement;
		expect(fill.style.width).toBe('0%');
	});

	it('respects custom max value', () => {
		const { container } = render(ProgressBar, { props: { value: 3, max: 5 } });
		const native = container.querySelector('progress') as HTMLProgressElement;
		expect(native.max).toBe(5);
		expect(native.value).toBe(3);
	});

	it('switches to indeterminate when value is null', () => {
		const { container } = render(ProgressBar, { props: { value: null } });
		const wrapper = container.querySelector('.pb') as HTMLElement;
		expect(wrapper.classList.contains('pb-indeterminate')).toBe(true);

		const native = container.querySelector('progress') as HTMLProgressElement;
		// Indeterminate native progress: no value attribute set
		expect(native.hasAttribute('value')).toBe(false);
	});

	it('does not show inline label when indeterminate', () => {
		const { container } = render(ProgressBar, {
			props: { value: null, showValue: 'inline' }
		});
		expect(container.querySelector('.pb-label-inline')).toBeNull();
	});

	it('shows inline label with default percent format', () => {
		const { container } = render(ProgressBar, {
			props: { value: 50, showValue: 'inline' }
		});
		const label = container.querySelector('.pb-label-inline');
		expect(label?.textContent).toBe('50%');
	});

	it('shows label above with both name and value', () => {
		const { container } = render(ProgressBar, {
			props: { value: 75, showValue: 'above', ariaLabel: 'Upload' }
		});
		expect(container.querySelector('.pb-label-text')?.textContent).toBe('Upload');
		expect(container.querySelector('.pb-label-value')?.textContent).toBe('75%');
	});

	it('uses custom format function when provided', () => {
		const format = (v: number, m: number) => `${v} of ${m} steps`;
		const { container } = render(ProgressBar, {
			props: { value: 3, max: 5, showValue: 'inline', format }
		});
		expect(container.querySelector('.pb-label-inline')?.textContent).toBe('3 of 5 steps');
	});

	it('applies the size class', () => {
		const { container } = render(ProgressBar, { props: { size: 'lg' } });
		expect(container.querySelector('.pb-lg')).toBeTruthy();
	});

	it('applies the variant class', () => {
		const { container } = render(ProgressBar, { props: { variant: 'success' } });
		expect(container.querySelector('.pb-success')).toBeTruthy();
	});

	it('adds pb-complete class at 100%', () => {
		const { container } = render(ProgressBar, { props: { value: 100 } });
		expect(container.querySelector('.pb-complete')).toBeTruthy();
	});

	it('does not add pb-complete below 100%', () => {
		const { container } = render(ProgressBar, { props: { value: 99 } });
		expect(container.querySelector('.pb-complete')).toBeNull();
	});

	it('aria-label is forwarded to the native <progress>', () => {
		const { container } = render(ProgressBar, {
			props: { value: 50, ariaLabel: 'Custom label' }
		});
		const native = container.querySelector('progress') as HTMLProgressElement;
		expect(native.getAttribute('aria-label')).toBe('Custom label');
	});

	it('forwards extra classes', () => {
		const { container } = render(ProgressBar, { props: { class: 'my-extra' } });
		expect(container.querySelector('.my-extra')).toBeTruthy();
	});

	it('decorative fill is aria-hidden', () => {
		const { container } = render(ProgressBar, { props: { value: 50 } });
		const fill = container.querySelector('.pb-fill') as HTMLElement;
		expect(fill.getAttribute('aria-hidden')).toBe('true');
	});
});
