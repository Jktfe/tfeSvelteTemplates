<!--
  ============================================================
  ClickSpark — Wrap-anything click-burst particle layer
  ============================================================

  WHAT IT DOES
  Wraps any element (button, link, image, card) and fires a
  configurable burst of particles outward from the click point
  every time the user clicks inside the wrapper. The wrapped
  child keeps its normal click semantics — ClickSpark is purely
  a decorative overlay.

  FEATURES
  - Configurable count, colour, size, spread radius, duration
  - Four spark shapes: dot, plus, line, star (CSS-only)
  - Multiple rapid clicks compose without state churn — each
    burst is independent and self-cleans on its own timer
  - Pure CSS keyframe animation, no rAF / spring physics
  - Honours prefers-reduced-motion (no burst spawned at all)
  - Zero external dependencies

  ACCESSIBILITY
  - The visual burst is decoration. The wrapped child remains
    the interactive element with its native role / focus / label.
  - When prefers-reduced-motion is set, burst generation is
    skipped entirely so no off-axis movement reaches the user.
  - The wrapper itself is not focusable and adds no ARIA noise.

  USAGE
  Default (white sparks, 8 dots, ~60px spread):
      <ClickSpark>
          <button>Click me</button>
      </ClickSpark>

  Custom palette + count:
      <ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
          <button class="cta">Try the demo</button>
      </ClickSpark>

  Bigger / slower:
      <ClickSpark spreadRadius={120} duration={900} sparkSize={14}>
          <a href="/about">About →</a>
      </ClickSpark>

  PROPS
  | Prop          | Type       | Default                          | Description |
  |---------------|------------|----------------------------------|-------------|
  | sparkColor    | string     | '#ffffff'                        | Any CSS colour. |
  | sparkCount    | number     | 8                                | Number of particles per click. Distributed evenly around 360°. |
  | sparkSize     | number     | 10                               | Particle size in px. |
  | spreadRadius  | number     | 60                               | How far each particle flies, in px. |
  | duration      | number     | 500                              | Burst lifetime in ms. |
  | easing        | string     | 'cubic-bezier(0.25, 1, 0.5, 1)'  | CSS easing for the fly-out. |
  | shape         | SparkShape | 'dot'                            | 'dot' \| 'plus' \| 'line' \| 'star' |
  | class         | string     | ''                               | Extra classes on the wrapper. |
  | children      | Snippet    | required                         | Element(s) to wrap. |

  ============================================================
-->

<script lang="ts" module>
	export type SparkShape = 'dot' | 'plus' | 'line' | 'star';

	/**
	 * Returns `count` evenly-spaced angles in degrees covering 360°.
	 * Exported (via `module`) so unit tests can import it without
	 * needing to render the whole component.
	 */
	export function getSparkAngles(count: number): number[] {
		if (count <= 0) return [];
		const step = 360 / count;
		const out: number[] = [];
		for (let i = 0; i < count; i++) out.push(i * step);
		return out;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		sparkColor?: string;
		sparkCount?: number;
		sparkSize?: number;
		spreadRadius?: number;
		duration?: number;
		easing?: string;
		shape?: SparkShape;
		class?: string;
		children?: Snippet;
	}

	let {
		sparkColor = '#ffffff',
		sparkCount = 8,
		sparkSize = 10,
		spreadRadius = 60,
		duration = 500,
		easing = 'cubic-bezier(0.25, 1, 0.5, 1)',
		shape = 'dot',
		class: className = '',
		children
	}: Props = $props();

	type Burst = {
		id: number;
		x: number;
		y: number;
		angles: number[];
	};

	let bursts: Burst[] = $state([]);
	let nextId = 0;

	function prefersReducedMotion(): boolean {
		if (typeof window === 'undefined' || !window.matchMedia) return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function handleClick(event: MouseEvent) {
		if (prefersReducedMotion()) return;
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const id = nextId++;
		bursts.push({ id, x, y, angles: getSparkAngles(sparkCount) });
		// Self-clean: drop the burst from state once its animation is done.
		// +50ms cushion absorbs requestAnimationFrame jitter at the tail end.
		setTimeout(() => {
			bursts = bursts.filter((b) => b.id !== id);
		}, duration + 50);
	}
</script>

<!-- The wrapper is decorative — keyboard users interact with the wrapped child. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="click-spark-wrapper {className}" onclick={handleClick}>
	{#if children}
		{@render children()}
	{/if}
	{#each bursts as burst (burst.id)}
		<div class="burst" style="left: {burst.x}px; top: {burst.y}px;" aria-hidden="true">
			{#each burst.angles as angle, i (i)}
				<span
					class="spark spark-{shape}"
					style="--angle: {angle}deg; --distance: {spreadRadius}px; --duration: {duration}ms; --color: {sparkColor}; --size: {sparkSize}px; --easing: {easing};"
				></span>
			{/each}
		</div>
	{/each}
</div>

<style>
	/*
	 * Wrapper sits inline so it doesn't disturb the parent's layout.
	 * `position: relative` is required so `.burst` (positioned absolute)
	 * anchors to it.
	 */
	.click-spark-wrapper {
		position: relative;
		display: inline-block;
	}

	/*
	 * Each burst is a 0×0 anchor at the click point. Its child sparks
	 * use that anchor as the rotation origin.
	 *
	 * pointer-events: none ensures the visual layer never swallows
	 * subsequent clicks meant for the wrapped child.
	 */
	.burst {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 9999;
	}

	/*
	 * Each spark is centred on the burst origin. We rotate first so the
	 * spark's own X axis points outward, then translateX along that axis.
	 * Result: every spark flies in its own direction without per-spark
	 * sin/cos calculations.
	 */
	.spark {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--size);
		height: var(--size);
		margin-left: calc(var(--size) / -2);
		margin-top: calc(var(--size) / -2);
		background: var(--color);
		transform: rotate(var(--angle)) translateX(0) scale(1);
		transform-origin: center;
		animation: spark-fly var(--duration) var(--easing) forwards;
		pointer-events: none;
		display: inline-block;
	}

	.spark-dot {
		border-radius: 50%;
	}

	/*
	 * "Plus" shape — two crossed gradient bars rendered into a transparent
	 * square. Works at any size and respects --color via the gradient stops.
	 */
	.spark-plus {
		background-color: transparent;
		background-image:
			linear-gradient(to right, var(--color) 0 100%),
			linear-gradient(to bottom, var(--color) 0 100%);
		background-size:
			100% 22%,
			22% 100%;
		background-position: center;
		background-repeat: no-repeat;
	}

	/*
	 * "Line" shape — thin pill that streaks outward. Width is a fraction
	 * of --size so the streak stays balanced relative to spread.
	 */
	.spark-line {
		width: calc(var(--size) * 0.3);
		height: var(--size);
		margin-left: calc(var(--size) * -0.15);
		border-radius: 9999px;
	}

	/*
	 * "Star" shape — five-pointed star via clip-path. Background colour
	 * is solid because clip-path masks the outer shape.
	 */
	.spark-star {
		background-color: var(--color);
		clip-path: polygon(
			50% 0%,
			61% 35%,
			98% 35%,
			68% 57%,
			79% 91%,
			50% 70%,
			21% 91%,
			32% 57%,
			2% 35%,
			39% 35%
		);
	}

	/*
	 * Fly outward + scale down + fade. The mid-keyframe holds opacity
	 * so the spark is fully visible for the bulk of the trip and then
	 * fades sharply as it finishes — gives the burst a snappy feel.
	 */
	@keyframes spark-fly {
		0% {
			transform: rotate(var(--angle)) translateX(0) scale(1);
			opacity: 1;
		}
		60% {
			opacity: 1;
		}
		100% {
			transform: rotate(var(--angle)) translateX(var(--distance)) scale(0.4);
			opacity: 0;
		}
	}

	/*
	 * Reduced-motion: the click handler also short-circuits, so this
	 * is belt-and-braces — even if a burst somehow lands in the DOM
	 * (e.g. preference flips mid-flight), we hide it instantly.
	 */
	@media (prefers-reduced-motion: reduce) {
		.spark {
			display: none;
		}
	}
</style>
