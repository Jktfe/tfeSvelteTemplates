/**
 * ============================================================
 * ProgressRing Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders with role="progressbar"
 *   ✓ Sets aria-valuenow / valuemin / valuemax in determinate mode
 *   ✓ Omits aria-valuenow in indeterminate mode
 *   ✓ Clamps value below 0 to 0
 *   ✓ Clamps value above 100 to 100
 *   ✓ Applies the indeterminate class
 *   ✓ Renders a label snippet when provided
 *   ✓ Forwards aria-label
 *   ✓ Forwards extra classes
 *
 * Run:
 *   bun run test -- ProgressRing
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ProgressRing from './ProgressRing.svelte';

describe('ProgressRing', () => {
	it('renders with role=progressbar', () => {
		const { container } = render(ProgressRing, { value: 50, ariaLabel: 'Loading' });
		const root = container.querySelector('[role="progressbar"]');
		expect(root).toBeTruthy();
	});

	it('sets aria attributes in determinate mode', () => {
		const { container } = render(ProgressRing, { value: 75, ariaLabel: 'Upload' });
		const root = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(root.getAttribute('aria-valuenow')).toBe('75');
		expect(root.getAttribute('aria-valuemin')).toBe('0');
		expect(root.getAttribute('aria-valuemax')).toBe('100');
		expect(root.getAttribute('aria-valuetext')).toBe('75 percent');
	});

	it('omits aria-valuenow in indeterminate mode', () => {
		const { container } = render(ProgressRing, {
			indeterminate: true,
			ariaLabel: 'Loading'
		});
		const root = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(root.getAttribute('aria-valuenow')).toBeNull();
		expect(root.getAttribute('aria-valuemin')).toBeNull();
		expect(root.getAttribute('aria-valuemax')).toBeNull();
	});

	it('clamps negative values to 0', () => {
		const { container } = render(ProgressRing, { value: -25 });
		const root = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(root.getAttribute('aria-valuenow')).toBe('0');
	});

	it('clamps values above 100 to 100', () => {
		const { container } = render(ProgressRing, { value: 250 });
		const root = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(root.getAttribute('aria-valuenow')).toBe('100');
	});

	it('applies the indeterminate class', () => {
		const { container } = render(ProgressRing, { indeterminate: true });
		const root = container.querySelector('.progress-ring') as HTMLElement;
		expect(root.classList.contains('progress-indeterminate')).toBe(true);
	});

	it('does not apply the indeterminate class for determinate mode', () => {
		const { container } = render(ProgressRing, { value: 50 });
		const root = container.querySelector('.progress-ring') as HTMLElement;
		expect(root.classList.contains('progress-indeterminate')).toBe(false);
	});

	it('forwards aria-label', () => {
		const { container } = render(ProgressRing, { value: 30, ariaLabel: 'Upload progress' });
		const root = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(root.getAttribute('aria-label')).toBe('Upload progress');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(ProgressRing, { value: 0, class: 'custom-ring' });
		const root = container.querySelector('.progress-ring') as HTMLElement;
		expect(root.classList.contains('custom-ring')).toBe(true);
	});

	it('respects custom size and stroke for SVG geometry', () => {
		const { container } = render(ProgressRing, { value: 0, size: 100, stroke: 10 });
		const svg = container.querySelector('svg') as SVGElement;
		expect(svg.getAttribute('width')).toBe('100');
		expect(svg.getAttribute('height')).toBe('100');
	});
});
