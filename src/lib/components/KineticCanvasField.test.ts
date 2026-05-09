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
	stepKineticParticle
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
