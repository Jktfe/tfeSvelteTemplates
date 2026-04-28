<!--
  ============================================================
  MAGNETICBUTTON
  ============================================================

  🎯 WHAT IT DOES
  Adds a high-end 'magnetic attraction' effect to buttons, where they subtly shift towards the user's cursor as it approaches.

  ✨ FEATURES
  • Magnetic Attraction: Smoothly calculates offset based on cursor proximity using Svelte 5 runes.
  • Svelte 5 Optimized: Uses runes for lightweight, high-performance reactivity without heavy overhead.
  • Zero Dependencies: Pure CSS and Svelte logic—no external animation libraries needed.
  • Highly Configurable: Easily adjust the 'magnetic strength', 'radius', and 'damping' via props.
  • TFE Compatible: Works perfectly with existing TFE button styles and themes.

  ♿ ACCESSIBILITY
  • Keyboard: Maintains standard click/enter interaction. Target remains stable for accessibility.
  • Screen readers: Uses standard semantic button elements.
  • Motion: Respects `prefers-reduced-motion` by disabling the movement effect.

  📦 DEPENDENCIES
  [Zero external dependencies]

  ⚡ PERFORMANCE
  • Suitable for: Primary CTAs, featured buttons in hero sections.
  • Considerations: Extremely lightweight; minimal impact on main thread.

  🎨 USAGE
  <MagneticButton strength={0.3} radius={100}>
    <button class="btn">Click Me</button>
  </MagneticButton>

  📋 PROPS
  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | children | Snippet | required | The content to be wrapped in the magnetic effect. |
  | strength | number | 0.3 | How far the button moves towards the cursor (0 to 1). |
  | radius | number | 100 | Distance in pixels at which attraction begins. |
  | damping | number | 0.1 | Smoothness of return (simulated via CSS transition). |

  ============================================================
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    strength?: number;
    radius?: number;
    damping?: number;
  }

  let {
    children,
    strength = 0.3,
    radius = 100,
    damping = 0.1
  }: Props = $props();

  let x = $state(0);
  let y = $state(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP: reserved for active-state CSS hook
  let isMoving = $state(false);

  // Capability detection — kept reactive so OS-level changes flip the effect on/off live.
  let prefersReducedMotion = $state(false);
  let coarsePointer = $state(false);

  onMount(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerMq = window.matchMedia('(pointer: coarse)');
    prefersReducedMotion = motionMq.matches;
    coarsePointer = pointerMq.matches;

    const onMotion = (e: MediaQueryListEvent) => { prefersReducedMotion = e.matches; };
    const onPointer = (e: MediaQueryListEvent) => { coarsePointer = e.matches; };
    motionMq.addEventListener('change', onMotion);
    pointerMq.addEventListener('change', onPointer);

    return () => {
      motionMq.removeEventListener('change', onMotion);
      pointerMq.removeEventListener('change', onPointer);
    };
  });

  function handleMouseMove(event: MouseEvent) {
    if (prefersReducedMotion || coarsePointer) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Find center of the button
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Distance from cursor to center
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;

    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < radius) {
      isMoving = true;
      // Calculate how much to move based on strength and distance ratio
      const factor = (1 - distance / radius) * strength;
      x = distanceX * factor;
      y = distanceY * factor;
    } else {
      reset();
    }
  }

  function handleMouseLeave() {
    if (prefersReducedMotion || coarsePointer) return;
    reset();
  }

  function reset() {
    x = 0;
    y = 0;
    isMoving = false;
  }
</script>

<!--
  The wrapper carries the mouse listeners but is purely decorative — the
  interactive child (button/link) inside `children` keeps its own role and
  keyboard semantics. We silence the a11y rule rather than fake an interactive
  role on a non-interactive container.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="magnetic-wrapper"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  style:--radius="{radius}px"
>
  <div
    class="magnetic-content"
    style:transform="translate({x}px, {y}px)"
    style:transition="transform {damping}s cubic-bezier(0.23, 1, 0.32, 1)"
  >
    {@render children()}
  </div>
</div>

<style>
  .magnetic-wrapper {
    display: inline-block;
    padding: var(--radius); /* Expands the hit-area so the cursor can attract from the configured radius */
    margin: calc(var(--radius) * -1); /* Cancel the visual padding so layout stays unchanged */
    cursor: pointer;
    position: relative;
  }

  .magnetic-content {
    display: block;
    will-change: transform;
  }

  /* Ensure the button doesn't jitter by keeping it stable */
</style>
