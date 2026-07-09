<!--
  ===========================================================
  ANIMATED TEXT
  ===========================================================
  WHAT — Text set along a wavy SVG path that scrolls continuously and
         swaps to an alternate string on hover.
  FEATURES
    • SVG <textPath> follows a quadratic wave
    • Hover morphs originalText → morphedText
    • Continuous horizontal drift via SMIL <animate>
  ACCESSIBILITY
    • role="img" with a descriptive aria-label naming both strings
    • Honours prefers-reduced-motion — the drift animation is dropped
      and the text sits still
  DEPENDENCIES — zero (pure SVG + CSS)
  PERFORMANCE — single SMIL animation on one element; negligible cost
  USAGE
    <AnimatedText originalText="SIGNAL" morphedText="NOISE" />
  PROPS
    | Prop         | Type   | Default | Description                        |
    | originalText | string | ''      | Text shown at rest                 |
    | morphedText  | string | ''      | Text shown while hovered           |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** Text shown at rest. */
		originalText?: string;
		/** Text shown while the container is hovered. */
		morphedText?: string;
	}

	let { originalText = '', morphedText = '' }: Props = $props();

	// Repeat the string so it spans the full width of the path.
	const repeatCount = 4;

	let hovered = $state(false);
	const displayText = $derived((hovered ? morphedText : originalText).repeat(repeatCount));

	// Reduced-motion is read reactively so the drift stops if the user toggles
	// the OS setting mid-session. Inlined (no imports) to keep the component
	// copy-paste portable.
	let reducedMotion = $state(false);
	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (event: MediaQueryListEvent) => (reducedMotion = event.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<div
	class="signal-container"
	role="img"
	aria-label={`${originalText} morphs to ${morphedText}`}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
		<path
			id="wave-path"
			d="M -300 150 Q 0 -50 300 150 T 900 150 T 1500 150 T 2100 150"
			fill="none"
			stroke="none"
		/>

		<text class="wave-text">
			<textPath href="#wave-path" startOffset="0%">
				{displayText}

				{#if !reducedMotion}
					<animate
						attributeName="startOffset"
						from="0%"
						to="-100%"
						dur="40s"
						repeatCount="indefinite"
						calcMode="linear"
					/>
				{/if}
			</textPath>
		</text>
	</svg>
</div>

<style>
	.signal-container {
		width: 100%;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--surface, #fafafa);
		cursor: pointer;
	}

	svg {
		width: 100%;
		min-width: 800px;
		height: 150px;
		display: block;
	}

	.wave-text {
		font-family: 'Space Mono', 'Courier New', monospace;
		font-size: 20px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		fill: var(--fg, #111);
	}
</style>
