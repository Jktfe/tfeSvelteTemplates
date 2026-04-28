<!--
  ============================================================
  SkeletonLoader - Content-Shape Loading Placeholder
  ============================================================

  🎯 WHAT IT DOES
  Renders a soft grey shape that pre-figures the layout of content
  while it loads. Reduces perceived load time and prevents layout
  shift when the real content arrives.

  ✨ FEATURES
  • Three shape primitives: 'text' (rounded line), 'circle' (avatar), 'rect' (card / image)
  • Configurable width, height, and border-radius
  • Pulse or shimmer animation — pick the one that fits your brand
  • Animation can be disabled entirely (respects prefers-reduced-motion automatically)
  • Composable — stack lots of skeletons inside cards / lists for full layouts

  ♿ ACCESSIBILITY
  • Sets aria-hidden="true" because it's purely decorative
  • Parent should communicate loading state via aria-busy or a sr-only message
  • Honours prefers-reduced-motion — animation stops automatically

  📦 DEPENDENCIES
  Zero external dependencies. Pure CSS animations.

  🎨 USAGE
  <SkeletonLoader />                            (default text line)
  <SkeletonLoader shape="circle" width="48px" height="48px" />
  <SkeletonLoader shape="rect" width="100%" height="180px" />
  <SkeletonLoader shape="text" width="60%" />
  <SkeletonLoader animation="shimmer" />
  <SkeletonLoader animation="none" />           (static placeholder)

  📋 PROPS
  | Prop      | Type                              | Default  | Description |
  |-----------|-----------------------------------|----------|-------------|
  | shape     | 'text' \| 'circle' \| 'rect'        | 'text'   | Geometry primitive |
  | width     | string                            | '100%'   | CSS width (any unit) |
  | height    | string                            | undef    | CSS height — defaults vary by shape |
  | radius    | string                            | undef    | Override border-radius |
  | animation | 'pulse' \| 'shimmer' \| 'none'      | 'pulse'  | Loading animation style |
  | class     | string                            | ''       | Extra classes |

  ============================================================
-->

<script lang="ts">
	export type SkeletonShape = 'text' | 'circle' | 'rect';
	export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none';

	interface Props {
		shape?: SkeletonShape;
		width?: string;
		height?: string;
		radius?: string;
		animation?: SkeletonAnimation;
		class?: string;
	}

	let {
		shape = 'text',
		width = '100%',
		height,
		radius,
		animation = 'pulse',
		class: extraClass = ''
	}: Props = $props();

	// Defaults differ per shape to give sensible "looks right" sizes.
	let resolvedHeight = $derived(
		height ?? (shape === 'text' ? '0.875rem' : shape === 'circle' ? '2.5rem' : '8rem')
	);

	// Width for circles defaults to the height so they're round.
	let resolvedWidth = $derived(shape === 'circle' && !width ? resolvedHeight : width);

	let resolvedRadius = $derived(
		radius ?? (shape === 'circle' ? '50%' : shape === 'text' ? '4px' : '8px')
	);
</script>

<span
	class="skeleton skeleton-{shape} skeleton-{animation} {extraClass}"
	style:width={resolvedWidth}
	style:height={resolvedHeight}
	style:border-radius={resolvedRadius}
	aria-hidden="true"
></span>

<style>
	.skeleton {
		display: inline-block;
		background-color: #e5e7eb;
		vertical-align: middle;
	}

	/* Pulse animation — gentle fade in/out */
	.skeleton-pulse {
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}

	/* Shimmer animation — sweeping highlight */
	.skeleton-shimmer {
		position: relative;
		overflow: hidden;
		background-color: #e5e7eb;
	}
	.skeleton-shimmer::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.65) 50%,
			rgba(255, 255, 255, 0) 100%
		);
		transform: translateX(-100%);
		animation: skeleton-shimmer 1.6s linear infinite;
	}

	@keyframes skeleton-shimmer {
		100% {
			transform: translateX(100%);
		}
	}

	/* No animation — static placeholder */
	.skeleton-none {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-pulse,
		.skeleton-shimmer::after {
			animation: none;
		}
	}
</style>
