<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * Text that follows the SVG path and morphs when hovered.
   */
  export let originalText: string = '';
  export let morphedText: string = '';
  const repeatCount: number = 4; // Repeat to span the whole path

  let displayText: string;
  function setDisplay(text: string) {
    displayText = text.repeat(repeatCount);
  }

  onMount(() => setDisplay(originalText));

  function handleEnter() {
    setDisplay(morphedText);
  }

  function handleLeave() {
    setDisplay(originalText);
  }
</script>

<div
  class="signal-container"
  role="img"
  aria-label={`${originalText} morphs to ${morphedText}`}
  on:mouseenter={handleEnter}
  on:mouseleave={handleLeave}
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

        <animate
          attributeName="startOffset"
          from="0%"
          to="-100%"
          dur="40s"
          repeatCount="indefinite"
          calcMode="linear"
        />
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
    background-color: #fafafa; /* Light neutral background */
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
    fill: #111;
  }
</style>
