<script lang="ts" module>
	// ============================================================
	// Pendulum — pure helpers + types
	//
	// All physics maths and trigger validation live here so the
	// test suite can assert convergence, clamping, and offset CSS
	// without rendering. The component body is the rAF dispatcher
	// and DOM lifecycle; everything below is deterministic, pure,
	// and DOM-free.
	// ============================================================

	export type Trigger = 'mount' | 'viewport' | 'click' | 'manual';

	export interface PivotOffset {
		x: number;
		y: number;
	}

	export interface SwingState {
		angle: number;
		velocity: number;
	}

	const VALID_TRIGGERS: readonly Trigger[] = ['mount', 'viewport', 'click', 'manual'];

	/**
	 * Damped harmonic motion: angle as a function of elapsed time.
	 *
	 *   theta(t) = A * exp(-decay * t) * cos(2 * pi * frequency * t)
	 *
	 * - `t` in seconds (rAF supplies milliseconds; convert before calling).
	 * - `amplitude` peak swing in degrees.
	 * - `frequency` cycles per second (Hz).
	 * - `decay` exponential damping coefficient (1/s). Higher = faster halt.
	 *
	 * Pure function — no DOM, no state. Returns 0 for non-finite or
	 * negative `t` so the rAF loop can never propagate NaN.
	 */
	export function dampedSine(
		t: number,
		amplitude: number,
		frequency: number,
		decay: number
	): number {
		if (!Number.isFinite(t) || t < 0) return 0;
		if (!Number.isFinite(amplitude) || !Number.isFinite(frequency) || !Number.isFinite(decay)) {
			return 0;
		}
		const envelope = Math.exp(-decay * t);
		const phase = 2 * Math.PI * frequency * t;
		return amplitude * envelope * Math.cos(phase);
	}

	/**
	 * One Euler-integration step for users who want to drive the
	 * pendulum from their own physics loop instead of the analytical
	 * solution. Small-angle approximation: theta-double-dot equals
	 * negative gravity-over-length times sin(theta) minus damping
	 * times theta-dot, with sin(theta) approximated as theta.
	 *
	 * `gravity` is g over L (effective angular spring), `damping`
	 * is linear damping (1/s). Returns the next state — does not
	 * mutate the input.
	 */
	export function nextAngle(
		state: SwingState,
		deltaT: number,
		gravity: number,
		damping: number
	): SwingState {
		if (!Number.isFinite(deltaT) || deltaT <= 0) return state;
		const angleRad = (state.angle * Math.PI) / 180;
		const accel = -gravity * angleRad - damping * state.velocity;
		const nextVelocity = state.velocity + accel * deltaT;
		const nextAngleDeg = state.angle + ((nextVelocity * deltaT) * 180) / Math.PI;
		return { angle: nextAngleDeg, velocity: nextVelocity };
	}

	/**
	 * Defensive clamp on the visible swing angle. Caps to +/- max,
	 * returns 0 for non-finite input or non-positive max so the
	 * inline transform never receives `NaNdeg` or runaway rotation.
	 */
	export function clampSwing(angle: number, max: number): number {
		if (!Number.isFinite(angle) || !Number.isFinite(max) || max <= 0) return 0;
		if (angle > max) return max;
		if (angle < -max) return -max;
		return angle;
	}

	/**
	 * Validate a trigger name — returns the typed value if known,
	 * defaults to 'mount' for unknown input so consumers passing
	 * user data never crash the component.
	 */
	export function pickTrigger(name: string): Trigger {
		if (VALID_TRIGGERS.includes(name as Trigger)) return name as Trigger;
		return 'mount';
	}

	/**
	 * Convert a pivot offset (px) to a CSS transform-origin value.
	 * x positive moves the pivot right; y negative moves it up
	 * (matching the convention "pendulum hangs from above the bbox
	 * centre by 40px" -> { x: 0, y: -40 }).
	 *
	 * Origin axis is "centre + offset": "calc(50% + Xpx) calc(50% + Ypx)".
	 * Non-finite values fall back to "50% 50%".
	 */
	export function pivotOffsetCSS(offset: PivotOffset): string {
		if (!offset || !Number.isFinite(offset.x) || !Number.isFinite(offset.y)) {
			return '50% 50%';
		}
		const xPart = offset.x === 0 ? '50%' : `calc(50% + ${offset.x}px)`;
		const yPart = offset.y === 0 ? '50%' : `calc(50% + ${offset.y}px)`;
		return `${xPart} ${yPart}`;
	}

	/**
	 * SSR-safe wrapper around matchMedia('(prefers-reduced-motion: reduce)').
	 * Returns false on the server; on the client honours the user's pref.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';

	type Props = {
		trigger?: Trigger;
		amplitude?: number;
		frequency?: number;
		decay?: number;
		pivotOffset?: PivotOffset;
		duration?: number;
		autoStartDelay?: number;
		threshold?: number;
		class?: string;
		children?: Snippet;
	};

	const {
		trigger = 'mount',
		amplitude = 18,
		frequency = 1.2,
		decay = 1.4,
		pivotOffset = { x: 0, y: -20 },
		duration = 4000,
		autoStartDelay = 0,
		threshold = 0.4,
		class: extraClass = '',
		children
	}: Props = $props();

	const safeTrigger = $derived(pickTrigger(trigger));
	const originCSS = $derived(pivotOffsetCSS(pivotOffset));

	let angle = $state(0);
	let reduced = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);
	let rafId: number | null = null;
	let observer: IntersectionObserver | null = null;
	let startTs: number | null = null;
	let startDelayTimer: ReturnType<typeof setTimeout> | null = null;

	function tick(now: number) {
		if (startTs === null) startTs = now;
		const elapsedMs = now - startTs;
		const elapsedS = elapsedMs / 1000;
		const raw = dampedSine(elapsedS, amplitude, frequency, decay);
		angle = clampSwing(raw, amplitude);

		const envelope = Math.exp(-decay * elapsedS) * amplitude;
		const halted = envelope < 0.05 || elapsedMs >= duration;
		if (halted) {
			angle = 0;
			rafId = null;
			startTs = null;
			return;
		}
		rafId = requestAnimationFrame(tick);
	}

	export function swing() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		startTs = null;
		if (typeof window === 'undefined') return;
		if (reduced) {
			angle = 0;
			return;
		}
		rafId = requestAnimationFrame(tick);
	}

	export function stop() {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		startTs = null;
		angle = 0;
	}

	function handleClick() {
		if (safeTrigger === 'click') swing();
	}

	function startWithDelay() {
		if (autoStartDelay > 0) {
			startDelayTimer = setTimeout(() => {
				swing();
				startDelayTimer = null;
			}, autoStartDelay);
		} else {
			swing();
		}
	}

	onMount(() => {
		reduced = isReducedMotion();
		if (reduced) return;

		if (safeTrigger === 'mount') {
			startWithDelay();
			return;
		}

		if (safeTrigger === 'viewport' && containerEl && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							startWithDelay();
							observer?.disconnect();
							observer = null;
							break;
						}
					}
				},
				{ threshold }
			);
			observer.observe(containerEl);
		}
	});

	onDestroy(() => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		if (startDelayTimer !== null) clearTimeout(startDelayTimer);
		observer?.disconnect();
	});
</script>

<div
	bind:this={containerEl}
	role="presentation"
	class="pendulum {extraClass}"
	class:pendulum--clickable={safeTrigger === 'click'}
	style:transform-origin={originCSS}
	data-trigger={safeTrigger}
>
	{#if safeTrigger === 'click'}
		<div
			class="pendulum__inner"
			style="--pendulum-angle: {angle}deg;"
			onclick={handleClick}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					swing();
				}
			}}
			role="button"
			tabindex="0"
			aria-label="Swing pendulum"
		>
			{@render children?.()}
		</div>
	{:else}
		<div
			class="pendulum__inner"
			style="--pendulum-angle: {angle}deg;"
			role="presentation"
		>
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	.pendulum {
		display: inline-block;
		position: relative;
	}

	.pendulum__inner {
		display: inline-block;
		transform: rotateZ(var(--pendulum-angle, 0deg));
		transform-origin: inherit;
		will-change: transform;
		outline: none;
	}

	.pendulum--clickable .pendulum__inner {
		cursor: pointer;
	}

	.pendulum--clickable .pendulum__inner:focus-visible {
		outline: 2px solid #6366f1;
		outline-offset: 4px;
		border-radius: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.pendulum__inner {
			transform: none !important;
			transition: none !important;
		}
	}
</style>
