/**
 * ============================================================
 * MagneticButton Tests
 * ============================================================
 *
 * What we're checking:
 *   - It renders the children content without crashing
 *   - The wrapper exposes the configured radius via the CSS custom property
 *   - The inner content layer exists for the transform offset
 *   - Mouse moves produce a measurable transform on the content layer
 *   - Reduced motion / coarse pointer preferences disable the effect
 *
 * Run:
 *   bun run test -- MagneticButton
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { tick } from 'svelte';
import MagneticButtonTest from './MagneticButtonTest.svelte';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
	window.matchMedia = originalMatchMedia;
});

function mockMatchMedia(matches: (query: string) => boolean) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: matches(query),
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	}));
}

describe('MagneticButton', () => {
	it('renders the wrapped child element', () => {
		const { getByTestId } = render(MagneticButtonTest);
		expect(getByTestId('magnetic-target')).toBeInTheDocument();
	});

	it('writes the radius prop to the --radius custom property', () => {
		const { container } = render(MagneticButtonTest, { radius: 150 });
		const wrapper = container.querySelector('.magnetic-wrapper') as HTMLElement;
		expect(wrapper.style.getPropertyValue('--radius')).toBe('150px');
	});

	it('renders an inner content layer that carries the transform', () => {
		const { container } = render(MagneticButtonTest);
		const content = container.querySelector('.magnetic-content') as HTMLElement;
		expect(content).toBeTruthy();
		expect(content.style.transform).toContain('translate(0px, 0px)');
	});

	it('moves the content layer when the cursor approaches the centre', async () => {
		const { container } = render(MagneticButtonTest, { radius: 100, strength: 0.5 });
		const wrapper = container.querySelector('.magnetic-wrapper') as HTMLElement;
		const content = container.querySelector('.magnetic-content') as HTMLElement;

		// Force a deterministic bounding rect — happy-dom returns zeros otherwise.
		wrapper.getBoundingClientRect = () => ({
			top: 0,
			left: 0,
			right: 100,
			bottom: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({})
		});

		await fireEvent.mouseMove(wrapper, { clientX: 60, clientY: 60 });
		await tick();

		expect(content.style.transform).not.toContain('translate(0px, 0px)');
	});

	it('resets when the pointer leaves', async () => {
		const { container } = render(MagneticButtonTest);
		const wrapper = container.querySelector('.magnetic-wrapper') as HTMLElement;
		const content = container.querySelector('.magnetic-content') as HTMLElement;

		wrapper.getBoundingClientRect = () => ({
			top: 0,
			left: 0,
			right: 100,
			bottom: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({})
		});

		await fireEvent.mouseMove(wrapper, { clientX: 60, clientY: 60 });
		await fireEvent.mouseLeave(wrapper);
		await tick();

		expect(content.style.transform).toContain('translate(0px, 0px)');
	});

	it('respects prefers-reduced-motion by skipping the transform', async () => {
		mockMatchMedia((q) => q.includes('reduced-motion'));
		const { container } = render(MagneticButtonTest);
		const wrapper = container.querySelector('.magnetic-wrapper') as HTMLElement;
		const content = container.querySelector('.magnetic-content') as HTMLElement;

		wrapper.getBoundingClientRect = () => ({
			top: 0,
			left: 0,
			right: 100,
			bottom: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({})
		});

		await fireEvent.mouseMove(wrapper, { clientX: 60, clientY: 60 });
		await tick();

		expect(content.style.transform).toContain('translate(0px, 0px)');
	});

	it('no-ops on coarse pointer devices (touch)', async () => {
		mockMatchMedia((q) => q.includes('pointer: coarse'));
		const { container } = render(MagneticButtonTest);
		const wrapper = container.querySelector('.magnetic-wrapper') as HTMLElement;
		const content = container.querySelector('.magnetic-content') as HTMLElement;

		wrapper.getBoundingClientRect = () => ({
			top: 0,
			left: 0,
			right: 100,
			bottom: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({})
		});

		await fireEvent.mouseMove(wrapper, { clientX: 60, clientY: 60 });
		await tick();

		expect(content.style.transform).toContain('translate(0px, 0px)');
	});
});
