/**
 * Shared types for the StreamShowcase showcase component family.
 * Kept in their own module so tests + subcomponents + the demo route
 * can all import without circular dependencies.
 */

export type Playlist = {
	/** Stable kebab-case identifier, suitable for ?playlist= URL params (M2). */
	slug: string;
	/** Editorial title, ~2-4 words. Renders large on the card and in the modal. */
	title: string;
	/** One-line subtitle / category tag. */
	tag: string;
	/** Short marketing description (~80-140 chars). */
	description: string;
	/** Two CSS colour stops used to render the asset-free poster gradient. */
	cover: { from: string; to: string; accent: string };
	/** Total episode count — surfaced as a corner badge. */
	episodeCount: number;
};

export type Episode = {
	id: string;
	title: string;
	durationMin: number;
	/** Reserved for M2 — YouTube videoId or similar embed identifier. */
	videoId?: string;
};

/**
 * Compute the rotation angle (deg) for a card at index `i` in a fan of
 * cards centred on `active`.
 */
export function fanAngle(i: number, active: number, spread = 7): number {
	return (i - active) * spread;
}

/**
 * Wrap an index into the inclusive [0, max-1] range. Used by keyboard
 * handlers to clamp at the edges (no infinite scroll in M1).
 */
export function wrapIndex(i: number, max: number): number {
	if (max <= 0) return 0;
	if (i < 0) return 0;
	if (i >= max) return max - 1;
	return i;
}

/**
 * Smooth easing curve used for the deal-out entrance and rotation
 * transitions. Equivalent to CSS `cubic-bezier(0.22, 1, 0.36, 1)` but
 * directly callable for JS-driven animation in tests.
 */
export function easedRotation(t: number): number {
	const clamped = Math.max(0, Math.min(1, t));
	return 1 - Math.pow(1 - clamped, 3);
}
