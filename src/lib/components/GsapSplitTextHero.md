---
title: GsapSplitTextHero
category: Motion Primitives
---

# GsapSplitTextHero

Reusable GSAP SplitText hero inspired by GreenSock's SplitText mode demo:
https://codepen.io/GreenSock/pen/xxmaNYj

It exposes character, word, and line animation modes, registers SplitText on the client,
uses responsive line re-splitting, reverts generated markup on unmount, and supports
both light and dark visual themes.

```svelte
<GsapSplitTextHero
	headline="Motion primitives with manners"
	copy="Client-only GSAP components packaged as reusable Svelte primitives."
	theme="light"
/>
```
