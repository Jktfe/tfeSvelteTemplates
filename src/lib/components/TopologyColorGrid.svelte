<script lang="ts" module>
	export interface TopologySwatch {
		id: string;
		name: string;
		hex: string;
		label: string;
	}

	export interface TopologyCardLayout {
		x: number;
		y: number;
		width: number;
		height: number;
		depth: number;
		rotation: number;
	}

	export type TopologyTheme = 'light' | 'dark';

	export const defaultTopologySwatches: TopologySwatch[] = [
		{ id: 'graphite', name: 'Graphite Node', hex: '#1f2937', label: 'ID-07' },
		{ id: 'bone', name: 'Bone Matrix', hex: '#f5f5f4', label: 'ID-05' },
		{ id: 'pine', name: 'Pine Signal', hex: '#065f46', label: 'ID-02' },
		{ id: 'cinder', name: 'Cinder Tile', hex: '#c2410c', label: 'Apex Node - 01' },
		{ id: 'gold', name: 'Gold Vector', hex: '#fbbf24', label: 'ID-04' },
		{ id: 'rose', name: 'Rose Trace', hex: '#fecdd3', label: 'ID-03' },
		{ id: 'oxide', name: 'Oxide Field', hex: '#7f1d1d', label: 'ID-06' }
	];

	const cardLayouts: TopologyCardLayout[] = [
		{ x: 20, y: 72, width: 27, height: 23, depth: 18, rotation: -1 },
		{ x: 36, y: 48, width: 24, height: 19, depth: 54, rotation: 1 },
		{ x: 26, y: 34, width: 21, height: 20, depth: 34, rotation: -2 },
		{ x: 50, y: 60, width: 33, height: 27, depth: 84, rotation: 0 },
		{ x: 66, y: 35, width: 32, height: 20, depth: 112, rotation: 1 },
		{ x: 74, y: 64, width: 23, height: 22, depth: 42, rotation: -1 },
		{ x: 87, y: 72, width: 23, height: 24, depth: 66, rotation: 2 }
	];

	export function normalizeHex(hex: string): string {
		const value = hex.trim();
		const match = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
		if (!match) return '#000000';
		const raw = match[1];
		if (raw.length === 3) {
			return `#${raw
				.split('')
				.map((char) => `${char}${char}`)
				.join('')}`.toUpperCase();
		}
		return `#${raw}`.toUpperCase();
	}

	export function hexToRgbTriplet(hex: string): [number, number, number] {
		const value = normalizeHex(hex).slice(1);
		return [
			Number.parseInt(value.slice(0, 2), 16),
			Number.parseInt(value.slice(2, 4), 16),
			Number.parseInt(value.slice(4, 6), 16)
		];
	}

	export function formatRgbTriplet(hex: string): string {
		return hexToRgbTriplet(hex)
			.map((channel) => channel.toString().padStart(3, '0'))
			.join(' . ');
	}

	export function readableTextColor(hex: string): '#111827' | '#ffffff' {
		const [r, g, b] = hexToRgbTriplet(hex);
		const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
		return luminance > 0.58 ? '#111827' : '#ffffff';
	}

	export function topologyCardLayout(index: number, extruded = true): TopologyCardLayout {
		const layout = cardLayouts[((index % cardLayouts.length) + cardLayouts.length) % cardLayouts.length];
		return {
			...layout,
			depth: extruded ? layout.depth : Math.round(layout.depth * 0.32)
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion } from '$lib/gsapMotion';
	import type {
		BufferAttribute,
		Mesh,
		PerspectiveCamera,
		PlaneGeometry,
		Scene,
		WebGLRenderer
	} from 'three';

	interface Props {
		swatches?: TopologySwatch[];
		title?: string;
		subtitle?: string;
		extruded?: boolean;
		interactive?: boolean;
		theme?: TopologyTheme;
		showThemeToggle?: boolean;
		class?: string;
	}

	let {
		swatches = defaultTopologySwatches,
		title = 'Chromatic Substrate Topology',
		subtitle = 'Spatial Z-Index Mapping',
		extruded = true,
		interactive = true,
		theme = 'light',
		showThemeToggle = true,
		class: className = ''
	}: Props = $props();

	let root: HTMLElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	// svelte-ignore state_referenced_locally
	let activeId = $state(swatches[3]?.id ?? swatches[0]?.id ?? '');
	// svelte-ignore state_referenced_locally
	let isExtruded = $state(extruded);
	// svelte-ignore state_referenced_locally
	let activeTheme = $state<TopologyTheme>(theme);
	let hasWireframe = $state(true);

	function selectCard(id: string) {
		if (!interactive) return;
		activeId = id;
	}

	function toggleExtrusion() {
		isExtruded = !isExtruded;
	}

	function toggleTheme() {
		activeTheme = activeTheme === 'light' ? 'dark' : 'light';
	}

	function supportsWebGL2() {
		if (typeof document === 'undefined') return false;
		const probe = document.createElement('canvas');
		const context = probe.getContext('webgl2', {
			alpha: true,
			antialias: true,
			preserveDrawingBuffer: true
		});
		return !!context;
	}

	async function setupWireframe(cancelled: () => boolean) {
		if (!canvas || typeof window === 'undefined') return null;

		if (!supportsWebGL2()) {
			hasWireframe = false;
			return null;
		}

		const context = canvas.getContext('webgl2', {
			alpha: true,
			antialias: true,
			preserveDrawingBuffer: true
		});
		if (!context) {
			hasWireframe = false;
			return null;
		}

		const THREE = await import('three');
		if (cancelled() || !canvas) return null;

		const scene: Scene = new THREE.Scene();
		const camera: PerspectiveCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
		const renderer: WebGLRenderer = new THREE.WebGLRenderer({
			canvas,
			context,
			alpha: true,
			antialias: true,
			preserveDrawingBuffer: true
		});
		const geometry: PlaneGeometry = new THREE.PlaneGeometry(18, 10, 44, 24);
		const material = new THREE.MeshBasicMaterial({
			color: 0x94a3b8,
			wireframe: true,
			transparent: true,
			opacity: 0.2
		});
		const mesh: Mesh = new THREE.Mesh(geometry, material);
		const position = geometry.getAttribute('position') as BufferAttribute;
		let frame = 0;
		let width = 1;
		let height = 1;

		camera.position.set(0, 0, 11);
		mesh.rotation.x = -0.74;
		mesh.rotation.z = -0.22;
		mesh.position.y = -0.8;
		scene.add(mesh);

		function resize() {
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			width = Math.max(1, rect.width);
			height = Math.max(1, rect.height);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			renderer.setPixelRatio(dpr);
			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}

		function render(time = 0) {
			for (let index = 0; index < position.count; index += 1) {
				const x = position.getX(index);
				const y = position.getY(index);
				const wave = Math.sin(time * 0.00055 + x * 0.82 + y * 0.54) * 0.18;
				position.setZ(index, wave);
			}
			position.needsUpdate = true;
			mesh.rotation.z = -0.22 + Math.sin(time * 0.00018) * 0.035;
			renderer.render(scene, camera);
		}

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);
		hasWireframe = true;
		resize();
		render();

		const reduceMotion = prefersReducedMotion();
		function tick(time: number) {
			render(time);
			if (!reduceMotion) frame = requestAnimationFrame(tick);
		}
		if (!reduceMotion) frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		};
	}

	onMount(() => {
		let cancelled = false;
		let cleanupWireframe: (() => void) | null = null;
		let cleanupReveal: (() => void) | null = null;

		void (async () => {
			cleanupWireframe = await setupWireframe(() => cancelled);
			if (cancelled || !root) return;

			const gsap = await loadGsap();
			if (cancelled || !root) return;

			const targets = root.querySelectorAll<HTMLElement>('[data-topology-reveal]');
			if (prefersReducedMotion()) {
				gsap.set(targets, { autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
				return;
			}

			const context = gsap.context(() => {
				gsap.from(targets, {
					autoAlpha: 0,
					y: 28,
					rotationX: -12,
					duration: 0.76,
					ease: 'power3.out',
					stagger: 0.055,
					clearProps: 'transform,opacity,visibility'
				});
			}, root);
			cleanupReveal = () => context.revert();
		})();

		return () => {
			cancelled = true;
			cleanupReveal?.();
			cleanupWireframe?.();
		};
	});
</script>

<section
	bind:this={root}
	class={`topology-color-grid ${className}`}
	class:is-flat={!isExtruded}
	class:is-dark={activeTheme === 'dark'}
	class:is-light={activeTheme === 'light'}
	aria-labelledby="topology-color-grid-title"
>
	<canvas
		bind:this={canvas}
		class="wireframe-canvas"
		class:is-disabled={!hasWireframe}
		aria-hidden="true"
	></canvas>

	<header class="topology-header" data-topology-reveal>
		<div class="mark" aria-hidden="true">
			<span></span>
			<span></span>
			<span></span>
		</div>
		<div class="title-block">
			<h1 id="topology-color-grid-title">{title}</h1>
			<p>{subtitle}</p>
		</div>
		<div class="topology-controls">
			{#if showThemeToggle}
				<button
					type="button"
					class="theme-toggle"
					aria-pressed={activeTheme === 'dark'}
					onclick={toggleTheme}
				>
					<span>{activeTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
				</button>
			{/if}
			<button
				type="button"
				class="extrude-toggle"
				aria-pressed={isExtruded}
				onclick={toggleExtrusion}
			>
				<span>{isExtruded ? 'Flatten Plane' : 'Activate Extrusion'}</span>
			</button>
		</div>
	</header>

	<div class="topology-stage" aria-label="Interactive color topology">
		<div class="topology-plane">
			{#each swatches as swatch, index (swatch.id)}
				{@const layout = topologyCardLayout(index, isExtruded)}
				{@const textColor = readableTextColor(swatch.hex)}
				<button
					type="button"
					class="topology-card"
					class:is-active={activeId === swatch.id}
					style={`
						--tone: ${normalizeHex(swatch.hex)};
						--text: ${textColor};
						--x: ${layout.x};
						--y: ${layout.y};
						--w: ${layout.width};
						--h: ${layout.height};
						--z: ${layout.depth};
						--r: ${layout.rotation}deg;
					`}
					aria-pressed={activeId === swatch.id}
					onmouseenter={() => selectCard(swatch.id)}
					onfocus={() => selectCard(swatch.id)}
					data-topology-reveal
				>
					<span class="card-meta">
						<span>{swatch.label}</span>
						<span aria-hidden="true">⌁</span>
					</span>
					<span class="card-copy">
						<strong>
							{#each swatch.name.split(' ') as word (word)}
								<span>{word}</span>
							{/each}
						</strong>
						<span class="values">
							<span>{normalizeHex(swatch.hex)}</span>
							<span>{formatRgbTriplet(swatch.hex)}</span>
						</span>
					</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.topology-color-grid {
		--topology-bg-base: #f8fafc;
		--topology-bg-top: rgba(255, 255, 255, 0.96);
		--topology-bg-bottom: rgba(241, 245, 249, 0.96);
		--topology-fg: #111827;
		--topology-title: #111827;
		--topology-muted: #64748b;
		--topology-border: rgba(15, 23, 42, 0.14);
		--topology-border-strong: rgba(15, 23, 42, 0.24);
		--topology-control-bg: rgba(255, 255, 255, 0.84);
		--topology-control-bg-hover: rgba(248, 250, 252, 0.98);
		--topology-shadow: rgba(15, 23, 42, 0.12);
		--topology-card-border: rgba(15, 23, 42, 0.16);
		--topology-card-highlight: rgba(255, 255, 255, 0.38);
		--topology-card-shadow: rgba(15, 23, 42, 0.24);
		--topology-card-shadow-active: rgba(15, 23, 42, 0.34);
		position: relative;
		isolation: isolate;
		min-height: min(840px, calc(100vh - 64px));
		overflow: hidden;
		background:
			linear-gradient(180deg, var(--topology-bg-top), var(--topology-bg-bottom)),
			linear-gradient(120deg, rgba(194, 65, 12, 0.14), transparent 32%),
			linear-gradient(300deg, rgba(251, 191, 36, 0.18), transparent 34%),
			var(--topology-bg-base);
		color: var(--topology-fg);
	}

	.topology-color-grid.is-dark {
		--topology-bg-base: #02060c;
		--topology-bg-top: rgba(5, 7, 10, 0.98);
		--topology-bg-bottom: rgba(2, 6, 12, 0.98);
		--topology-fg: #f8fafc;
		--topology-title: #f8fafc;
		--topology-muted: #a1a1aa;
		--topology-border: rgba(255, 255, 255, 0.14);
		--topology-border-strong: rgba(255, 255, 255, 0.24);
		--topology-control-bg: rgba(15, 23, 42, 0.62);
		--topology-control-bg-hover: rgba(30, 41, 59, 0.78);
		--topology-shadow: rgba(194, 65, 12, 0.34);
		--topology-card-border: rgba(255, 255, 255, 0.18);
		--topology-card-highlight: rgba(255, 255, 255, 0.1);
		--topology-card-shadow: rgba(0, 0, 0, 0.32);
		--topology-card-shadow-active: rgba(0, 0, 0, 0.42);
	}

	.wireframe-canvas {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		display: block;
		opacity: 0.9;
	}

	.wireframe-canvas.is-disabled {
		display: none;
	}

	.topology-color-grid::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(15, 23, 42, 0.08)),
			radial-gradient(circle at 68% 30%, rgba(251, 191, 36, 0.14), transparent 24%),
			radial-gradient(circle at 24% 72%, rgba(194, 65, 12, 0.16), transparent 34%);
		pointer-events: none;
	}

	.topology-color-grid.is-dark::before {
		background:
			linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.62)),
			radial-gradient(circle at 68% 30%, rgba(251, 191, 36, 0.14), transparent 24%),
			radial-gradient(circle at 24% 72%, rgba(194, 65, 12, 0.16), transparent 34%);
	}

	.topology-header {
		position: relative;
		z-index: 3;
		display: flex;
		align-items: center;
		gap: 1rem;
		width: min(1180px, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(1.5rem, 4vw, 3rem) 0 0;
	}

	.mark {
		position: relative;
		display: grid;
		width: 3rem;
		height: 3rem;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid var(--topology-border);
		border-radius: 8px;
		background: #c2410c;
		box-shadow: 0 16px 34px var(--topology-shadow);
	}

	.mark span {
		position: absolute;
		width: 1.25rem;
		height: 0.48rem;
		border: 1px solid rgba(255, 255, 255, 0.86);
		border-radius: 50%;
		transform: rotate(-18deg);
	}

	.mark span:nth-child(2) {
		transform: translateY(0.35rem) rotate(-18deg);
	}

	.mark span:nth-child(3) {
		transform: translateY(-0.35rem) rotate(-18deg);
	}

	.title-block {
		min-width: 0;
		display: grid;
		gap: 0.25rem;
	}

	.title-block h1 {
		margin: 0;
		color: var(--topology-title);
		font-size: clamp(1.15rem, 2vw, 1.45rem);
		font-weight: 650;
		line-height: 1.1;
		letter-spacing: 0;
		overflow-wrap: anywhere;
	}

	.title-block p {
		margin: 0;
		color: var(--topology-muted);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.topology-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-left: auto;
	}

	.extrude-toggle,
	.theme-toggle {
		min-height: 2.65rem;
		padding: 0.72rem 1rem;
		border: 1px solid var(--topology-border);
		border-radius: 8px;
		background: var(--topology-control-bg);
		color: var(--topology-fg);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 800;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease,
			transform 0.2s ease;
	}

	.extrude-toggle:hover,
	.extrude-toggle:focus-visible,
	.theme-toggle:hover,
	.theme-toggle:focus-visible {
		border-color: rgba(251, 191, 36, 0.78);
		background: var(--topology-control-bg-hover);
		outline: none;
		transform: translateY(-1px);
	}

	.topology-stage {
		position: relative;
		z-index: 2;
		width: min(1180px, calc(100% - 2rem));
		min-height: clamp(520px, 70vh, 760px);
		margin: 0 auto;
		perspective: 1400px;
	}

	.topology-plane {
		position: absolute;
		inset: 4% 1% 0;
		transform: rotateX(58deg) rotateZ(-24deg) translateY(3%);
		transform-style: preserve-3d;
	}

	.topology-card {
		position: absolute;
		left: calc(var(--x) * 1%);
		top: calc(var(--y) * 1%);
		width: calc(var(--w) * 1%);
		min-height: calc(var(--h) * 1%);
		display: grid;
		align-content: space-between;
		gap: 1.2rem;
		padding: clamp(0.75rem, 1.5vw, 1.2rem);
		border: 1px solid var(--topology-card-border);
		border-radius: 8px;
		background:
			linear-gradient(145deg, var(--topology-card-highlight), rgba(255, 255, 255, 0.03)),
			var(--tone);
		box-shadow:
			0 28px 42px var(--topology-card-shadow),
			0 1px 0 rgba(255, 255, 255, 0.18) inset;
		color: var(--text);
		text-align: left;
		cursor: pointer;
		transform: translate(-50%, -50%) translateZ(calc(var(--z) * 1px)) rotateZ(var(--r));
		transform-style: preserve-3d;
		transition:
			transform 0.38s cubic-bezier(0.2, 0.8, 0.2, 1),
			filter 0.24s ease,
			box-shadow 0.24s ease;
	}

	.topology-card::after {
		content: '';
		position: absolute;
		inset: auto 0 -0.8rem 0;
		height: 0.8rem;
		border-radius: 0 0 8px 8px;
		background: color-mix(in srgb, var(--tone), black 42%);
		transform: rotateX(-78deg);
		transform-origin: top;
		opacity: 0.72;
	}

	.topology-card:hover,
	.topology-card:focus-visible,
	.topology-card.is-active {
		filter: saturate(1.14) brightness(1.04);
		outline: none;
		transform: translate(-50%, -50%) translateZ(calc((var(--z) + 82) * 1px)) rotateZ(var(--r))
			scale(1.03);
		box-shadow:
			0 34px 60px var(--topology-card-shadow-active),
			0 0 0 1px rgba(255, 255, 255, 0.24) inset,
			0 0 42px color-mix(in srgb, var(--tone), transparent 44%);
	}

	.topology-color-grid.is-flat .topology-card {
		transform: translate(-50%, -50%) translateZ(calc(var(--z) * 1px)) rotateZ(var(--r));
	}

	.card-meta,
	.values {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		color: color-mix(in srgb, var(--text), transparent 24%);
		font-size: clamp(0.62rem, 1vw, 0.76rem);
		font-weight: 800;
		text-transform: uppercase;
	}

	.card-copy {
		display: grid;
		gap: 0.9rem;
	}

	.card-copy strong {
		display: grid;
		gap: 0.08rem;
		font-size: clamp(1rem, 2.2vw, 2.15rem);
		font-weight: 900;
		line-height: 0.92;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.values {
		align-items: flex-end;
		font-size: clamp(0.58rem, 0.85vw, 0.72rem);
		line-height: 1.2;
	}

	.values span:last-child {
		text-align: right;
	}

	@media (prefers-reduced-motion: reduce) {
		.topology-card,
		.extrude-toggle,
		.theme-toggle {
			transition: none;
		}

		.topology-card:hover,
		.topology-card:focus-visible,
		.topology-card.is-active {
			transform: translate(-50%, -50%) translateZ(calc(var(--z) * 1px)) rotateZ(var(--r));
		}

		.extrude-toggle:hover,
		.extrude-toggle:focus-visible,
		.theme-toggle:hover,
		.theme-toggle:focus-visible {
			transform: none;
		}
	}

	@media (max-width: 860px) {
		.topology-color-grid {
			min-height: auto;
		}

		.topology-header {
			align-items: flex-start;
			flex-wrap: wrap;
		}

		.extrude-toggle {
			margin-left: 0;
		}

		.topology-controls {
			width: 100%;
			margin-left: 0;
		}

		.topology-stage {
			min-height: auto;
			padding: 2rem 0;
			perspective: none;
		}

		.topology-plane {
			position: relative;
			inset: auto;
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.75rem;
			transform: none;
		}

		.topology-card,
		.topology-card:hover,
		.topology-card:focus-visible,
		.topology-card.is-active,
		.topology-color-grid.is-flat .topology-card {
			position: relative;
			left: auto;
			top: auto;
			width: auto;
			min-height: 11rem;
			transform: none;
		}

		.topology-card::after {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.topology-header,
		.topology-stage {
			width: min(100% - 1rem, 1180px);
		}

		.mark {
			width: 2.55rem;
			height: 2.55rem;
		}

		.title-block p {
			font-size: 0.68rem;
		}

		.topology-plane {
			grid-template-columns: 1fr;
		}
	}
</style>
