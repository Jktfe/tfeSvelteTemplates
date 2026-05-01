/**
 * ============================================================
 * InteractiveCards — Geometry helper tests
 * ============================================================
 *
 * Pure-function tests for the math in geometry.ts. No DOM or
 * Svelte runtime required.
 *
 * 💡 TIP: Run `bun run test:ui` for a visual test interface!
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
	clamp,
	computeDiagonal,
	computeFan,
	detailPose,
	fanPoseFor,
	getCardH,
	getCardW,
	getSubGap,
	hash,
	lerp,
	toScreen
} from './geometry';

describe('InteractiveCards geometry', () => {
	describe('utility primitives', () => {
		it('lerp interpolates linearly', () => {
			expect(lerp(0, 10, 0)).toBe(0);
			expect(lerp(0, 10, 1)).toBe(10);
			expect(lerp(0, 10, 0.5)).toBe(5);
		});

		it('clamp bounds a value between lo and hi', () => {
			expect(clamp(-5, 0, 10)).toBe(0);
			expect(clamp(15, 0, 10)).toBe(10);
			expect(clamp(5, 0, 10)).toBe(5);
		});

		it('hash returns a deterministic value in [0, 1)', () => {
			const a = hash(7);
			const b = hash(7);
			expect(a).toBe(b);
			expect(a).toBeGreaterThanOrEqual(0);
			expect(a).toBeLessThan(1);
		});
	});

	describe('responsive sizing', () => {
		it('picks smaller card widths on narrow viewports', () => {
			// Viewport buckets from the spec
			expect(getCardW(400, 900)).toBeLessThan(getCardW(1440, 900));
		});

		it('scales down again on short viewports', () => {
			const tall = getCardW(1440, 1000);
			const short = getCardW(1440, 650);
			expect(short).toBeLessThan(tall);
		});

		it('card height is 1.33× card width (3:4 aspect)', () => {
			const w = getCardW(1440, 900);
			const h = getCardH(1440, 900);
			expect(h).toBeCloseTo(Math.round(w * 1.33), 0);
		});

		it('getSubGap mobile/desktop split', () => {
			expect(getSubGap(375, 900)).toBe(20); // mobile
			expect(getSubGap(1440, 1000)).toBe(-30); // desktop, tall
			expect(getSubGap(1440, 750)).toBe(0); // desktop, medium (700–800)
			expect(getSubGap(1440, 650)).toBe(10); // desktop, very short (<700)
		});
	});

	describe('fan layout', () => {
		const vw = 1440;
		const vh = 900;
		const titleTop = 120;
		const titleH = 140;
		const cfg = computeFan(vw, vh, titleTop, titleH);

		it('centres the middle card on the title column', () => {
			const mid = fanPoseFor(3, 7, cfg); // middle of 7
			expect(mid.x).toBeCloseTo(vw / 2, 1);
		});

		it('spreads outer cards symmetrically', () => {
			const left = fanPoseFor(0, 7, cfg);
			const right = fanPoseFor(6, 7, cfg);
			// Same distance from centre, opposite signs
			expect(left.x - vw / 2).toBeCloseTo(-(right.x - vw / 2), 1);
		});

		it('droop pushes outer cards below the middle', () => {
			const mid = fanPoseFor(3, 7, cfg);
			const right = fanPoseFor(6, 7, cfg);
			expect(right.y).toBeGreaterThan(mid.y);
		});
	});

	describe('conveyor projection', () => {
		const vw = 1440;
		const vh = 900;
		const diag = computeDiagonal(vw, vh, getCardH(vw, vh));

		it('wraps positions via modulo', () => {
			const len = diag.yEnd - diag.yStart;
			const a = toScreen(10, len, diag);
			const b = toScreen(10 + len, len, diag);
			expect(a.x).toBeCloseTo(b.x, 3);
			expect(a.y).toBeCloseTo(b.y, 3);
		});

		it('start and end map to xStart / xEnd', () => {
			const len = diag.yEnd - diag.yStart;
			const start = toScreen(0, len, diag);
			// Approach the end value without wrapping by using len - 1.
			const nearEnd = toScreen(len - 1, len, diag);
			// Start is exactly xStart (sin(0) = 0)
			expect(start.x).toBeCloseTo(diag.xStart, 3);
			// nearEnd should be very close to xEnd (sin(π) ≈ 0)
			expect(nearEnd.x).toBeCloseTo(diag.xEnd, 0);
		});

		it('curve bows outward (positive sin component)', () => {
			const len = diag.yEnd - diag.yStart;
			const mid = toScreen(len / 2, len, diag);
			// At t = 0.5, sin(π/2) = 1 → x is bowed out by curveBow past the linear midpoint.
			const linearMid = (diag.xStart + diag.xEnd) / 2;
			expect(mid.x).toBeGreaterThan(linearMid);
		});
	});

	describe('detail pose', () => {
		it('mobile positions card near the top centre', () => {
			const p = detailPose(375, 800);
			expect(p.x).toBeCloseTo(375 * 0.5, 3);
			expect(p.y).toBeCloseTo(800 * 0.25, 3);
			expect(p.scale).toBeCloseTo(1.4, 3);
		});

		it('desktop positions card left of centre, vertically centred', () => {
			const p = detailPose(1440, 900);
			expect(p.x).toBeCloseTo(1440 * 0.32, 3);
			expect(p.y).toBeCloseTo(900 * 0.5, 3);
			expect(p.scale).toBeCloseTo(1.35, 3);
		});
	});
});
