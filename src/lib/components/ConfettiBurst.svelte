<!--
  ============================================================
  ConfettiBurst

  WHAT
  Trigger-fired celebration particle burst. Mount once anywhere
  on the page; call fire() imperatively (or pass an origin) when
  a moment deserves celebration — successful submit, level-up,
  hold-to-confirm completion, payment received. Canvas-rendered
  for 60fps even at high particle counts; DOM stays empty while
  idle.

  FEATURES
  • Imperative fire(opts?) method via bind:this — call from any
    event handler. Optional opts override origin and palette
    per-shot without re-mounting.
  • onComplete callback fires when the burst finishes (or
    immediately under reduced motion).
  • Configurable count [10, 500], spread [0, 180]°, velocity,
    gravity, duration [200, 5000] ms, palette, origin.
  • origin accepts 'center' or { x, y } in viewport coordinates.
  • Canvas mounts on first fire and unmounts after the burst —
    zero DOM cost while idle.
  • prefers-reduced-motion bypass: fire() returns immediately
    with onComplete; no animation. Caller is responsible for
    any non-animated success indication.
  • Pure-physics helpers exported from module script — seeded
    RNG makes generateParticles deterministic for tests.

  ACCESSIBILITY
  • aria-hidden="true" on the canvas — pure decoration; the
    semantic event (success, confirm) is signalled by the
    consumer's own UI, not the burst itself.
  • prefers-reduced-motion: reduce → animation skipped, contract
    preserved (onComplete still fires).

  PERFORMANCE
  • Single <canvas> only mounted while a burst is in flight.
  • One rAF loop per active burst. Frame work is O(count) draw
    calls — 80 particles × 60fps ≈ 4800 ops/sec, comfortably
    under the GPU envelope.
  • All physics is pure functions — testable without DOM.

  USAGE
  <script>
    let burst;
  </script>
  <ConfettiBurst bind:this={burst} />
  <button onclick={() => burst.fire()}>Celebrate</button>

  PROPS
  | Prop          | Type                            | Default  |
  |---------------|---------------------------------|----------|
  | count         | number                          | 80       |
  | spread        | number  (degrees, [0, 180])     | 70       |
  | velocity      | number  (px / sec)              | 800      |
  | gravity       | number  (px / sec²)             | 1500     |
  | duration      | number  (ms, [200, 5000])       | 1800     |
  | palette       | string[]                        | rainbow  |
  | origin        | 'center' \| { x, y }             | 'center' |
  | onComplete    | () => void                      | () => {} |
  | ariaLabel     | string                          | 'Celebration' |
  | class         | string                          | ''       |
  ============================================================
-->

<script lang="ts" module>
	// ============================================================
	// ConfettiBurst — pure helpers + types
	//
	// All physics, RNG, and prop normalization lives in module
	// scope so the test suite can verify it without rendering
	// a canvas. The instance script below composes these helpers
	// behind a rAF loop.
	// ============================================================

	export type ConfettiOrigin = 'center' | { x: number; y: number };

	export interface ConfettiParticle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		rotation: number;
		angularVelocity: number;
		color: string;
		opacity: number;
	}

	export const DEFAULT_PALETTE: readonly string[] = [
		'#f87171',
		'#fbbf24',
		'#34d399',
		'#60a5fa',
		'#a78bfa',
		'#f472b6'
	];

	/**
	 * Clamp particle count into [10, 500].
	 * • Below 10 the burst looks broken / accidental.
	 * • Above 500 the canvas frame budget starts to hitch on
	 *   weaker hardware.
	 * Non-finite / non-numeric input falls back to 80.
	 */
	export function clampCount(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 80;
		if (n < 10) return 10;
		if (n > 500) return 500;
		return Math.floor(n);
	}

	/**
	 * Clamp burst duration into [200, 5000] ms.
	 * • Below 200 ms the eye barely registers the celebration.
	 * • Above 5 s it overstays its welcome.
	 * Non-finite / non-numeric input falls back to 1800 ms.
	 */
	export function clampDuration(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 1800;
		if (n < 200) return 200;
		if (n > 5000) return 5000;
		return n;
	}

	/**
	 * Clamp spread angle into [0, 180]° — full omnidirectional
	 * burst at 180, narrow upward cone at 0.
	 */
	export function clampSpread(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 70;
		if (n < 0) return 0;
		if (n > 180) return 180;
		return n;
	}

	/**
	 * Resolve origin prop into absolute canvas coordinates.
	 * 'center' or invalid inputs default to canvas centre.
	 */
	export function parseOrigin(origin: unknown, w: number, h: number): { x: number; y: number } {
		if (
			origin &&
			typeof origin === 'object' &&
			'x' in origin &&
			'y' in origin &&
			typeof (origin as { x: unknown }).x === 'number' &&
			typeof (origin as { y: unknown }).y === 'number' &&
			Number.isFinite((origin as { x: number }).x) &&
			Number.isFinite((origin as { y: number }).y)
		) {
			const o = origin as { x: number; y: number };
			return { x: o.x, y: o.y };
		}
		return { x: w / 2, y: h / 2 };
	}

	/**
	 * mulberry32 — small fast PRNG with a 32-bit seed. Used so
	 * generateParticles is deterministic in tests; production
	 * runs pass a fresh Math.random()-derived seed.
	 */
	export function mulberry32(seed: number): () => number {
		let s = seed >>> 0;
		return function () {
			s = (s + 0x6d2b79f5) | 0;
			let t = s;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	export interface GenerateParticlesOptions {
		count: number;
		palette: readonly string[];
		origin: { x: number; y: number };
		spread: number; // degrees
		velocity: number; // pixels / sec
		seed?: number;
	}

	/**
	 * Pure particle factory. Given inputs and a seed, returns the
	 * same particle list every time — so tests can assert exact
	 * positions / colors without mocking RNG globally.
	 */
	export function generateParticles(opts: GenerateParticlesOptions): ConfettiParticle[] {
		const random = mulberry32(opts.seed ?? 1);
		const palette = opts.palette.length > 0 ? opts.palette : DEFAULT_PALETTE;
		const halfSpreadRad = (opts.spread / 2) * (Math.PI / 180);
		const particles: ConfettiParticle[] = [];
		for (let i = 0; i < opts.count; i++) {
			// Angle measured from straight up (-π/2) with ± halfSpread.
			const angle = -Math.PI / 2 + (random() * 2 - 1) * halfSpreadRad;
			const speed = opts.velocity * (0.55 + random() * 0.45);
			particles.push({
				x: opts.origin.x,
				y: opts.origin.y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: 4 + random() * 6,
				rotation: random() * Math.PI * 2,
				angularVelocity: (random() * 2 - 1) * 8,
				color: palette[Math.floor(random() * palette.length)] ?? palette[0] ?? '#fff',
				opacity: 1
			});
		}
		return particles;
	}

	/**
	 * Advance one particle by deltaSeconds. Pure: takes a particle,
	 * returns a new particle. Drag is a flat 1% per frame to simulate
	 * air resistance without an explicit drag coefficient prop.
	 *
	 * elapsedMs / totalMs drive the linear opacity ramp — particles
	 * are fully opaque at t=0, fade to 0 at t=totalMs.
	 */
	export function stepParticle(
		p: ConfettiParticle,
		deltaSec: number,
		gravity: number,
		elapsedMs: number,
		totalMs: number
	): ConfettiParticle {
		const drag = 0.99;
		return {
			...p,
			x: p.x + p.vx * deltaSec,
			y: p.y + p.vy * deltaSec,
			vx: p.vx * drag,
			vy: p.vy * drag + gravity * deltaSec,
			rotation: p.rotation + p.angularVelocity * deltaSec,
			opacity: Math.max(0, 1 - elapsedMs / Math.max(1, totalMs))
		};
	}

	/**
	 * Browser-safe `prefers-reduced-motion: reduce` probe. False
	 * during SSR / Node so the server-rendered markup matches the
	 * default-animated client render before onMount adjusts.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';

	interface Props {
		count?: number;
		spread?: number;
		velocity?: number;
		gravity?: number;
		duration?: number;
		palette?: readonly string[];
		origin?: ConfettiOrigin;
		onComplete?: () => void;
		ariaLabel?: string;
		class?: string;
	}

	let {
		count = 80,
		spread = 70,
		velocity = 800,
		gravity = 1500,
		duration = 1800,
		palette = DEFAULT_PALETTE,
		origin = 'center',
		onComplete = () => {},
		ariaLabel = 'Celebration',
		class: className = ''
	}: Props = $props();

	let firing = $state(false);
	let canvas = $state<HTMLCanvasElement | null>(null);

	let particles: ConfettiParticle[] = [];
	let rafId: number | null = null;
	let startedAt = 0;

	function stop() {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		firing = false;
		particles = [];
	}

	function frame(now: number) {
		const elapsedMs = now - startedAt;
		const totalMs = clampDuration(duration);

		if (!canvas) {
			rafId = requestAnimationFrame(frame);
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			// Canvas unsupported — abort gracefully and fire onComplete.
			stop();
			onComplete();
			return;
		}

		const dtSec = 1 / 60;
		particles = particles.map((p) => stepParticle(p, dtSec, gravity, elapsedMs, totalMs));

		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		for (const p of particles) {
			ctx.save();
			ctx.globalAlpha = p.opacity;
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rotation);
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
			ctx.restore();
		}

		if (elapsedMs >= totalMs) {
			stop();
			onComplete();
			return;
		}

		rafId = requestAnimationFrame(frame);
	}

	export function fire(opts?: { origin?: ConfettiOrigin; palette?: readonly string[] }): void {
		if (isReducedMotion()) {
			onComplete();
			return;
		}

		const w = typeof window !== 'undefined' ? window.innerWidth : 0;
		const h = typeof window !== 'undefined' ? window.innerHeight : 0;
		const resolvedOrigin = parseOrigin(opts?.origin ?? origin, w, h);
		const resolvedPalette = opts?.palette ?? palette;

		particles = generateParticles({
			count: clampCount(count),
			palette: resolvedPalette,
			origin: resolvedOrigin,
			spread: clampSpread(spread),
			velocity,
			seed: Math.floor(Math.random() * 0xffffffff)
		});

		firing = true;
		startedAt = typeof performance !== 'undefined' ? performance.now() : 0;

		// Canvas dimension assignment must wait for the {#if firing}
		// branch to render the <canvas>. Defer one frame.
		if (typeof requestAnimationFrame !== 'undefined') {
			rafId = requestAnimationFrame((now) => {
				if (canvas) {
					canvas.width = w;
					canvas.height = h;
				}
				startedAt = now;
				frame(now);
			});
		}
	}

	onDestroy(() => stop());
</script>

{#if firing}
	<canvas
		bind:this={canvas}
		class="confetti-canvas {className}"
		aria-hidden="true"
		aria-label={ariaLabel}
	></canvas>
{/if}

<style>
	.confetti-canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 9999;
	}
</style>
