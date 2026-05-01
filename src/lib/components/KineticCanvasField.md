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
