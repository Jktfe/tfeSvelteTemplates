<script lang="ts" module>
	// ============================================================
	// NeonSign — pure helpers + types
	//
	// Exported via module-script so the test suite can assert
	// palette selection, shadow-stack composition, deterministic
	// flicker scheduling, and broken-letter masking without
	// rendering a component.
	// ============================================================

	export type PaletteName = 'pink' | 'cyan' | 'yellow' | 'green' | 'red' | 'purple';

	export interface NeonPalette {
		name: PaletteName;
		glow: string;
		halo: string;
		dim: string;
	}

	const PALETTES: Record<PaletteName, NeonPalette> = {
		pink: { name: 'pink', glow: '#ff3aa9', halo: 'rgba(255, 58, 169, 0.55)', dim: '#3a1a2a' },
		cyan: { name: 'cyan', glow: '#3affef', halo: 'rgba(58, 255, 239, 0.5)', dim: '#13343a' },
		yellow: {
			name: 'yellow',
			glow: '#ffe93a',
			halo: 'rgba(255, 233, 58, 0.5)',
			dim: '#3a3713'
		},
		green: { name: 'green', glow: '#3aff7a', halo: 'rgba(58, 255, 122, 0.5)', dim: '#143a22' },
		red: { name: 'red', glow: '#ff5a3a', halo: 'rgba(255, 90, 58, 0.55)', dim: '#3a1813' },
		purple: {
			name: 'purple',
			glow: '#bd5cff',
			halo: 'rgba(189, 92, 255, 0.5)',
			dim: '#2a1a3a'
		}
	};

	const PALETTE_NAMES = Object.keys(PALETTES) as PaletteName[];

	/**
	 * Resolve a palette by name. Falls back to `pink` on unknown
	 * input so consumers passing user data never crash.
	 */
	export function pickPalette(name: string): NeonPalette {
		if ((PALETTE_NAMES as string[]).includes(name)) {
			return PALETTES[name as PaletteName];
		}
		return PALETTES.pink;
	}

	/**
	 * Build a CSS `text-shadow` stack that fakes the inner tube
	 * core through to the outer atmospheric haze. Five stops give
	 * a soft, layered glow without any blur filter.
	 */
	export function buildShadowStack(palette: NeonPalette, intensity = 1): string {
		const i = Math.max(0, intensity);
		return [
			`0 0 ${(2 * i).toFixed(2)}px #fff`,
			`0 0 ${(4 * i).toFixed(2)}px ${palette.glow}`,
			`0 0 ${(8 * i).toFixed(2)}px ${palette.glow}`,
			`0 0 ${(16 * i).toFixed(2)}px ${palette.halo}`,
			`0 0 ${(32 * i).toFixed(2)}px ${palette.halo}`
		].join(', ');
	}

	export type FlickerProfile = 'none' | 'subtle' | 'broken';

	export interface FlickerStop {
		pct: number;
		opacity: number;
	}

	/**
	 * Build a deterministic keyframe schedule for the flicker
	 * animation. The seed makes the pattern stable across
	 * renders so a sign doesn't twitch differently on every paint.
	 *
	 * `subtle` → 2 short dips to ~0.7-0.9 (real-world neon).
	 * `broken` → 6 deeper dips to ~0.2-0.6 (failing tube).
	 */
	export function flickerSchedule(seed: number, profile: FlickerProfile = 'subtle'): FlickerStop[] {
		if (profile === 'none') {
			return [
				{ pct: 0, opacity: 1 },
				{ pct: 100, opacity: 1 }
			];
		}
		const stops: FlickerStop[] = [{ pct: 0, opacity: 1 }];
		let s = Math.abs(Math.floor(seed)) || 1;
		const rand = () => {
			s = (s * 9301 + 49297) % 233280;
			return s / 233280;
		};
		const dipCount = profile === 'broken' ? 6 : 2;
		const minOp = profile === 'broken' ? 0.2 : 0.7;
		const opSpan = profile === 'broken' ? 0.4 : 0.2;
		for (let n = 0; n < dipCount; n++) {
			const pct = Math.round(rand() * 96) + 2;
			const opacity = minOp + rand() * opSpan;
			stops.push({ pct, opacity });
			stops.push({ pct: Math.min(100, pct + 1), opacity: 1 });
		}
		stops.push({ pct: 100, opacity: 1 });
		return stops.sort((a, b) => a.pct - b.pct);
	}

	/**
	 * Compute per-character "broken" flags. Out-of-range indices
	 * in `brokenIndices` are silently ignored so callers can pass
	 * a fixed list even when the value shrinks.
	 */
	export function brokenMask(value: string, brokenIndices: number[] = []): boolean[] {
		const out: boolean[] = new Array(value.length);
		for (let i = 0; i < value.length; i++) out[i] = false;
		for (const idx of brokenIndices) {
			if (Number.isInteger(idx) && idx >= 0 && idx < value.length) {
				out[idx] = true;
			}
		}
		return out;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	type Props = {
		value: string;
		colour?: PaletteName;
		intensity?: number;
		flicker?: FlickerProfile;
		broken?: number[];
		on?: boolean;
		size?: 'sm' | 'md' | 'lg';
		seed?: number;
		class?: string;
	};

	const {
		value,
		colour = 'pink',
		intensity = 1,
		flicker = 'subtle',
		broken = [],
		on = true,
		size = 'md',
		seed = 7,
		class: extraClass = ''
	}: Props = $props();

	const palette = $derived(pickPalette(colour));
	const shadowStack = $derived(buildShadowStack(palette, intensity));
	const mask = $derived(brokenMask(value, broken));
	const chars = $derived(value.split(''));
	// flickerSchedule is exposed for the test suite + advanced
	// consumers; in CSS we use static keyframes and phase-shift
	// per-sign via --neon-delay (driven by seed).
	const animationName = $derived(
		flicker === 'none' ? 'none' : `neon-flicker-${flicker}`
	);
	const animationDelay = $derived(
		flicker === 'none' ? '0s' : `-${(Math.abs(seed) % 600) / 100}s`
	);
</script>

<span
	class="neon-root neon-size-{size} {extraClass}"
	class:neon-on={on}
	class:neon-off={!on}
	data-colour={palette.name}
	data-flicker={flicker}
	style:--neon-glow={palette.glow}
	style:--neon-halo={palette.halo}
	style:--neon-dim={palette.dim}
	style:--neon-shadow={shadowStack}
	style:--neon-anim={animationName}
	style:--neon-delay={animationDelay}
	aria-label={value}
	role="img"
>
	{#each chars as ch, idx (idx)}
		<span class="neon-char" class:neon-broken={mask[idx]} aria-hidden="true">{ch}</span>
	{/each}
</span>

<style>
	.neon-root {
		display: inline-flex;
		font-family: 'Brush Script MT', 'Lucida Handwriting', 'Marker Felt', cursive;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		color: #fff;
		user-select: none;
	}

	.neon-size-sm {
		font-size: 1.75rem;
	}
	.neon-size-md {
		font-size: 3rem;
	}
	.neon-size-lg {
		font-size: 5rem;
	}

	.neon-char {
		display: inline-block;
		text-shadow: var(--neon-shadow);
		transition: text-shadow 220ms ease;
		animation-name: var(--neon-anim);
		animation-duration: 6s;
		animation-iteration-count: infinite;
		animation-fill-mode: both;
		animation-delay: var(--neon-delay, 0s);
		animation-timing-function: steps(40, end);
		min-width: 0.2em;
	}

	/* Static, deterministic flicker keyframes. Per-sign phase-shift
	   is achieved via --neon-delay (driven by the seed prop) rather
	   than by generating per-instance keyframes. */
	@keyframes neon-flicker-subtle {
		0%, 12%, 13%, 100% { opacity: 1; }
		12.5% { opacity: 0.78; }
		47%, 48% { opacity: 1; }
		47.5% { opacity: 0.86; }
	}

	@keyframes neon-flicker-broken {
		0%, 100% { opacity: 1; }
		7% { opacity: 0.36; }
		7.4% { opacity: 1; }
		18% { opacity: 0.22; }
		18.6% { opacity: 1; }
		34% { opacity: 0.5; }
		34.5% { opacity: 1; }
		51% { opacity: 0.28; }
		51.5% { opacity: 1; }
		70% { opacity: 0.42; }
		70.5% { opacity: 1; }
		88% { opacity: 0.34; }
		88.6% { opacity: 1; }
	}

	.neon-on .neon-char {
		color: #fff;
	}

	/* Burnt-out tube — text colour drops to the dim shade and
	   the glow stack collapses to a single faint halo. */
	.neon-broken {
		color: var(--neon-dim);
		text-shadow:
			0 0 1px rgba(255, 255, 255, 0.06),
			0 0 4px rgba(0, 0, 0, 0.5);
		animation: none;
		opacity: 0.85;
	}

	/* Sign powered off — every character behaves as broken. */
	.neon-off .neon-char {
		color: var(--neon-dim);
		text-shadow:
			0 0 1px rgba(255, 255, 255, 0.04),
			0 0 4px rgba(0, 0, 0, 0.4);
		animation: none;
		opacity: 0.8;
	}

	@media (prefers-reduced-motion: reduce) {
		.neon-char {
			animation: none;
		}
	}
</style>
