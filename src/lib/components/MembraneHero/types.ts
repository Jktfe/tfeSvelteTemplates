/**
 * Shared types + pure helpers for the MembraneHero family.
 *
 * Kept in their own module so subcomponents, tests, and the demo route
 * can all import them without circular dependencies.
 */

/** Three-stop palette preset. M2 will accept arbitrary hex triples. */
export type MembranePalette = 'aurora' | 'sunset' | 'polar';

/** Resolved colour stops once a palette name is mapped. */
export type PaletteStops = {
	from: string;
	via: string;
	to: string;
	/** Accent colour for the focal Lissajous dot. */
	accent: string;
};

/**
 * Map a named palette to its three colour stops + dot accent.
 * Pure function — same input always returns the same output.
 */
export function paletteToFilterStops(palette: MembranePalette): PaletteStops {
	switch (palette) {
		case 'aurora':
			return { from: '#0d9488', via: '#7c3aed', to: '#f59e0b', accent: '#fde68a' };
		case 'sunset':
			return { from: '#f43f5e', via: '#f59e0b', to: '#4338ca', accent: '#fed7aa' };
		case 'polar':
			return { from: '#1e293b', via: '#0ea5e9', to: '#67e8f9', accent: '#e0f2fe' };
	}
}

/**
 * Lissajous curve — parametric figure-8 / knot drawn by combining two
 * orthogonal sine waves at different frequencies. Used to give the
 * focal dot a wandering anchor that never repeats too quickly.
 *
 * Returns {x, y} in [-1, 1] which the caller scales to viewport units.
 */
export function lissajous(
	t: number,
	a: number,
	b: number,
	A: number,
	B: number,
	phase: number
): { x: number; y: number } {
	return {
		x: A * Math.sin(a * t + phase),
		y: B * Math.sin(b * t)
	};
}

/**
 * Build the SVG `<feTurbulence baseFrequency=…>` value as a function
 * of an animation progress in [0, 1]. M1 oscillates between 0.012 and
 * 0.024 — slow undulating breathe without the membrane looking like
 * static.
 */
export function buildTurbulenceFreq(progress: number): number {
	const p = clamp(progress, 0, 1);
	const lo = 0.012;
	const hi = 0.024;
	return lo + (hi - lo) * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
}

/** Linear interpolation between a and b. */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/** Clamp v to [lo, hi]. */
export function clamp(v: number, lo: number, hi: number): number {
	if (v < lo) return lo;
	if (v > hi) return hi;
	return v;
}

/**
 * Reactive-safe wrapper around `matchMedia('(prefers-reduced-motion: reduce)')`.
 * Returns false in non-browser environments (SSR, jsdom without media-query
 * support) so the deal-in still mounts but no continuous animation runs.
 */
export function isReducedMotion(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
