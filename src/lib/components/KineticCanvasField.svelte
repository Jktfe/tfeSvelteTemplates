<!--
  ============================================================
  KineticCanvasField — Pointer Trail and Click-Burst Particle Layer
  ============================================================
  WHAT — Wraps content in a canvas particle layer: moving the pointer
  leaves a glowing trail and clicking fires a radial burst of sparks.

  WHY — Playful, bounded interactivity for hero panels and demo stages
  where content must stay clickable above the effect.

  FEATURES
  - Three palettes: aurora / ember / mono (hue ranges)
  - Click bursts of `density` particles; trail bursts of density / 12
  - Frame-rate independent friction plus gentle gravity
  - Hard cap of 260 live particles; frame delta clamped to 40ms
  - Canvas resized with ResizeObserver; device pixel ratio capped at 2
  - Pure helpers exported: clampParticleCount, createKineticParticle,
    stepKineticParticle

  ACCESSIBILITY
  - Canvas is aria-hidden and pointer-events: none; content sits above it
  - prefers-reduced-motion: reduce attaches no listeners or ticker and
    hides the canvas with CSS

  DEPENDENCIES — gsap (only gsap.ticker), lazily imported through
  $lib/gsapMotion. Copy that helper alongside.

  PERFORMANCE — One shared ticker callback; particle cap bounds the
  draw cost; listeners and ticker removed on unmount.

  USAGE
      <KineticCanvasField density={96} palette="aurora">
        <section>Interactive content stays above the canvas.</section>
      </KineticCanvasField>

  PROPS
  | Prop     | Type                          | Default  | Description |
  |----------|-------------------------------|----------|-------------|
  | density  | number                        | 72       | Particles per click burst (clamped 8–260) |
  | trail    | boolean                       | true     | Emit a trail on pointer move |
  | palette  | 'aurora' | 'ember' | 'mono'   | 'aurora' | Particle hue range |
  | children | Snippet                       | —        | Content above the canvas |
  | class    | string                        | ''       | Extra classes on the root |
  ============================================================
-->
<script lang="ts" module>
	import { clamp } from '$lib/gsapMotion';

	export interface KineticParticle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number;
		maxLife: number;
		size: number;
		hue: number;
	}

	export function clampParticleCount(count: number): number {
		return Math.round(clamp(count, 8, 260));
	}

	export function createKineticParticle(
		x: number,
		y: number,
		angle: number,
		speed: number,
		hue: number
	): KineticParticle {
		return {
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1,
			maxLife: 1,
			size: 2 + Math.random() * 5,
			hue
		};
	}

	/** Longest step we will simulate in one frame; stops a backgrounded tab from teleporting particles. */
	export const MAX_FRAME_DELTA = 0.04;

	/**
	 * Seconds elapsed since the previous frame, clamped for stability.
	 *
	 * `gsap.ticker` hands listeners its elapsed time already in SECONDS (unlike
	 * `requestAnimationFrame`, which passes milliseconds), so there is no
	 * `/ 1000` here — dividing again would make every frame ~1000x too short and
	 * freeze the particles in place. The first frame (no previous time) and any
	 * backwards jump fall back to a nominal 60fps step.
	 */
	export function tickerFrameDelta(time: number, lastTime: number | null): number {
		if (lastTime === null || !Number.isFinite(time) || time <= lastTime) return 1 / 60;
		return Math.min(MAX_FRAME_DELTA, time - lastTime);
	}

	export function stepKineticParticle(particle: KineticParticle, delta: number): KineticParticle {
		const friction = Math.pow(0.9, delta * 60);
		return {
			...particle,
			x: particle.x + particle.vx * delta,
			y: particle.y + particle.vy * delta,
			vx: particle.vx * friction,
			vy: particle.vy * friction + 28 * delta,
			life: Math.max(0, particle.life - delta / particle.maxLife)
		};
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { loadGsap, prefersReducedMotion, type Gsap } from '$lib/gsapMotion';

	interface Props {
		children?: Snippet;
		class?: string;
		density?: number;
		trail?: boolean;
		palette?: 'aurora' | 'ember' | 'mono';
	}

	let {
		children,
		class: className = '',
		density = 72,
		trail = true,
		palette = 'aurora'
	}: Props = $props();

	let root: HTMLDivElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	let gsapInstance: Gsap | null = null;
	let particles: KineticParticle[] = [];
	let lastTime: number | null = null;
	let width = 0;
	let height = 0;
	let pixelRatio = 1;

	const hueRanges = {
		aurora: [180, 285],
		ember: [12, 58],
		mono: [210, 220]
	};

	function hueForBurst(index: number, total: number) {
		const [from, to] = hueRanges[palette];
		return from + ((to - from) * index) / Math.max(1, total - 1);
	}

	function resizeCanvas() {
		if (!root || !canvas) return;
		const rect = root.getBoundingClientRect();
		pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		width = Math.max(1, rect.width);
		height = Math.max(1, rect.height);
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
	}

	function emit(x: number, y: number, count: number, force = 1) {
		const total = clampParticleCount(count);
		for (let index = 0; index < total; index += 1) {
			const angle = (Math.PI * 2 * index) / total + Math.random() * 0.28;
			const speed = (40 + Math.random() * 170) * force;
			const particle = createKineticParticle(x, y, angle, speed, hueForBurst(index, total));
			particle.maxLife = 0.55 + Math.random() * 0.75;
			particles.push(particle);
		}
		particles = particles.slice(-260);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!trail || prefersReducedMotion() || !root) return;
		const rect = root.getBoundingClientRect();
		emit(event.clientX - rect.left, event.clientY - rect.top, density / 12, 0.45);
	}

	function handlePointerDown(event: PointerEvent) {
		if (prefersReducedMotion() || !root) return;
		const rect = root.getBoundingClientRect();
		emit(event.clientX - rect.left, event.clientY - rect.top, density, 1.1);
	}

	function draw(time: number) {
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (!context) return;

		// `time` is gsap.ticker's elapsed time in seconds — see tickerFrameDelta.
		const delta = tickerFrameDelta(time, lastTime);
		lastTime = time;
		particles = particles.map((particle) => stepKineticParticle(particle, delta)).filter((p) => p.life > 0);

		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, width, height);
		context.globalCompositeOperation = 'lighter';

		for (const particle of particles) {
			const alpha = particle.life * particle.life;
			context.beginPath();
			context.fillStyle = `hsla(${particle.hue}, 92%, 64%, ${alpha})`;
			context.arc(particle.x, particle.y, particle.size * (0.6 + alpha), 0, Math.PI * 2);
			context.fill();
		}
	}

	onMount(() => {
		let cancelled = false;
		const resizeObserver = new ResizeObserver(resizeCanvas);

		void (async () => {
			const gsap = await loadGsap();
			if (cancelled || !root || !canvas || prefersReducedMotion()) return;
			gsapInstance = gsap;
			resizeCanvas();
			resizeObserver.observe(root);
			root.addEventListener('pointermove', handlePointerMove);
			root.addEventListener('pointerdown', handlePointerDown);
			gsap.ticker.add(draw);
		})();

		return () => {
			cancelled = true;
			resizeObserver.disconnect();
			root?.removeEventListener('pointermove', handlePointerMove);
			root?.removeEventListener('pointerdown', handlePointerDown);
			gsapInstance?.ticker.remove(draw);
			lastTime = null;
		};
	});
</script>

<div bind:this={root} class={`kinetic-canvas-field ${className}`}>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<div class="kinetic-content">
		{@render children?.()}
	</div>
</div>

<style>
	.kinetic-canvas-field {
		position: relative;
		overflow: hidden;
		border-radius: inherit;
		isolation: isolate;
	}

	canvas {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.kinetic-content {
		position: relative;
		z-index: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		canvas {
			display: none;
		}
	}
</style>
