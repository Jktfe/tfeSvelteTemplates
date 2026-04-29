<script lang="ts">
	// ========================================================
	// CardwallTile — single billboard-style tile.
	//
	// Pure presentational; the parent wall computes which row
	// it belongs to, what palette to feed it, and whether it
	// is currently pinned. The tile only has to paint itself
	// and report click/keypress activations back upstream.
	// ========================================================

	import type { CardwallTilePalette } from './types';

	interface Props {
		palette: CardwallTilePalette;
		pinned?: boolean;
		onpin?: (palette: CardwallTilePalette) => void;
	}

	let { palette, pinned = false, onpin }: Props = $props();

	function activate() {
		onpin?.(palette);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			activate();
		}
	}
</script>

<div
	class="cw-tile"
	class:cw-pinned={pinned}
	role="button"
	tabindex="0"
	aria-label={`Pin ${palette.label}`}
	aria-pressed={pinned}
	style="
		--cw-from: {palette.from};
		--cw-via: {palette.via};
		--cw-to: {palette.to};
		--cw-accent: {palette.accent};
	"
	onclick={activate}
	onkeydown={onKeyDown}
>
	<span class="cw-tile-label">{palette.label}</span>
	<span class="cw-tile-glow" aria-hidden="true"></span>
</div>

<style>
	.cw-tile {
		position: relative;
		flex: 0 0 auto;
		width: var(--cw-tile-w, 220px);
		height: var(--cw-tile-h, 140px);
		border-radius: 14px;
		background: linear-gradient(
			135deg,
			var(--cw-from) 0%,
			var(--cw-via) 50%,
			var(--cw-to) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.05) inset,
			0 12px 32px -16px rgba(0, 0, 0, 0.55);
		cursor: pointer;
		overflow: hidden;
		isolation: isolate;
		transition:
			transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
			border-color 240ms ease;
		outline: none;
	}

	.cw-tile-label {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Times New Roman', Georgia, ui-serif, serif;
		font-style: italic;
		font-weight: 600;
		font-size: clamp(1.4rem, 2.6vw, 2rem);
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.94);
		text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
		mix-blend-mode: screen;
		user-select: none;
		pointer-events: none;
	}

	.cw-tile-glow {
		position: absolute;
		inset: -40%;
		background: radial-gradient(
			circle at 30% 30%,
			color-mix(in srgb, var(--cw-accent) 55%, transparent) 0%,
			transparent 60%
		);
		opacity: 0;
		transition: opacity 240ms ease;
		pointer-events: none;
		z-index: -1;
	}

	.cw-tile:hover,
	.cw-tile:focus-visible {
		transform: translateZ(0) scale(1.04);
		border-color: color-mix(in srgb, var(--cw-accent) 70%, transparent);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.08) inset,
			0 22px 44px -18px color-mix(in srgb, var(--cw-accent) 40%, rgba(0, 0, 0, 0.7));
	}

	.cw-tile:hover .cw-tile-glow,
	.cw-tile:focus-visible .cw-tile-glow {
		opacity: 1;
	}

	.cw-pinned {
		transform: translateZ(0) scale(1.08);
		border-color: var(--cw-accent);
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--cw-accent) 90%, transparent),
			0 28px 56px -16px color-mix(in srgb, var(--cw-accent) 55%, rgba(0, 0, 0, 0.65));
	}

	.cw-pinned .cw-tile-glow {
		opacity: 0.85;
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-tile {
			transition: none;
		}
		.cw-tile:hover,
		.cw-tile:focus-visible,
		.cw-pinned {
			transform: none;
		}
	}
</style>
