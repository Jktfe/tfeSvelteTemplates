/**
 * ============================================================
 * InteractiveCards — Geometry helpers
 * ============================================================
 *
 * Pure functions shared by the InteractiveCards component tree.
 * Kept in a plain TS module so the scroll-heavy maths can be unit
 * tested without spinning up the Svelte runtime.
 *
 * Mirrors sections 4, 6 and 8 of the reference spec.
 * ============================================================
 */

export const MOBILE_BREAKPOINT = 768;
export const FAN_GAP_DESKTOP = 35;
export const FAN_GAP_MOBILE = 20;
export const SUB_HEIGHT_EST = 100;

/**
 * Deterministic pseudo-random number in [0, 1) from an integer seed.
 * Same trick as in the spec so badge rotations are stable across renders.
 */
export function hash(n: number): number {
	const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Gap between cards and the summary block underneath.
 * Mobile pushes the summary further down; tall desktop viewports allow a small
 * negative overlap so the text tucks behind the lowest droop of the fan.
 */
export function getSubGap(vw: number, vh: number): number {
	if (vw < MOBILE_BREAKPOINT) return 20;
	if (vh < 700) return 10;
	if (vh < 800) return 0;
	return -30;
}

/**
 * Responsive card width (px). Follows spec section 8 exactly, then scales
 * down on short viewports so the whole composition never overflows.
 */
export function getCardW(vw: number, vh: number): number {
	let w: number;
	if (vw < 480) w = 126;
	else if (vw < 640) w = 153;
	else if (vw < 768) w = 180;
	else if (vw < 1024) w = 216;
	else w = 252;

	if (vh < 700) w *= 0.7;
	else if (vh < 800) w *= 0.8;
	else if (vh < 900) w *= 0.9;

	return Math.round(w);
}

/** Card aspect ratio is fixed 3:4 — height always derives from width. */
export function getCardH(vw: number, vh: number): number {
	return Math.round(getCardW(vw, vh) * 1.33);
}

export interface FanConfig {
	centerX: number;
	centerY: number;
	spread: number;
	droop: number;
	rotationStep: number;
	scale: number;
	cardW: number;
	cardH: number;
}

/**
 * Compute the parabolic fan layout used for the hero pose (section 6b).
 * `titleTop` is where the hero headline sits; cards hang in a gentle droop
 * below it with a `fanGap` breathing room.
 */
export function computeFan(
	vw: number,
	vh: number,
	titleTop: number,
	titleHeight: number
): FanConfig {
	const isMobile = vw < MOBILE_BREAKPOINT;
	const cardW = getCardW(vw, vh);
	const cardH = getCardH(vw, vh);
	const fanGap = isMobile ? FAN_GAP_MOBILE : FAN_GAP_DESKTOP;
	const spread = isMobile ? vw * 0.1 : vw * 0.09;
	const droop = isMobile ? vh * 0.06 : vh * 0.1;
	const rotationStep = isMobile ? 4 : 5.5;
	const scale = isMobile ? 0.85 : 1;
	return {
		centerX: vw / 2,
		centerY: titleTop + titleHeight + fanGap + cardH / 2,
		spread,
		droop,
		rotationStep,
		scale,
		cardW,
		cardH
	};
}

/**
 * Place card `i` of `n` within the fan. Offset is centred around zero so the
 * middle card sits directly under the title and outer cards splay symmetrically.
 */
export function fanPoseFor(i: number, n: number, cfg: FanConfig) {
	const offset = i - (n - 1) / 2;
	const norm = offset / ((n - 1) / 2 || 1);
	return {
		x: cfg.centerX + offset * cfg.spread,
		y: cfg.centerY + norm * norm * cfg.droop,
		rotation: offset * cfg.rotationStep,
		scale: cfg.scale
	};
}

export interface DiagonalConfig {
	xStart: number;
	xEnd: number;
	yStart: number;
	yEnd: number;
	curveBow: number;
	margin: number;
}

/**
 * Build the parameters for the curved conveyor path (section 6c).
 * On mobile the path tilts near the lower third of the viewport; on desktop
 * it sweeps corner-to-corner with a gentle outward bow.
 */
export function computeDiagonal(vw: number, vh: number, cardH: number): DiagonalConfig {
	const isMobile = vw < MOBILE_BREAKPOINT;
	const margin = cardH * 0.75;
	return {
		xStart: isMobile ? vw * -0.1 : vw * 0.1,
		xEnd: isMobile ? vw * 1.1 : vw * 0.8,
		yStart: isMobile ? vh * 0.65 - margin : -margin,
		yEnd: isMobile ? vh * 0.8 + margin : vh + margin,
		curveBow: isMobile ? vw * 0.06 : vw * 0.12,
		margin
	};
}

/**
 * Project a conveyor position (in screen-length units) onto the curved path.
 * Wraps around `visibleLen` so cards recycle seamlessly.
 */
export function toScreen(pos: number, visibleLen: number, cfg: DiagonalConfig) {
	const wp = ((pos % visibleLen) + visibleLen) % visibleLen;
	const t = wp / visibleLen;
	return {
		x: cfg.xStart + t * (cfg.xEnd - cfg.xStart) + Math.sin(t * Math.PI) * cfg.curveBow,
		y: cfg.yStart + t * (cfg.yEnd - cfg.yStart)
	};
}

/**
 * Detail-view pose (section 6d). Mobile slides the card high and centres it;
 * desktop tucks it left-of-centre to leave the info panel space.
 */
export function detailPose(vw: number, vh: number) {
	const isMobile = vw < MOBILE_BREAKPOINT;
	return {
		x: isMobile ? vw * 0.5 : vw * 0.32,
		y: isMobile ? vh * 0.25 : vh * 0.5,
		scale: isMobile ? 1.4 : 1.35
	};
}
