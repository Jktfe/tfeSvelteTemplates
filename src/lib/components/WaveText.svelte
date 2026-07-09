<!--
  ===========================================================
  WAVE TEXT
  ===========================================================
  WHAT — Text laid along a sine-wave SVG path.
  FEATURES
    • Sine path generated from amplitude + wavelength
    • Centred along the curve via <textPath startOffset="50%">
  ACCESSIBILITY — static text; readable by screen readers as the SVG
                  <text> content. No motion.
  DEPENDENCIES — zero (pure SVG + CSS)
  PERFORMANCE — path recomputed only when amplitude/wavelength change
  USAGE
    <WaveText text="HELLO" amplitude={24} wavelength={180} />
  PROPS
    | Prop       | Type   | Default        | Description                     |
    | text       | string | 'WAVING TEXT'  | Text to lay along the wave      |
    | amplitude  | number | 20             | Vertical wave height in px      |
    | wavelength | number | 200            | Horizontal distance per peak    |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** Text to lay along the wave. */
		text?: string;
		/** Vertical wave amplitude in pixels. */
		amplitude?: number;
		/** Horizontal distance between peaks in pixels. */
		wavelength?: number;
	}

	let { text = 'WAVING TEXT', amplitude = 20, wavelength = 200 }: Props = $props();

	// Build an SVG path string tracing a sine wave across a constant width.
	function generatePath(amp: number, wave: number): string {
		const points: Array<[number, number]> = [];
		const totalWidth = 1200;
		const step = wave / 20;
		for (let x = 0; x <= totalWidth + step; x += step) {
			const y = amp * Math.sin((2 * Math.PI * x) / wave);
			points.push([x, y + 150]); // centre vertically at 150
		}
		return points
			.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
			.join(' ');
	}

	const pathData = $derived(generatePath(amplitude, wavelength));
</script>

<svg class="wave-svg" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet">
	<defs>
		<path id="wave" d={pathData} fill="none" stroke="transparent" />
	</defs>
	<text class="wave-text">
		<textPath href="#wave" startOffset="50%" method="align" spacing="auto">
			{text}
		</textPath>
	</text>
</svg>

<style>
	.wave-svg {
		width: 100%;
		height: 300px;
		display: block;
	}

	.wave-text {
		font-family: 'Space Mono', monospace;
		font-size: 32px;
		fill: var(--fg, #111);
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
</style>
