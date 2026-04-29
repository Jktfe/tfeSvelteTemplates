/**
 * Shared types + pure helpers for the PortfolioPhotographer family.
 *
 * Kept in their own module so subcomponents, tests, and the demo route
 * can all import them without circular dependencies.
 */

export type Photo = {
	/** Stable kebab-case identifier, suitable for ?photo= URL params (M2). */
	id: string;
	/** One-line editorial caption. */
	caption: string;
	/** Category tag — surfaced as a corner badge on the tile. */
	category: string;
	/**
	 * Three-stop cinematic gradient that stands in for a real photograph
	 * in M1. M2 swaps to a real `src` image. Accent is used for the
	 * vignette / focus dot.
	 */
	cover: { from: string; via: string; to: string; accent: string };
	/** Reserved for M2 real-image swap-in (URL or imported asset). */
	src?: string;
};

/**
 * Halton low-discrepancy sequence — deterministic pseudo-random points
 * that look more visually "scattered" than uniform random, with no
 * clumping. Used to place the focal scatter dots.
 */
export function halton(index: number, base: number): number {
	let r = 0;
	let f = 1;
	let i = index;
	while (i > 0) {
		f = f / base;
		r = r + f * (i % base);
		i = Math.floor(i / base);
	}
	return r;
}

/** Returns a Halton point in [0,1)² using bases 2 (x) and 3 (y). */
export function haltonPoint(index: number): { x: number; y: number } {
	return { x: halton(index + 1, 2), y: halton(index + 1, 3) };
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
 * Build the keyframe % positions for a marquee that loops cleanly:
 * `0%` → start, `100%` → translateX(-50%) so a duplicated track
 * appears continuous.
 */
export function reelTrackOffset(progress: number): number {
	const p = clamp(progress, 0, 1);
	if (p === 0) return 0;
	return -50 * p;
}
