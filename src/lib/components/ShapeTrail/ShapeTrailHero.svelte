<!--
	===========================================================
	SHAPE TRAIL HERO
	===========================================================
	WHAT
	A hero canvas where simple geometric primitives (circles, squares,
	triangles) follow the pointer with damped trails. Click to "settle"
	the shapes into a target lattice; click again to release.

	WHY
	Editorial heroes, marketing landing pages, "this is a kinetic studio"
	moments where you need a single arresting interaction without burning
	the whole render pipeline on a heavy 3D scene.

	FEATURES
	- 2D canvas with rAF physics for the per-particle spring step
	- GSAP timeline staging the entrance (canvas fade + content slide + status slide)
	- GSAP `gsap.to` / `fromTo` for the settle/release transition on the
	  content + status pill (scale and opacity ease)
	- 32 default shapes; configurable density (8–128)
	- Three palette presets: mono / aurora / amber
	- Click to settle into a lattice; click again to release
	- Honours prefers-reduced-motion (skips animation, draws static lattice)
	- Mobile: tap = settle/release; passive listener so scrolling stays smooth

	ACCESSIBILITY
	- Wrapper carries `role="button" aria-pressed={settled}` + tabindex="0"
	- Canvas marked aria-hidden — purely decorative
	- Live-region status announces "settled" / "released" state

	DEPENDENCIES
	`gsap` core (already a project dep) for the entrance + state transitions.
	Native canvas2d + rAF for the per-particle spring physics that runs
	continuously at 60fps.

	USAGE
	<ShapeTrailHero density={48} palette="aurora" />

	PROPS
	See `ShapeTrailHeroProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { ShapeTrailHeroProps } from '$lib/types';

	let {
		density = 32,
		palette = 'aurora',
		ariaLabel = 'Shape Trail hero',
		class: className = ''
	}: ShapeTrailHeroProps = $props();

	type ShapeKind = 'circle' | 'square' | 'triangle';

	type Particle = {
		x: number;
		y: number;
		tx: number;
		ty: number;
		vx: number;
		vy: number;
		r: number;
		hue: number;
		kind: ShapeKind;
		seed: number;
	};

	const PALETTE_HUES: Record<NonNullable<ShapeTrailHeroProps['palette']>, [number, number]> = {
		mono: [210, 220],
		aurora: [185, 295],
		amber: [16, 60]
	};

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let wrapperEl: HTMLDivElement | undefined = $state();
	let settled = $state(false);
	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;
	let lastSettled = false;
	let width = 0;
	let height = 0;
	let pixelRatio = 1;
	let rafId = 0;
	let pointer = { x: 0, y: 0, active: false };
	let particles: Particle[] = [];

	const clampedDensity = $derived(Math.round(Math.max(8, Math.min(128, density))));

	function rand(seed: number): number {
		const x = Math.sin(seed * 12.9898) * 43758.5453;
		return x - Math.floor(x);
	}

	function buildParticles(count: number, w: number, h: number): Particle[] {
		const [hueMin, hueMax] = PALETTE_HUES[palette];
		const out: Particle[] = [];
		const cols = Math.ceil(Math.sqrt(count));
		const rows = Math.ceil(count / cols);
		const cellW = w / cols;
		const cellH = h / rows;
		const kinds: ShapeKind[] = ['circle', 'square', 'triangle'];
		for (let i = 0; i < count; i += 1) {
			const col = i % cols;
			const row = Math.floor(i / cols);
			const seed = i + 1;
			const tx = cellW * (col + 0.5);
			const ty = cellH * (row + 0.5);
			const r = 6 + rand(seed) * 10;
			const hue = hueMin + rand(seed * 31) * (hueMax - hueMin);
			out.push({
				x: tx + (rand(seed * 7) - 0.5) * 80,
				y: ty + (rand(seed * 11) - 0.5) * 80,
				tx,
				ty,
				vx: 0,
				vy: 0,
				r,
				hue,
				kind: kinds[i % kinds.length],
				seed
			});
		}
		return out;
	}

	function resize() {
		if (!canvasEl || !wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		width = Math.max(1, Math.round(rect.width));
		height = Math.max(1, Math.round(rect.height));
		pixelRatio = Math.min(2, window.devicePixelRatio || 1);
		canvasEl.width = width * pixelRatio;
		canvasEl.height = height * pixelRatio;
		canvasEl.style.width = `${width}px`;
		canvasEl.style.height = `${height}px`;
		particles = buildParticles(clampedDensity, width, height);
	}

	function drawShape(ctx: CanvasRenderingContext2D, p: Particle) {
		ctx.fillStyle = `hsla(${p.hue}, 70%, 62%, 0.9)`;
		ctx.strokeStyle = `hsla(${p.hue}, 70%, 78%, 0.85)`;
		ctx.lineWidth = 1.25;
		if (p.kind === 'circle') {
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			ctx.fill();
		} else if (p.kind === 'square') {
			ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
		} else {
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - p.r);
			ctx.lineTo(p.x + p.r, p.y + p.r);
			ctx.lineTo(p.x - p.r, p.y + p.r);
			ctx.closePath();
			ctx.fill();
		}
	}

	function tick() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.save();
		ctx.scale(pixelRatio, pixelRatio);
		ctx.fillStyle = 'rgba(7, 8, 16, 0.18)';
		ctx.fillRect(0, 0, width, height);

		for (const p of particles) {
			let targetX: number;
			let targetY: number;
			if (settled) {
				targetX = p.tx;
				targetY = p.ty;
			} else if (pointer.active) {
				const angle = (p.seed * 137.5) * (Math.PI / 180);
				const radius = 60 + (p.seed % 7) * 14;
				targetX = pointer.x + Math.cos(angle) * radius;
				targetY = pointer.y + Math.sin(angle) * radius;
			} else {
				targetX = p.tx;
				targetY = p.ty;
			}
			const dx = targetX - p.x;
			const dy = targetY - p.y;
			p.vx = (p.vx + dx * 0.012) * 0.86;
			p.vy = (p.vy + dy * 0.012) * 0.86;
			p.x += p.vx;
			p.y += p.vy;
			drawShape(ctx, p);
		}

		ctx.restore();
		rafId = requestAnimationFrame(tick);
	}

	function paintStatic() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.save();
		ctx.scale(pixelRatio, pixelRatio);
		ctx.fillStyle = '#070810';
		ctx.fillRect(0, 0, width, height);
		for (const p of particles) {
			p.x = p.tx;
			p.y = p.ty;
			drawShape(ctx, p);
		}
		ctx.restore();
	}

	function handlePointerMove(event: PointerEvent) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
		pointer.active = true;
	}

	function handlePointerLeave() {
		pointer.active = false;
	}

	function toggleSettle() {
		settled = !settled;
	}

	$effect(() => {
		const next = settled;
		if (!gsapInstance || prefersReduced || next === lastSettled) return;
		const content = wrapperEl?.querySelector('.sth-content');
		const status = wrapperEl?.querySelector('.sth-status');
		if (next) {
			// Settled — calm the content + brighten the status pill.
			if (content) gsapInstance.to(content, { opacity: 0.92, scale: 1, duration: 0.5, ease: 'power2.out' });
			if (status) gsapInstance.to(status, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
		} else {
			// Released — energetic; subtle scale pulse on the content, status fade.
			if (content) gsapInstance.fromTo(
				content,
				{ scale: 0.985 },
				{ scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }
			);
			if (status) gsapInstance.to(status, { opacity: 0.85, y: 0, duration: 0.35, ease: 'power2.inOut' });
		}
		lastSettled = next;
	});

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		resize();
		const observer = new ResizeObserver(() => {
			resize();
			if (prefersReduced) paintStatic();
		});
		if (wrapperEl) observer.observe(wrapperEl);
		if (prefersReduced) {
			paintStatic();
		} else {
			rafId = requestAnimationFrame(tick);
		}

		(async () => {
			gsapInstance = await loadGsap();
			if (prefersReduced || !wrapperEl) return;
			// Entrance: stage the canvas + content fade + status slide-in.
			const canvas = wrapperEl.querySelector('.sth-canvas');
			const content = wrapperEl.querySelector('.sth-content');
			const status = wrapperEl.querySelector('.sth-status');
			const tl = gsapInstance.timeline();
			if (canvas) tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0);
			if (content)
				tl.fromTo(
					content,
					{ y: 14, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
					0.15
				);
			if (status)
				tl.fromTo(
					status,
					{ y: 8, opacity: 0 },
					{ y: 0, opacity: 0.85, duration: 0.5, ease: 'power2.out' },
					0.4
				);
		})();

		return () => {
			observer.disconnect();
			if (rafId) cancelAnimationFrame(rafId);
		};
	});
</script>

<!-- The hero's canvas surface IS the interactive control — a single toggle
     button that flips between "Released" (shapes orbit pointer) and "Settled"
     (shapes pinned to the lattice). role="button" + aria-pressed gives AT
     users the correct control semantics; the aria-live status echoes the
     state for confirmation. -->
<div
	bind:this={wrapperEl}
	class="shape-trail-hero shape-trail-hero--{palette} {className}"
	role="button"
	tabindex="0"
	aria-label={ariaLabel}
	aria-pressed={settled}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onclick={toggleSettle}
	onkeydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleSettle();
		}
	}}
>
	<canvas bind:this={canvasEl} class="sth-canvas" aria-hidden="true"></canvas>
	<div class="sth-content">
		<p class="sth-eyebrow">Shape Trail</p>
		<h2 class="sth-title">Geometry that follows you home.</h2>
		<p class="sth-lede">
			Move your cursor — the shapes orbit. Click — they settle into the lattice. Click again — they
			scatter.
		</p>
	</div>
	<output class="sth-status" aria-live="polite">{settled ? 'Settled' : 'Released'}</output>
</div>

<style>
	.shape-trail-hero {
		position: relative;
		width: 100%;
		min-height: clamp(320px, 50vh, 520px);
		overflow: hidden;
		border-radius: 12px;
		background: #070810;
		isolation: isolate;
		cursor: pointer;
		outline: none;
	}

	.shape-trail-hero:focus-visible {
		outline: 2px solid #60a5fa;
		outline-offset: 2px;
	}

	.sth-canvas {
		position: absolute;
		inset: 0;
		display: block;
		z-index: 0;
	}

	.sth-content {
		position: relative;
		z-index: 1;
		max-width: 36rem;
		padding: clamp(1.5rem, 5vw, 3rem);
		color: #f8fafc;
		pointer-events: none;
	}

	.sth-eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.6875rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 700;
		color: #94a3b8;
	}

	.sth-title {
		margin: 0 0 1rem;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.sth-lede {
		margin: 0;
		font-size: clamp(0.9375rem, 1.5vw, 1.0625rem);
		line-height: 1.55;
		color: #cbd5e1;
		max-width: 32rem;
	}

	.sth-status {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		z-index: 1;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(248, 250, 252, 0.7);
		padding: 0.25rem 0.5rem;
		border: 1px solid rgba(248, 250, 252, 0.18);
		border-radius: 999px;
		pointer-events: none;
		background: rgba(7, 8, 16, 0.55);
	}

	.shape-trail-hero--mono {
		background: #0f172a;
	}
	.shape-trail-hero--amber {
		background: #1c1410;
	}

	@media (prefers-reduced-motion: reduce) {
		.shape-trail-hero {
			cursor: default;
		}
	}
</style>
