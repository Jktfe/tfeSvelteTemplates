// ============================================================
// Cardwall — pure helpers + types
//
// Everything in this file is DOM-free so the test suite can
// assert offsets, perspective transforms, palette selection
// and motion-gate behaviour without rendering a component.
// ============================================================

export type CardwallDensity = 'sparse' | 'default' | 'dense';

export interface CardwallTilePalette {
	from: string;
	via: string;
	to: string;
	accent: string;
	label: string;
}

export interface CardwallRow {
	idx: number;
	speed: number; // pixels per second along x
	dir: 1 | -1;   // drift direction
	tilt: number;  // CSS rotateX in degrees
	tiles: CardwallTilePalette[];
}

/**
 * Compute the horizontal offset for a row at time `t` (seconds).
 * Wraps inside [0, period) so a duplicate-track marquee can render
 * the row at translateX(offset) and translateX(offset - period) to
 * give a seamless infinite loop.
 *
 * `dir = +1` drifts right-to-left (translateX decreasing), `-1`
 * drifts left-to-right.
 */
export function rowOffset(
	t: number,
	period: number,
	speed: number,
	dir: 1 | -1
): number {
	if (period <= 0) return 0;
	const raw = (t * speed * dir) % period;
	// Always return a value inside [0, period) so consumers can apply
	// a consistent translateX(-offset) without sign juggling. Normalise
	// the JS quirk where 0 * -1 yields -0 — consumers shouldn't have to
	// know about that.
	if (raw === 0) return 0;
	return raw < 0 ? raw + period : raw;
}

/**
 * Map a row index to a CSS transform string for the perspective
 * billboard. The middle row sits flat on the camera plane; rows
 * above tilt forward, rows below tilt back, both fading in scale
 * so the wall reads as a deep field rather than a flat band.
 *
 * Returns the transform that should sit on the row track itself.
 */
export function perspectiveTransform(rowIdx: number, totalRows: number): string {
	if (totalRows <= 0) return 'none';
	const mid = (totalRows - 1) / 2;
	// Position relative to the middle row, in [-1, 1].
	const rel = totalRows === 1 ? 0 : (rowIdx - mid) / mid;
	// Tilt the upper rows forward (negative rotateX), lower rows back.
	const tiltDeg = -rel * 14;
	// Outer rows shrink slightly so the perspective reads.
	const scale = 1 - Math.abs(rel) * 0.08;
	// Outer rows nudge along Y to compress the apparent depth.
	const ty = rel * 6; // pixels — tweak to taste
	return `translateY(${ty}px) rotateX(${tiltDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
}

/**
 * Halton(2, 3) low-discrepancy sequence value at index `i`.
 * Deterministic — the same `i` always returns the same value.
 * Used so SSR and client agree on tile palette seeds without an
 * RNG.
 */
export function halton(i: number, base: number): number {
	let f = 1;
	let r = 0;
	let n = i;
	while (n > 0) {
		f /= base;
		r += f * (n % base);
		n = Math.floor(n / base);
	}
	return r;
}

/**
 * Pick a tile palette deterministically from a seed integer.
 * Seeds are typically `(rowIdx * 100) + tileIdx` so every tile
 * across the wall gets a different but reproducible look.
 *
 * The label set is curated — short serif words that read at
 * billboard scale.
 */
export function pickTilePalette(seed: number): CardwallTilePalette {
	const h2 = halton(seed + 1, 2);
	const h3 = halton(seed + 1, 3);
	const palette = TILE_PALETTES[Math.floor(h2 * TILE_PALETTES.length) % TILE_PALETTES.length];
	const label = TILE_LABELS[Math.floor(h3 * TILE_LABELS.length) % TILE_LABELS.length];
	return { ...palette, label };
}

const TILE_PALETTES: Omit<CardwallTilePalette, 'label'>[] = [
	{ from: '#0f766e', via: '#0ea5e9', to: '#1e293b', accent: '#67e8f9' },
	{ from: '#7c3aed', via: '#db2777', to: '#1f1147', accent: '#f9a8d4' },
	{ from: '#f59e0b', via: '#dc2626', to: '#1c1917', accent: '#fbbf24' },
	{ from: '#10b981', via: '#0891b2', to: '#0f172a', accent: '#a7f3d0' },
	{ from: '#a855f7', via: '#6366f1', to: '#0c0a1f', accent: '#c4b5fd' },
	{ from: '#ec4899', via: '#f97316', to: '#1f0a1d', accent: '#fda4af' },
	{ from: '#14b8a6', via: '#3b82f6', to: '#0a0f1c', accent: '#5eead4' },
	{ from: '#fbbf24', via: '#f43f5e', to: '#1f1115', accent: '#fde68a' }
];

const TILE_LABELS = [
	'STORY',
	'CRAFT',
	'DRIFT',
	'SIGNAL',
	'NORTH',
	'CIPHER',
	'STILL',
	'SPARK',
	'ECHO',
	'OFFLINE',
	'CANVAS',
	'PROOF',
	'WARP',
	'PRELUDE',
	'STATUS',
	'INDIGO'
];

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp(x: number, lo: number, hi: number): number {
	return x < lo ? lo : x > hi ? hi : x;
}

/**
 * Read-only motion-preference probe. Returns `false` in non-DOM
 * environments so SSR + tests stay deterministic.
 */
export function isReducedMotion(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Build a row spec list for a given density. Speeds and tilt are
 * deterministic so SSR and client render the same wall.
 */
export function buildRows(density: CardwallDensity, tilesPerRow: number): CardwallRow[] {
	const rowCount = density === 'sparse' ? 3 : density === 'dense' ? 7 : 5;
	const rows: CardwallRow[] = [];
	for (let r = 0; r < rowCount; r++) {
		const tiles: CardwallTilePalette[] = [];
		for (let i = 0; i < tilesPerRow; i++) {
			tiles.push(pickTilePalette(r * 100 + i));
		}
		rows.push({
			idx: r,
			speed: 12 + ((r * 7) % 18), // 12..29 px/s — alternates feel
			dir: r % 2 === 0 ? 1 : -1,
			tilt: 0, // tilt comes from perspectiveTransform now; reserved for M2 swap
			tiles
		});
	}
	return rows;
}
