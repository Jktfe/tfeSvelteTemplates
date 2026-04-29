<!--
  ============================================================
  Tilt3D
  ============================================================

  WHAT IT DOES
  Wrap any element. On hover the wrapped content tilts in 3D toward
  the cursor — Stripe / Linear / Apple product-page card depth.
  Element rotates along X / Y axes based on cursor position relative
  to its own centre, with an optional glare-sweep highlight that
  follows the pointer to sell the depth. On pointer-leave it
  spring-eases back to flat (or snaps, or stays — your pick).

  FEATURES
    • Pure CSS perspective + transform — minimal JS for cursor math
    • Optional glare highlight via radial-gradient that tracks the cursor
    • Three reset modes: spring (rAF ease), instant (snap), none (stay)
    • prefers-reduced-motion: reduce → tilt disabled, glare hidden,
      transform locked to identity at the stylesheet level
    • SSR-safe: window/matchMedia accessed only after onMount
    • Children remain in DOM and accessibility tree at all times;
      keyboard focus and focus-visible work normally

  DEPENDENCIES
  Zero. No animation library, no SVG filter, no canvas, no fonts.

  PERFORMANCE
    • Steady state when no cursor present: zero work.
    • Per pointermove: one getBoundingClientRect + four arithmetic
      ops + four CSS custom property writes. The transform itself
      is GPU-composited (rotateX / rotateY / scale).
    • Leave-spring: one rAF loop until rotation magnitude < 0.05deg,
      then it stops. No idle rAF.

  USAGE
  Example:
      import Tilt3D from '$lib/components/Tilt3D.svelte';

      <Tilt3D maxTilt={12} glare={true}>
        <article class="card">...</article>
      </Tilt3D>

  ============================================================
-->

<script lang="ts" module>
	export type Reset = 'spring' | 'instant' | 'none';

	export interface Rect {
		left: number;
		top: number;
		width: number;
		height: number;
	}

	export interface Rotation {
		rx: number;
		ry: number;
	}

	export interface GlarePos {
		x: number;
		y: number;
	}

	/**
	 * Clamp a tilt angle into [-max, max]. Non-finite input falls back
	 * to 0 so a stray NaN from a bad cursor event never freezes the
	 * inner element at some random angle.
	 */
	export function clampTilt(angle: number, max: number): number {
		if (!Number.isFinite(angle)) return 0;
		if (!Number.isFinite(max) || max <= 0) return 0;
		if (angle > max) return max;
		if (angle < -max) return -max;
		return angle;
	}

	/**
	 * Compute the X / Y rotation for an element given the cursor's
	 * client coordinates and the element's bounding rect.
	 *
	 * Convention: cursor in the top half of the rect tilts the top
	 * edge toward the viewer (positive rotateX). Cursor in the right
	 * half tilts the right edge away (positive rotateY).
	 *
	 * Rect dimensions of zero or non-finite values return {rx:0, ry:0}
	 * so the helper is safe before layout has settled.
	 */
	export function rotationFromCursor(
		cursorX: number,
		cursorY: number,
		rect: Rect,
		maxTilt: number
	): Rotation {
		if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) {
			return { rx: 0, ry: 0 };
		}
		if (rect.width <= 0 || rect.height <= 0) return { rx: 0, ry: 0 };

		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		// Normalise to [-1, 1] across each axis based on element half-size.
		const nx = (cursorX - cx) / (rect.width / 2);
		const ny = (cursorY - cy) / (rect.height / 2);

		// Top half of element (ny < 0) → rx positive (top edge forward).
		const rx = clampTilt(-ny * maxTilt, maxTilt);
		const ry = clampTilt(nx * maxTilt, maxTilt);

		return { rx, ry };
	}

	/**
	 * Compute the glare position as a 0..1 fraction inside the rect.
	 * Used to drive the radial-gradient highlight overlay.
	 *
	 * Outside the rect the value is clamped — when the cursor leaves
	 * we want the glare frozen at the edge it left through, not
	 * teleporting back to centre.
	 */
	export function glarePositionFromCursor(
		cursorX: number,
		cursorY: number,
		rect: Rect
	): GlarePos {
		if (!rect || rect.width <= 0 || rect.height <= 0) {
			return { x: 0.5, y: 0.5 };
		}
		const x = (cursorX - rect.left) / rect.width;
		const y = (cursorY - rect.top) / rect.height;
		return {
			x: Math.max(0, Math.min(1, x)),
			y: Math.max(0, Math.min(1, y))
		};
	}

	/**
	 * One step of a damped spring toward `target`. The component drives
	 * this in a rAF loop on pointer-leave to ease the rotation back to
	 * zero — `damping` of 0.15 gives a soft ~12-frame settle that feels
	 * weighty without dragging.
	 *
	 * damping is clamped to [0, 1]:
	 *   0 → no movement (returns current)
	 *   1 → snap to target
	 */
	export function springReset(current: number, target: number, damping = 0.15): number {
		if (!Number.isFinite(current)) return 0;
		if (!Number.isFinite(target)) target = 0;
		const d = Math.max(0, Math.min(1, Number.isFinite(damping) ? damping : 0.15));
		return current + (target - current) * d;
	}

	/**
	 * SSR-safe wrapper around prefers-reduced-motion. Returns false on
	 * the server so server-rendered HTML matches the un-reduced default;
	 * the real value is read in onMount.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Props = {
		/** Max rotation in degrees on either axis. Default 12. */
		maxTilt?: number;
		/** CSS perspective in pixels. Smaller = more dramatic. Default 1000. */
		perspective?: number;
		/** Show the radial-gradient glare overlay. Default true. */
		glare?: boolean;
		/** Glare opacity at peak, 0..1. Default 0.3. */
		glareIntensity?: number;
		/** What to do on pointer-leave. Default 'spring'. */
		reset?: Reset;
		/** Subtle scale-up on hover for added depth. Default 1.04. */
		scale?: number;
		/** Extra class names appended to the wrapper. */
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		maxTilt = 12,
		perspective = 1000,
		glare = true,
		glareIntensity = 0.3,
		reset = 'spring',
		scale = 1.04,
		class: className = '',
		children
	}: Props = $props();

	let containerEl: HTMLDivElement;
	let rx = $state(0);
	let ry = $state(0);
	let glareX = $state(0.5);
	let glareY = $state(0.5);
	let active = $state(false);
	let reduced = $state(false);
	let frameId = 0;

	onMount(() => {
		reduced = isReducedMotion();
	});

	onDestroy(() => {
		if (frameId) cancelAnimationFrame(frameId);
	});

	function onPointerMove(e: PointerEvent) {
		if (reduced || !containerEl) return;
		if (frameId) {
			cancelAnimationFrame(frameId);
			frameId = 0;
		}
		const rect = containerEl.getBoundingClientRect();
		const r = rotationFromCursor(e.clientX, e.clientY, rect, maxTilt);
		const g = glarePositionFromCursor(e.clientX, e.clientY, rect);
		rx = r.rx;
		ry = r.ry;
		glareX = g.x;
		glareY = g.y;
		active = true;
	}

	function onPointerLeave() {
		if (reduced) return;

		if (reset === 'instant') {
			rx = 0;
			ry = 0;
			active = false;
			return;
		}
		if (reset === 'none') {
			active = false;
			return;
		}

		// reset === 'spring': rAF ease back to identity.
		const tick = () => {
			rx = springReset(rx, 0, 0.15);
			ry = springReset(ry, 0, 0.15);
			if (Math.abs(rx) < 0.05 && Math.abs(ry) < 0.05) {
				rx = 0;
				ry = 0;
				active = false;
				frameId = 0;
				return;
			}
			frameId = requestAnimationFrame(tick);
		};
		if (frameId) cancelAnimationFrame(frameId);
		frameId = requestAnimationFrame(tick);
	}
</script>

<div
	bind:this={containerEl}
	class="tilt3d {className}"
	class:tilt3d--active={active}
	class:tilt3d--reduced={reduced}
	style:--tilt-perspective="{perspective}px"
	style:--tilt-rx="{rx}deg"
	style:--tilt-ry="{ry}deg"
	style:--tilt-scale={active ? scale : 1}
	style:--glare-x="{glareX * 100}%"
	style:--glare-y="{glareY * 100}%"
	style:--glare-intensity={glareIntensity}
	onpointermove={onPointerMove}
	onpointerleave={onPointerLeave}
	role="presentation"
>
	<div class="tilt3d__inner">
		{@render children?.()}
		{#if glare}
			<div class="tilt3d__glare" aria-hidden="true"></div>
		{/if}
	</div>
</div>

<style>
	.tilt3d {
		display: inline-block;
		perspective: var(--tilt-perspective, 1000px);
		transform-style: preserve-3d;
	}

	.tilt3d__inner {
		position: relative;
		transform: rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg))
			scale(var(--tilt-scale, 1));
		transform-style: preserve-3d;
		will-change: transform;
		/* No transition while active — we drive rotation directly per pointermove
		   for snap-tight cursor tracking. The leave-spring is handled by JS rAF
		   so we never fight the transition timeline. */
	}

	.tilt3d__glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			circle at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, var(--glare-intensity, 0.3)) 0%,
			rgba(255, 255, 255, 0) 50%
		);
		mix-blend-mode: overlay;
		border-radius: inherit;
		opacity: 0;
		transition: opacity 220ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}

	.tilt3d--active .tilt3d__glare {
		opacity: 1;
	}

	/*
	  Reduced-motion safety net at the stylesheet level. Even if the
	  matchMedia probe hadn't run yet, the user's preference still wins:
	  the inner is locked flat and the glare is suppressed entirely.
	*/
	@media (prefers-reduced-motion: reduce) {
		.tilt3d :global(.tilt3d__inner),
		.tilt3d__inner {
			transform: none !important;
		}
		.tilt3d__glare {
			display: none !important;
		}
	}
</style>
