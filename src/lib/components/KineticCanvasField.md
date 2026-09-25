---
title: KineticCanvasField
category: Motion Primitives
---

# KineticCanvasField

Canvas-based pointer trail and click burst wrapper driven by `gsap.ticker`. It caps particles, cleans up listeners/ticker work on unmount, and hides the canvas for reduced motion.

```svelte
<KineticCanvasField density={96} palette="aurora">
	<section>Interactive content stays above the canvas.</section>
</KineticCanvasField>
```

## Frame timing

`gsap.ticker` calls listeners with its elapsed time in **seconds** (not milliseconds like
`requestAnimationFrame`). The exported `tickerFrameDelta(time, lastTime)` helper turns that
into a per-frame step without any `/ 1000` conversion, uses a nominal `1 / 60` step on the
first frame (or if time fails to advance), and clamps long gaps — a backgrounded tab, say —
to `MAX_FRAME_DELTA` (0.04s) so particles never jump across the canvas. Particle velocities
are therefore in pixels per second, and gravity adds 28px/s² to `vy`.
