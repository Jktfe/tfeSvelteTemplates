---
title: GsapRevealSequence
category: Motion Primitives
---

# GsapRevealSequence

Client-only GSAP stagger wrapper for headings, cards, controls, and hero copy. It scopes animations to the local component root, reverts on unmount, and collapses to a final readable state under `prefers-reduced-motion`.

```svelte
<GsapRevealSequence stagger={0.1} distance={36}>
	<h2 data-gsap-item>Launch faster</h2>
	<p data-gsap-item>Sequenced content without page-level animation code.</p>
</GsapRevealSequence>
```
