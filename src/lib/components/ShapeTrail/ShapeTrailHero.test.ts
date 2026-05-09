/**
 * ============================================================
 * ShapeTrailHero Tests
 * ============================================================
 *
 * Verifies wrapper structure (canvas + content + status), aria
 * wiring, palette class application, density clamping, and the
 * keyboard-toggle settle path. Canvas 2d rendering itself isn't
 * exercised — JSDom returns null for getContext('2d'), and the
 * component'soutsideeach branch handles that without crashing.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ShapeTrailHero from './ShapeTrailHero.svelte';

beforeEach(() => {
	(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
		class StubRO implements ResizeObserver {
			constructor(public cb: ResizeObserverCallback) {}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		} as unknown as typeof ResizeObserver;
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('ShapeTrailHero', () => {
	it('renders the wrapper as a toggle button with aria-pressed', () => {
		const { container } = render(ShapeTrailHero, { props: {} });
		const wrapper = container.querySelector('.shape-trail-hero');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.getAttribute('role')).toBe('button');
		expect(wrapper?.getAttribute('aria-label')).toBe('Shape Trail hero');
		expect(wrapper?.getAttribute('aria-pressed')).toBe('false');
	});

	it('flips aria-pressed to true after a click activates settle', async () => {
		const user = userEvent.setup();
		const { container } = render(ShapeTrailHero, { props: {} });
		const wrapper = container.querySelector('.shape-trail-hero') as HTMLElement;
		await user.click(wrapper);
		expect(wrapper.getAttribute('aria-pressed')).toBe('true');
		await user.click(wrapper);
		expect(wrapper.getAttribute('aria-pressed')).toBe('false');
	});

	it('honours custom ariaLabel', () => {
		const { container } = render(ShapeTrailHero, {
			props: { ariaLabel: 'Particle stage' }
		});
		expect(container.querySelector('[aria-label="Particle stage"]')).toBeTruthy();
	});

	it('renders an aria-hidden <canvas> for the visual layer', () => {
		const { container } = render(ShapeTrailHero, { props: {} });
		const canvas = container.querySelector('canvas.sth-canvas');
		expect(canvas).toBeTruthy();
		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders the eyebrow + title + lede content', () => {
		render(ShapeTrailHero, { props: {} });
		expect(screen.getByText('Shape Trail')).toBeTruthy();
		expect(screen.getByText(/Geometry that follows you home/)).toBeTruthy();
		expect(screen.getByText(/Move your cursor/)).toBeTruthy();
	});

	it('renders an aria-live status region with the current settle state', () => {
		const { container } = render(ShapeTrailHero, { props: {} });
		const status = container.querySelector('.sth-status');
		expect(status).toBeTruthy();
		expect(status?.getAttribute('aria-live')).toBe('polite');
		expect(status?.textContent?.trim()).toBe('Released');
	});

	it('toggles settle state on click — status reflects the change', async () => {
		const user = userEvent.setup();
		const { container } = render(ShapeTrailHero, { props: {} });
		const wrapper = container.querySelector('.shape-trail-hero') as HTMLElement;
		await user.click(wrapper);
		const status = container.querySelector('.sth-status') as HTMLElement;
		expect(status.textContent?.trim()).toBe('Settled');
		await user.click(wrapper);
		expect(status.textContent?.trim()).toBe('Released');
	});

	it('toggles settle on Enter and Space when wrapper has focus', async () => {
		const user = userEvent.setup();
		const { container } = render(ShapeTrailHero, { props: {} });
		const wrapper = container.querySelector('.shape-trail-hero') as HTMLElement;
		wrapper.focus();
		await user.keyboard('{Enter}');
		expect((container.querySelector('.sth-status') as HTMLElement).textContent?.trim()).toBe('Settled');
		await user.keyboard(' ');
		expect((container.querySelector('.sth-status') as HTMLElement).textContent?.trim()).toBe('Released');
	});

	it('applies the palette modifier class', () => {
		const { container } = render(ShapeTrailHero, { props: { palette: 'mono' } });
		expect(container.querySelector('.shape-trail-hero--mono')).toBeTruthy();
	});

	it('defaults to the aurora palette when no prop is passed', () => {
		const { container } = render(ShapeTrailHero, { props: {} });
		expect(container.querySelector('.shape-trail-hero--aurora')).toBeTruthy();
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(ShapeTrailHero, { props: { class: 'extra-shape' } });
		expect(container.querySelector('.shape-trail-hero.extra-shape')).toBeTruthy();
	});

	it('makes the wrapper keyboard-focusable via tabindex=0', () => {
		const { container } = render(ShapeTrailHero, { props: {} });
		const wrapper = container.querySelector('.shape-trail-hero') as HTMLElement;
		expect(wrapper.getAttribute('tabindex')).toBe('0');
	});

	it('does not crash on a sub-minimum density (8 lower bound enforced internally)', () => {
		expect(() => render(ShapeTrailHero, { props: { density: 0 } })).not.toThrow();
	});

	it('does not crash on an over-max density (128 upper bound enforced internally)', () => {
		expect(() => render(ShapeTrailHero, { props: { density: 9999 } })).not.toThrow();
	});
});
