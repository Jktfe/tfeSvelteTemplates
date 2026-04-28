/**
 * ============================================================
 * SkeletonLoader Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders the default text shape
 *   ✓ Applies the shape class
 *   ✓ Applies the animation class
 *   ✓ Width / height / radius forwarded to inline styles
 *   ✓ Circle shape defaults to a round border-radius
 *   ✓ Sets aria-hidden so screen readers skip it
 *
 * Run:
 *   bun run test -- SkeletonLoader
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SkeletonLoader from './SkeletonLoader.svelte';

describe('SkeletonLoader', () => {
	it('renders with the default text shape', () => {
		const { container } = render(SkeletonLoader);
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el).toBeTruthy();
		expect(el.classList.contains('skeleton-text')).toBe(true);
		expect(el.classList.contains('skeleton-pulse')).toBe(true);
	});

	it('applies the shape class', () => {
		const { container } = render(SkeletonLoader, { shape: 'circle' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.classList.contains('skeleton-circle')).toBe(true);
	});

	it('applies the rect shape', () => {
		const { container } = render(SkeletonLoader, { shape: 'rect' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.classList.contains('skeleton-rect')).toBe(true);
	});

	it('applies the animation class', () => {
		const { container } = render(SkeletonLoader, { animation: 'shimmer' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.classList.contains('skeleton-shimmer')).toBe(true);
	});

	it('disables animation when animation=none', () => {
		const { container } = render(SkeletonLoader, { animation: 'none' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.classList.contains('skeleton-none')).toBe(true);
	});

	it('forwards width and height as inline styles', () => {
		const { container } = render(SkeletonLoader, {
			shape: 'rect',
			width: '50%',
			height: '120px'
		});
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.style.width).toBe('50%');
		expect(el.style.height).toBe('120px');
	});

	it('defaults the circle shape to a round radius', () => {
		const { container } = render(SkeletonLoader, { shape: 'circle' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.style.borderRadius).toBe('50%');
	});

	it('honours an explicit radius prop', () => {
		const { container } = render(SkeletonLoader, { radius: '12px' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.style.borderRadius).toBe('12px');
	});

	it('sets aria-hidden because it is decorative', () => {
		const { container } = render(SkeletonLoader);
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.getAttribute('aria-hidden')).toBe('true');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(SkeletonLoader, { class: 'custom-skeleton' });
		const el = container.querySelector('.skeleton') as HTMLElement;
		expect(el.classList.contains('custom-skeleton')).toBe(true);
	});
});
