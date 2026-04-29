<script lang="ts">
	// ============================================================
	// Cardwall — full-bleed perspective billboard wall.
	//
	// Each row is a marquee track of CardwallTiles drifting at a
	// row-specific speed and direction. The whole wall sits in a
	// CSS `perspective` container so the upper rows tilt forward
	// and the lower rows tilt back, giving the illusion of depth.
	//
	// rAF drives the row offsets. Pure helpers in `./types.ts`
	// keep the maths testable without a DOM.
	// ============================================================

	import { onMount, onDestroy } from 'svelte';
	import CardwallTile from './CardwallTile.svelte';
	import {
		buildRows,
		isReducedMotion,
		perspectiveTransform,
		rowOffset,
		type CardwallDensity,
		type CardwallTilePalette
	} from './types';

	interface Props {
		density?: CardwallDensity;
		tilesPerRow?: number;
		tileWidth?: number;
		tileGap?: number;
		class?: string;
	}

	let {
		density = 'default',
		tilesPerRow = 8,
		tileWidth = 220,
		tileGap = 16,
		class: className = ''
	}: Props = $props();

	const rows = $derived(buildRows(density, tilesPerRow));
	const totalRows = $derived(rows.length);
	const period = $derived((tileWidth + tileGap) * tilesPerRow);

	let trackEls: (HTMLElement | null)[] = $state([]);
	let pinned = $state<CardwallTilePalette | null>(null);
	let reducedMotion = $state(false);
	let rafId = 0;
	let startTime = 0;

	function tick(now: number) {
		if (!startTime) startTime = now;
		const t = (now - startTime) / 1000;
		for (let r = 0; r < rows.length; r++) {
			const row = rows[r];
			const el = trackEls[r];
			if (!el) continue;
			const offset = rowOffset(t, period, row.speed, row.dir);
			el.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0)`;
		}
		rafId = requestAnimationFrame(tick);
	}

	onMount(() => {
		reducedMotion = isReducedMotion();
		if (!reducedMotion) {
			rafId = requestAnimationFrame(tick);
		}
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
	});

	function onPin(p: CardwallTilePalette) {
		// Toggle: clicking a pinned tile unpins; clicking a different one swaps.
		pinned = pinned && pinned.label === p.label && pinned.from === p.from ? null : p;
	}

	function isPinned(p: CardwallTilePalette): boolean {
		return !!pinned && pinned.label === p.label && pinned.from === p.from;
	}
</script>

<section
	class="cw-wall {className}"
	style="
		--cw-tile-w: {tileWidth}px;
		--cw-tile-h: {Math.round(tileWidth * 0.62)}px;
		--cw-tile-gap: {tileGap}px;
	"
	aria-label="Decorative billboard wall"
>
	<div class="cw-perspective">
		<div class="cw-stack">
			{#each rows as row, r (row.idx)}
				<div
					class="cw-row"
					style="transform: {perspectiveTransform(r, totalRows)};"
				>
					<div
						class="cw-track"
						bind:this={trackEls[r]}
						data-row={r}
						data-dir={row.dir}
					>
						<!-- two copies for seamless wrap -->
						{#each [0, 1] as copy (copy)}
							<div class="cw-track-copy" aria-hidden={copy === 1}>
								{#each row.tiles as tile, i (i)}
									<CardwallTile
										palette={tile}
										pinned={isPinned(tile)}
										onpin={onPin}
									/>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	{#if pinned}
		<div class="cw-pin-readout" aria-live="polite">
			Pinned: <strong>{pinned.label}</strong>
		</div>
	{/if}
</section>

<style>
	.cw-wall {
		position: relative;
		display: block;
		width: 100%;
		min-height: 480px;
		background: radial-gradient(ellipse at top, #1f2236 0%, #07080f 70%);
		overflow: hidden;
		isolation: isolate;
	}

	.cw-perspective {
		position: absolute;
		inset: 0;
		perspective: 1400px;
		perspective-origin: 50% 45%;
	}

	.cw-stack {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 18px;
		transform-style: preserve-3d;
	}

	.cw-row {
		position: relative;
		width: 100%;
		overflow: hidden;
		transform-origin: 50% 50%;
		will-change: transform;
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 8%,
			#000 92%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			#000 8%,
			#000 92%,
			transparent 100%
		);
	}

	.cw-track {
		display: flex;
		gap: var(--cw-tile-gap);
		will-change: transform;
		transform: translate3d(0, 0, 0);
	}

	.cw-track-copy {
		display: flex;
		gap: var(--cw-tile-gap);
		flex: 0 0 auto;
		padding-right: var(--cw-tile-gap);
	}

	.cw-pin-readout {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		padding: 8px 16px;
		background: rgba(15, 17, 28, 0.78);
		color: #f8fafc;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		backdrop-filter: blur(8px);
		pointer-events: none;
		z-index: 10;
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-track {
			transform: translate3d(0, 0, 0) !important;
		}
	}
</style>
