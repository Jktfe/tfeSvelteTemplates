/**
 * ============================================================
 * KineticCanvasField Tests
 * ============================================================
 *
 * Verifies particle helpers (clampParticleCount, createKineticParticle,
 * stepKineticParticle) and the host component renders the wrapper +
 * canvas with the right palette.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import KineticCanvasField, {
	clampParticleCount,
	createKineticParticle,
	stepKineticParticle,
	tickerFrameDelta,
	MAX_FRAME_DELTA
} from './KineticCanvasField.svelte';

describe('KineticCanvasField particle helpers', () => {
	it('clampParticleCount clamps within [8, 260] and rounds', () => {
		expect(clampParticleCount(0)).toBe(8);
		expect(clampParticleCount(7.4)).toBe(8);
		expect(clampParticleCount(50.5)).toBeGreaterThanOrEqual(50);
		expect(clampParticleCount(500)).toBe(260);
	});

	it('createKineticParticle produces particle at supplied position with derived velocity', () => {
		const p = createKineticParticle(100, 200, 0, 50, 180);
		expect(p.x).toBe(100);
		expect(p.y).toBe(200);
		expect(p.life).toBe(1);
		expect(p.maxLife).toBe(1);
		expect(p.hue).toBe(180);
		// angle 0 → vx=cos(0)*50=50, vy=sin(0)*50=0
		expect(p.vx).toBeCloseTo(50);
		expect(p.vy).toBeCloseTo(0);
		expect(p.size).toBeGreaterThanOrEqual(2);
		expect(p.size).toBeLessThanOrEqual(7);
	});

	it('createKineticParticle with angle=PI/2 produces upward (positive y) velocity component', () => {
		const p = createKineticParticle(0, 0, Math.PI / 2, 30, 200);
		expect(p.vx).toBeCloseTo(0);
		expect(p.vy).toBeCloseTo(30);
	});

	it('stepKineticParticle decays life and applies friction + gravity', () => {
		const p = createKineticParticle(0, 0, 0, 100, 0);
		p.maxLife = 1;
		const stepped = stepKineticParticle(p, 0.5);
		expect(stepped.x).toBeGreaterThan(0);
		expect(stepped.life).toBeLessThan(1);
		expect(stepped.life).toBeGreaterThanOrEqual(0);
		// gravity acts on vy (28 * delta)
		expect(stepped.vy).toBeGreaterThan(0);
	});

	it('stepKineticParticle never takes life below 0', () => {
		const p = createKineticParticle(0, 0, 0, 0, 0);
		p.life = 0.01;
		p.maxLife = 1;
		const dead = stepKineticParticle(p, 5);
		expect(dead.life).toBe(0);
	});
});

describe('KineticCanvasField tickerFrameDelta', () => {
	// Regression: gsap.ticker passes time in seconds. The draw loop used to
	// divide by 1000 again, making each frame ~1000x too short.
	it('treats gsap.ticker time as seconds (no extra /1000)', () => {
		expect(tickerFrameDelta(10 + 1 / 60, 10)).toBeCloseTo(1 / 60, 6);
		expect(tickerFrameDelta(2.03, 2)).toBeCloseTo(0.03, 6);
	});

	it('returns a nominal 60fps step on the first frame', () => {
		expect(tickerFrameDelta(0, null)).toBeCloseTo(1 / 60);
		expect(tickerFrameDelta(5.2, null)).toBeCloseTo(1 / 60);
	});

	it('handles a first real frame at time 0 followed by a normal frame', () => {
		expect(tickerFrameDelta(0.016, 0)).toBeCloseTo(0.016, 6);
	});

	it('clamps long gaps (e.g. a backgrounded tab) to MAX_FRAME_DELTA', () => {
		expect(tickerFrameDelta(12, 2)).toBe(MAX_FRAME_DELTA);
	});

	it('falls back to the nominal step when time does not advance', () => {
		expect(tickerFrameDelta(3, 3)).toBeCloseTo(1 / 60);
		expect(tickerFrameDelta(2, 3)).toBeCloseTo(1 / 60);
	});

	it('moves a particle a visible distance over one second of 60fps frames', () => {
		let particle = createKineticParticle(0, 0, 0, 100, 0);
		particle.maxLife = 10;
		let last: number | null = null;
		for (let frame = 0; frame <= 60; frame += 1) {
			const time = frame / 60;
			particle = stepKineticParticle(particle, tickerFrameDelta(time, last));
			last = time;
		}
		// With the old ms maths this was well under 1px; seconds maths gives ~16px.
		expect(particle.x).toBeGreaterThan(10);
	});
});

describe('KineticCanvasField component', () => {
	it('renders the wrapper with the kinetic-canvas-field class', () => {
		const { container } = render(KineticCanvasField, { props: {} });
		expect(container.querySelector('.kinetic-canvas-field')).toBeTruthy();
	});

	it('renders a <canvas> element inside the wrapper', () => {
		const { container } = render(KineticCanvasField, { props: {} });
		expect(container.querySelector('.kinetic-canvas-field canvas')).toBeTruthy();
	});

	it('renders cleanly with each palette option (palette drives hue internally, not class)', () => {
		for (const palette of ['aurora', 'ember', 'mono'] as const) {
			const { container, unmount } = render(KineticCanvasField, { props: { palette } });
			expect(container.querySelector('.kinetic-canvas-field')).toBeTruthy();
			expect(container.querySelector('canvas')).toBeTruthy();
			unmount();
		}
	});

	it('marks the canvas as decorative for assistive tech', () => {
		const { container } = render(KineticCanvasField, { props: {} });
		const canvas = container.querySelector('canvas');
		expect(canvas?.getAttribute('aria-hidden')).toBe('true');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(KineticCanvasField, {
			props: { class: 'custom-canvas-class' }
		});
		expect(container.querySelector('.kinetic-canvas-field.custom-canvas-class')).toBeTruthy();
	});
});
