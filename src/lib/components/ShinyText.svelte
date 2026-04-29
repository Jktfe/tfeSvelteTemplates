<!--
	============================================================
	ShinyText — Animated text shimmer
	============================================================

	🎯 WHAT IT DOES
	Wraps a string of text in a CSS gradient that has a brighter
	"shine" sweeping across the letters. Pure CSS, zero JavaScript
	runtime cost — the entire effect is one keyframe animation.

	The trick: a horizontal linear-gradient (base → shine → base)
	is sized to 200% of the element's width and clipped to the
	letter shapes via `background-clip: text`. Animating
	`background-position` slides the bright band across the
	visible text.

	✨ FEATURES
	• Configurable shine + base colour (any CSS colour value)
	• LR or RL sweep direction (toggled via animation-direction)
	• Loop or one-shot mode
	• Optional start delay
	• Pure CSS — no rAF, no JS interval, no ResizeObserver

	♿ ACCESSIBILITY
	• Screen readers see plain text (a normal text node)
	• Respects `prefers-reduced-motion`: animation suppressed,
	  text rests in its base colour with no movement
	• No focus or interaction semantics changed — purely
	  decorative styling

	📦 DEPENDENCIES
	Zero external dependencies — pure CSS keyframe animation.

	⚡ PERFORMANCE
	• Single GPU-accelerated `background-position` animation
	• No JS work after mount
	• Safe to put many on a page

	🎨 USAGE
	<ShinyText text="Premium" />

	<ShinyText
	    text="Get Started →"
	    shineColor="#fbbf24"
	    baseColor="#475569"
	    duration={2.5}
	    direction="lr"
	    loop={true} />

	📋 PROPS
	| Prop       | Type            | Default     | Description                  |
	|------------|-----------------|-------------|------------------------------|
	| text       | string          | required    | The text to display          |
	| baseColor  | string          | '#94a3b8'   | Resting text colour          |
	| shineColor | string          | '#ffffff'   | Bright shine colour          |
	| duration   | number          | 3           | Seconds per sweep            |
	| direction  | 'lr' \| 'rl'    | 'lr'        | Shine sweep direction        |
	| loop       | boolean         | true        | Repeat indefinitely          |
	| delay      | number          | 0           | Seconds before first sweep   |
	| class      | string          | ''          | Extra CSS classes            |

	💡 DISTINCT FROM
	• ShineBorder — animates a border, not the text fill
	• Typewriter  — types characters one-by-one, no gradient
	• Marquee     — scrolls a whole element, doesn't recolour text
	============================================================
-->
<script lang="ts" module>
	/** Direction of the visual shine sweep. */
	export type ShineDirection = 'lr' | 'rl';

	/**
	 * Build the linear-gradient stop string used by the shimmer effect.
	 * Exported so unit tests can assert the gradient is shaped correctly
	 * without having to render a component.
	 *
	 * Layout: base at 0% → shine at 50% → base at 100%, so when the
	 * background slides past a letter the brightest point sweeps once.
	 */
	export function buildShinyGradient(base: string, shine: string): string {
		return `linear-gradient(90deg, ${base} 0%, ${shine} 50%, ${base} 100%)`;
	}

	/**
	 * Map a sweep direction to the CSS `animation-direction` keyword.
	 * - 'lr' → 'normal'  (gradient slides left→right, shine sweeps LR)
	 * - 'rl' → 'reverse' (gradient slides right→left, shine sweeps RL)
	 *
	 * Using a single keyframe block + animation-direction avoids the
	 * Safari / older-WebKit quirk where CSS custom properties inside
	 * @keyframes can fail to resolve.
	 */
	export function getAnimDirection(direction: ShineDirection): 'normal' | 'reverse' {
		return direction === 'lr' ? 'normal' : 'reverse';
	}

	/**
	 * Map the boolean loop flag to the CSS `animation-iteration-count`
	 * value. Kept as a tiny helper so the call site stays declarative
	 * and the unit test can assert both branches in two lines.
	 */
	export function getIterationCount(loop: boolean): 'infinite' | '1' {
		return loop ? 'infinite' : '1';
	}
</script>

<script lang="ts">
	interface Props {
		text: string;
		baseColor?: string;
		shineColor?: string;
		duration?: number;
		direction?: ShineDirection;
		loop?: boolean;
		delay?: number;
		class?: string;
	}

	let {
		text,
		baseColor = '#94a3b8',
		shineColor = '#ffffff',
		duration = 3,
		direction = 'lr',
		loop = true,
		delay = 0,
		class: extraClass = ''
	}: Props = $props();

	const gradient = $derived(buildShinyGradient(baseColor, shineColor));
	const animDirection = $derived(getAnimDirection(direction));
	const iterationCount = $derived(getIterationCount(loop));
</script>

<span
	class="shiny-text {extraClass}"
	style:--shiny-gradient={gradient}
	style:--shiny-base={baseColor}
	style:--shiny-duration="{duration}s"
	style:--shiny-delay="{delay}s"
	style:--shiny-direction={animDirection}
	style:--shiny-iteration={iterationCount}
	data-direction={direction}
>
	{text}
</span>

<style>
	.shiny-text {
		/* inline-block so background-clip: text has a measurable box */
		display: inline-block;
		/* the gradient renders only inside the letter shapes */
		background-image: var(--shiny-gradient);
		background-size: 200% auto;
		background-position: -200% center;
		background-clip: text;
		-webkit-background-clip: text;
		/* fallback colour for screenshots / unsupported browsers */
		color: var(--shiny-base);
		-webkit-text-fill-color: transparent;
		color: transparent;
		animation-name: shiny-sweep;
		animation-duration: var(--shiny-duration);
		animation-delay: var(--shiny-delay);
		animation-timing-function: linear;
		animation-direction: var(--shiny-direction);
		animation-iteration-count: var(--shiny-iteration);
		animation-fill-mode: forwards;
		/* keep the inherited font weight/size — purely a paint effect */
		font: inherit;
	}

	@keyframes shiny-sweep {
		from {
			background-position: -200% center;
		}
		to {
			background-position: 200% center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shiny-text {
			/* honour the user — no movement, settle on the base colour */
			animation: none;
			background-image: none;
			color: var(--shiny-base);
			-webkit-text-fill-color: var(--shiny-base);
		}
	}
</style>
