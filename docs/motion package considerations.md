# Svelte 5 Motion Libraries: 2024-2025 Landscape Analysis

**The motion library ecosystem for Svelte 5 is in active transition.** The older `svelte-motion` package is effectively abandoned, while `@humanspeak/svelte-motion` has emerged as the modern, runes-compatible alternative. However, native Svelte 5 features remain the recommended starting point for most projects, with external libraries reserved for specialized needs.

## Direct comparison: @humanspeak/svelte-motion vs svelte-motion

These are **separate packages, not related by fork or version**. The naming similarity is coincidental, and they represent different generations of Svelte animation tooling.

### svelte-motion (micha-lmxt) — Legacy package

This older Framer Motion port is **no longer viable for new projects**. Last published June 2022 with **6,250 weekly downloads** and version 0.12.2, it explicitly requires `svelte: ^3.35.0` and has no Svelte 5 support. The repository shows minimal activity (last commit ~1 year ago) with 20 open issues dating back to 2022-2024 remaining unresolved. At **670 kB unpacked**, it carries significant bundle weight while offering no path forward for modern Svelte development.

**Maintenance status**: Abandoned  
**Svelte 5 compatibility**: None — incompatible with runes and modern patterns  
**Recommendation**: Avoid for all new projects

### @humanspeak/svelte-motion — Modern Svelte 5 implementation

Built from the ground up for Svelte 5 by Humanspeak, Inc., this package demonstrates active development with version 0.1.12 published just 18 days ago. Despite being new (**281 weekly downloads**), it's the only motion library explicitly designed for Svelte 5's runes system. The **408 kB package** is 40% smaller than its predecessor while offering comparable features.

The library provides motion components for all HTML and SVG elements (`motion.div`, `motion.svg`, etc.), spring physics with hardware acceleration, FLIP-based layout animations, gesture support (hover, tap with true-hover gating), and `AnimatePresence` for exit animations. Examples throughout the documentation showcase `$state` rune integration:

```typescript
let isOpen = $state(false)
const variants = {
  open: { opacity: 1, scale: 1 },
  closed: { opacity: 0, scale: 0.8 }
}
```

The API mirrors Motion/Framer Motion's declarative style but adapts it to Svelte patterns. SSR support includes proper hydration without flicker, and the `useTimeline` hook provides frame-synchronized animations in an SSR-safe manner. TypeScript definitions are included, and the team actively solicits React Motion examples for porting.

**Maintenance status**: Active (Humanspeak, Inc.)  
**Svelte 5 compatibility**: Full native support with runes  
**Official site**: motion.svelte.page  
**Recommendation**: Best choice when you need Framer Motion-style API in Svelte 5

## Better alternatives for Svelte 5 animation

### Native Svelte 5 features — The default choice

Svelte's built-in animation capabilities should be your **first consideration for 90%+ of use cases**. The framework ships with seven transition functions (fade, blur, fly, slide, scale, draw, crossfade), FLIP animations via `animate:flip`, and motion stores for value interpolation.

**Svelte 5.8.0 introduced modern class-based APIs** that integrate seamlessly with runes. The new `Spring` class provides physics-based animation with configurable stiffness and damping:

```javascript
import { Spring } from 'svelte/motion'
const spring = new Spring(0, { stiffness: 0.1, damping: 0.25 })
```

The `Tween` class handles fixed-duration interpolation with easing, while the new `prefersReducedMotion` export provides built-in accessibility. All transitions compile to optimized CSS that runs off the main thread, delivering 60fps performance even on low-end devices.

Runes enhance animation patterns without breaking existing APIs. Use `$state` for reactive values, `$derived` for computed animation parameters, and `$effect` for coordinating complex sequences:

```javascript
let count = $state(0)
const scale = $derived(count > 10 ? 1.5 : 1.0)
const duration = $derived(prefersReducedMotion.current ? 0 : 300)

$effect(() => {
  if (count > 5) {
    // Trigger coordinated animations
  }
})
```

**Bundle size**: Zero impact if unused (tree-shakeable)  
**Performance**: CSS-based, GPU-accelerated, off main thread  
**Svelte 5 compatibility**: Perfect — runes enhance the existing API  
**Best for**: UI transitions, modals, lists, value interpolation, micro-interactions  
**Recommendation**: Start here for all new projects

### AutoAnimate — Zero-config simplicity

This FormKit package leads the ecosystem with **370,056 weekly downloads** and remarkable simplicity. A single line of code (`use:autoAnimate`) automatically animates DOM additions, removals, and reordering. Framework-agnostic design ensures Svelte 5 compatibility, and the zero-configuration approach respects `prefers-reduced-motion` by default.

**Bundle size**: 56.4 kB  
**NPM**: @formkit/auto-animate  
**GitHub stars**: 13,596+  
**Best for**: Quick, automatic animations without configuration  
**Recommendation**: Perfect for rapid prototyping or projects prioritizing simplicity

### Motion One — Professional performance

With **10+ million monthly downloads**, Motion One represents the evolution of Framer Motion's core. Its hybrid engine combines JavaScript with native browser APIs to deliver 120fps GPU-accelerated animations while remaining smaller than GSAP. The library is 2.5x faster than GSAP for unknown values and fully framework-agnostic, working seamlessly with Svelte 5 through actions.

**License**: MIT  
**Best for**: Modern web animations with optimal performance  
**Recommendation**: Strong choice for performance-critical applications needing advanced features

### GSAP — Industry standard for complex work

When you need professional timeline-based choreography, GSAP remains unmatched. Millions of weekly downloads reflect its position as the industry standard for complex animations. ScrollTrigger, FLIP plugin, and advanced timeline sequencing exceed what simpler libraries offer. Integration with Svelte uses `onMount` and `bind:this` patterns.

**License**: Free for most use; commercial license for tools competing with Webflow  
**Best for**: Complex timelines, professional animations, scroll effects  
**Recommendation**: Reserve for projects requiring sophisticated animation choreography

### @animotion/motion — Lightweight SVG specialist

Created by Joy of Code, this pure Svelte library focuses on SVG animations and data visualizations. At **8.84 kB**, it's one of the smallest options while offering tween-based animations, sound effects integration, and async/await sequencing. Version 2.0.1 published mid-2024 shows ongoing maintenance.

**NPM**: @animotion/motion  
**Weekly downloads**: 39  
**Best for**: SVG animations, data visualizations, presentation tools  
**Recommendation**: Excellent choice for data-driven or SVG-heavy projects

## Key Svelte 5 considerations

### Runes compatibility determines viability

Svelte 5's breaking changes around runes mean older libraries face compatibility barriers. The explicit reactivity model (`$state`, `$derived`, `$effect`) replaces implicit reactivity, and libraries not updated for this paradigm simply don't work. As of late 2024, the transition is ongoing:

**✅ Fully compatible libraries:**
- Native Svelte features (transitions, animations, motion stores)
- @humanspeak/svelte-motion (built for Svelte 5)
- AutoAnimate (framework-agnostic)
- Motion One (framework-agnostic)
- GSAP (framework-agnostic)
- @animotion/motion
- svelte-animate (shinokada)

**❌ Incompatible:**
- svelte-motion (micha-lmxt) — abandoned, Svelte 3 only

**⚠️ Status unclear:**
- Many component libraries with animation features
- Smaller animation utilities without active maintenance

### Svelte-native approaches win on bundle size and performance

Framework-agnostic libraries like GSAP and Motion One work well but don't leverage Svelte's compile-time advantages. Native Svelte animations compile to optimized CSS keyframes with zero runtime overhead, resulting in typical app bundles of **3-10KB** versus React's 40-100KB baseline.

Performance benchmarks consistently show Svelte 5 outperforming React by 3-7.5x in rendering speed, with animation-specific advantages from CSS-based transitions running off the main thread. The signal-based reactivity of runes enables surgical DOM updates — only specific animated properties trigger re-renders rather than component-wide reconciliation.

**React ports vs pure Svelte:** The community strongly prefers pure Svelte solutions over React ports. However, `@humanspeak/svelte-motion` distinguishes itself by being rebuilt for Svelte 5 rather than mechanically ported, earning it acceptance despite its Framer Motion inspiration.

### Community recommendations converge on native-first

Discussions across Reddit's r/sveltejs, Discord, Dev.to, and Medium articles reveal consistent patterns. Developers recommend starting with built-in features (transitions, animations, motion stores) for standard UI work, reaching for AutoAnimate when configuration overhead isn't justified, and reserving GSAP or Motion One for truly complex timeline-based animation.

The release of Svelte 5.8.0's new `Spring` and `Tween` classes in December 2024 strengthened native capabilities further. Rich Harris and the Svelte team maintain a "built-in, not bolted-on" philosophy where common tasks should require no external dependencies.

## Recommendations by use case

### Standard UI animations (90% of projects)
**Use native Svelte 5 features.** Built-in transitions handle modals, dropdowns, page transitions, and tooltips. FLIP animations manage list reordering. Spring and Tween classes interpolate values. This approach delivers the smallest bundles, best performance, and zero configuration overhead.

### Rapid prototyping
**AutoAnimate** provides instant animations with one line of code. Its zero-config approach speeds development while maintaining production quality.

### Framer Motion familiarity
**@humanspeak/svelte-motion** offers the most Framer Motion-like API for Svelte 5. Teams migrating from React or developers who prefer declarative variants will find this familiar.

### Performance-critical applications
**Motion One** combines small bundle size with exceptional performance. Its hybrid engine and GPU acceleration make it ideal when both speed and bundle size matter.

### Complex timeline choreography
**GSAP** remains unmatched for sophisticated animation sequences. ScrollTrigger, advanced easing, and timeline controls exceed simpler libraries' capabilities.

### SVG and data visualization
**@animotion/motion** provides the lightest bundle at 8.84 kB while focusing specifically on SVG animation needs.

### 3D animations
**svelte-cubed** (Rich Harris's Three.js wrapper) handles WebGL and 3D work that CSS-based animations cannot address.

## Package statistics summary

| Package | Weekly Downloads | Bundle Size | Last Update | Svelte 5 |
|---------|-----------------|-------------|-------------|----------|
| AutoAnimate | 370,056 | 56.4 kB | 2 months ago | ✅ Yes |
| svelte-motion (old) | 6,250 | 670 kB | 2 years ago | ❌ No |
| @humanspeak/svelte-motion | 281 | 408 kB | 18 days ago | ✅ Yes |
| @animotion/motion | 39 | 8.84 kB | 8 months ago | ✅ Yes |
| Native Svelte | N/A | 0 kB | Ongoing | ✅ Yes |
| Motion One | 10M+ monthly | ~14 kB | Active | ✅ Yes |
| GSAP | Millions weekly | ~50 kB | Active | ✅ Yes |

## Conclusion

**Start with native Svelte 5 animations for all projects.** The built-in transitions, FLIP animations, and new Spring/Tween classes handle the vast majority of animation needs with zero bundle overhead and optimal performance. The new runes system integrates seamlessly with existing animation APIs while enabling more explicit reactivity patterns.

**When native features prove insufficient**, choose based on your specific needs: AutoAnimate for simplicity, @humanspeak/svelte-motion for Framer Motion familiarity, Motion One for performance, GSAP for complex timelines, or @animotion/motion for SVG work.

**Avoid svelte-motion (micha-lmxt) entirely** — it's abandoned and incompatible with Svelte 5. The ecosystem has moved on, and continuing to use this package will block your ability to adopt Svelte 5's improvements.

The animation library landscape for Svelte 5 is still maturing in late 2024, but native features have never been stronger. Rich Harris's philosophy of "built-in, not bolted-on" means most developers will never need external animation libraries, and when they do, framework-agnostic options like Motion One and GSAP offer better longevity than framework-specific ports.