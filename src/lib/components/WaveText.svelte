<script lang="ts">
  /**
   * WaveText component displays text that follows a sine wave path.
   * It uses an SVG <path> and <textPath> with calcMode="linear".
   *
   * Props:
   *  - text: string to display
   *  - amplitude: vertical wave amplitude in pixels (default 20)
   *  - wavelength: horizontal distance between peaks (default 200)
   */
  export let text = "WAVING TEXT";
  export let amplitude = 20;
  export let wavelength = 200;

  // Generate a path data string for a sine wave.
  const generatePath = () => {
    const points: Array<[number, number]> = [];
    const totalWidth = 1200; // keep constant width for consistency
    const step = wavelength / 20;
    for (let x = 0; x <= totalWidth + step; x += step) {
      const y = amplitude * Math.sin((2 * Math.PI * x) / wavelength);
      points.push([x, y + 150]); // center at 150
    }
    const d = points
      .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
      .join(" ");
    return d;
  };

  let pathData = "";
  $: pathData = generatePath();
</script>

<style>
  :global(svg) {
    width: 100%;
    height: 300px;
    display: block;
  }

  :global(text) {
    font-family: "Space Mono", monospace;
    font-size: 32px;
    fill: #111;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
</style>

<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid meet">
  <defs>
    <path id="wave" d={pathData} fill="none" stroke="transparent" />
  </defs>
  <text>
    <textPath href="#wave" startOffset="50%" method="align" spacing="auto" calcMode="linear">
      {text}
    </textPath>
  </text>
</svg>
