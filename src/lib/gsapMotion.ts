export type Gsap = typeof import('gsap').gsap;

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export async function loadGsap(): Promise<Gsap> {
	const { gsap } = await import('gsap');
	return gsap;
}

export function prefersReducedMotion(target?: Pick<Window, 'matchMedia'>): boolean {
	const win = target ?? (typeof window !== 'undefined' ? window : undefined);
	return Boolean(win?.matchMedia?.(REDUCED_MOTION_QUERY).matches);
}

export function finiteNumber(value: number, fallback: number): number {
	return Number.isFinite(value) ? value : fallback;
}

export function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(max, Math.max(min, value));
}
