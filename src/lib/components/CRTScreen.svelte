<script lang="ts" module>
	// ============================================================
	// CRTScreen — pure helpers + types
	//
	// Exported via module-script so the test suite can assert
	// profile resolution, gradient construction, aberration
	// shadow stacks, and roll-schedule maths without rendering.
	// ============================================================

	export type ProfileName = 'amber' | 'green' | 'broadcast' | 'modern';

	export interface CRTProfile {
		name: ProfileName;
		fg: string;
		bg: string;
		scan: string;
		aberrationR: string;
		aberrationB: string;
		vignette: string;
	}

	const PROFILES: Record<ProfileName, CRTProfile> = {
		amber: {
			name: 'amber',
			fg: '#ffb84d',
			bg: '#160d05',
			scan: 'rgba(0, 0, 0, 0.42)',
			aberrationR: 'rgba(255, 80, 40, 0.7)',
			aberrationB: 'rgba(40, 200, 255, 0.55)',
			vignette: 'rgba(0, 0, 0, 0.6)'
		},
		green: {
			name: 'green',
			fg: '#7dff8a',
			bg: '#031208',
			scan: 'rgba(0, 0, 0, 0.5)',
			aberrationR: 'rgba(255, 80, 80, 0.6)',
			aberrationB: 'rgba(80, 230, 255, 0.55)',
			vignette: 'rgba(0, 0, 0, 0.65)'
		},
		broadcast: {
			name: 'broadcast',
			fg: '#f8f8f8',
			bg: '#1a1428',
			scan: 'rgba(0, 0, 0, 0.36)',
			aberrationR: 'rgba(255, 60, 60, 0.85)',
			aberrationB: 'rgba(60, 110, 255, 0.85)',
			vignette: 'rgba(0, 0, 0, 0.55)'
		},
		modern: {
			name: 'modern',
			fg: '#e2e8f0',
			bg: '#0f172a',
			scan: 'rgba(255, 255, 255, 0.04)',
			aberrationR: 'rgba(244, 114, 182, 0.7)',
			aberrationB: 'rgba(56, 189, 248, 0.7)',
			vignette: 'rgba(0, 0, 0, 0.45)'
		}
	};

	const PROFILE_NAMES = Object.keys(PROFILES) as ProfileName[];

	/**
	 * Resolve a profile by name. Falls back to `amber` on unknown
	 * input so consumers passing user data never crash.
	 */
	export function pickProfile(name: string): CRTProfile {
		if ((PROFILE_NAMES as string[]).includes(name)) {
			return PROFILES[name as ProfileName];
		}
		return PROFILES.amber;
	}

	/**
	 * Build the repeating-linear-gradient that paints horizontal
	 * scanlines. `density` is the cycle height in pixels (smaller =
	 * tighter lines, larger = chunky CRT). `intensity` clamps to
	 * [0, 1] and modulates the dark stop's alpha multiplier.
	 */
	export function buildScanlineGradient(
		intensity: number,
		density: number,
		profile: CRTProfile
	): string {
		const safeI = Math.max(0, Math.min(1, intensity));
		const safeD = Math.max(1, Math.round(density));
		const lineHeight = safeI === 0 ? 0 : Math.max(1, Math.round(safeI * 1.2));
		return `repeating-linear-gradient(0deg, ${profile.scan} 0px, ${profile.scan} ${lineHeight}px, transparent ${lineHeight}px, transparent ${safeD}px)`;
	}

	/**
	 * Build a text-shadow string that splits R and B channels
	 * either side of the glyph centre. `amount` is the offset in
	 * pixels; profile gives the channel colours so amber/green/
	 * broadcast/modern each ghost differently.
	 */
	export function buildAberrationShadow(amount: number, profile: CRTProfile): string {
		const a = Math.max(0, amount);
		if (a === 0) return 'none';
		return `${a.toFixed(2)}px 0 0 ${profile.aberrationR}, -${a.toFixed(2)}px 0 0 ${profile.aberrationB}`;
	}

	export interface RollSchedule {
		duration: string;
		animationName: string;
	}

	/**
	 * Map a 0-10 speed knob to a CSS animation duration. Speed 0
	 * disables the roll (animation: none). The animation name is
	 * fixed so the keyframes can live as a single static rule in
	 * the component's style block.
	 */
	export function rollSchedule(speed: number): RollSchedule {
		const safe = Math.max(0, Math.min(10, speed));
		if (safe === 0) {
			return { duration: '0s', animationName: 'none' };
		}
		// Higher speed → shorter duration. 1 → 18s, 10 → 1.8s.
		const seconds = (18 / safe).toFixed(2);
		return { duration: `${seconds}s`, animationName: 'crt-roll' };
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		profile?: ProfileName;
		density?: number;
		intensity?: number;
		aberration?: number;
		roll?: boolean | number;
		vignette?: boolean;
		curved?: boolean;
		class?: string;
		children?: Snippet;
	};

	const {
		profile: profileName = 'amber',
		density = 3,
		intensity = 1,
		aberration = 1,
		roll = false,
		vignette = true,
		curved = false,
		class: extraClass = '',
		children
	}: Props = $props();

	const profile = $derived(pickProfile(profileName));
	const scanGradient = $derived(buildScanlineGradient(intensity, density, profile));
	const aberrationShadow = $derived(buildAberrationShadow(aberration, profile));
	const rollSpeed = $derived(typeof roll === 'number' ? roll : roll ? 3 : 0);
	const rollCfg = $derived(rollSchedule(rollSpeed));
</script>

<div
	class="crt-root {extraClass}"
	class:crt-vignette={vignette}
	class:crt-curved={curved}
	data-profile={profile.name}
	style:--crt-fg={profile.fg}
	style:--crt-bg={profile.bg}
	style:--crt-scan-gradient={scanGradient}
	style:--crt-aberration={aberrationShadow}
	style:--crt-vignette-color={profile.vignette}
	style:--crt-roll-duration={rollCfg.duration}
	style:--crt-roll-name={rollCfg.animationName}
>
	<div class="crt-screen">
		<div class="crt-content">
			{#if children}{@render children()}{/if}
		</div>
		<div class="crt-overlay crt-scanlines" aria-hidden="true"></div>
		<div class="crt-overlay crt-roll" aria-hidden="true"></div>
		{#if vignette}
			<div class="crt-overlay crt-vignette-layer" aria-hidden="true"></div>
		{/if}
	</div>
</div>

<style>
	.crt-root {
		position: relative;
		display: inline-block;
		background: var(--crt-bg);
		color: var(--crt-fg);
		border-radius: 0.65rem;
		padding: 0;
		overflow: hidden;
		box-shadow:
			0 30px 60px -30px rgba(0, 0, 0, 0.6),
			inset 0 0 0 2px rgba(255, 255, 255, 0.05);
	}

	.crt-screen {
		position: relative;
		min-width: 16rem;
		padding: 1.75rem 2.25rem;
	}

	.crt-content {
		position: relative;
		z-index: 1;
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		text-shadow: var(--crt-aberration);
	}

	.crt-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}

	.crt-scanlines {
		background: var(--crt-scan-gradient);
		mix-blend-mode: multiply;
	}

	.crt-roll {
		background: linear-gradient(
			180deg,
			transparent 0%,
			transparent 40%,
			rgba(255, 255, 255, 0.05) 48%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.05) 52%,
			transparent 60%,
			transparent 100%
		);
		background-size: 100% 200%;
		background-position: 0 -100%;
		animation-name: var(--crt-roll-name);
		animation-duration: var(--crt-roll-duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		mix-blend-mode: screen;
	}

	@keyframes crt-roll {
		0% {
			background-position: 0 -100%;
		}
		100% {
			background-position: 0 100%;
		}
	}

	.crt-vignette-layer {
		background: radial-gradient(ellipse at center, transparent 50%, var(--crt-vignette-color) 100%);
	}

	.crt-curved .crt-screen {
		border-radius: 1.5rem;
		transform: perspective(900px);
	}

	.crt-curved::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 1.5rem;
		box-shadow: inset 0 0 6rem rgba(0, 0, 0, 0.5);
		pointer-events: none;
		z-index: 3;
	}

	@media (prefers-reduced-motion: reduce) {
		.crt-roll {
			animation: none;
		}
		.crt-content {
			text-shadow: none;
		}
	}
</style>
