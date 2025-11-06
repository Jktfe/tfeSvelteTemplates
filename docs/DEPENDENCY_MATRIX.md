# Component Dependency Matrix

This document provides a comprehensive overview of all components in the tfeSvelteTemplates library, their external dependencies, and implementation approaches.

## Summary

**Total Components:** 9
**Zero Dependency Components:** 7 (78%)
**External Dependencies Required:** 2 components (22%)

**External Libraries Used:**
- `@humanspeak/svelte-motion` (408 kB) - Used by 2 components for advanced FLIP animations and drag gestures

## Component Breakdown

### Zero Dependency Components (Pure Svelte 5 & CSS)

| Component | Type | Animation Approach | Complexity | File |
|-----------|------|-------------------|------------|------|
| **CardStack** | Pure CSS | CSS transitions & transforms | Low | `CardStack.svelte` |
| **CardStackAdvanced** | Pure CSS + Events | CSS transitions, keyboard & touch events | Medium | `CardStackAdvanced.svelte` |
| **Marquee** | Pure CSS | CSS @keyframes animations | Very Low | `Marquee.svelte` |
| **MarqueeDraggable** | Native Svelte 5 | Spring class + pointer events | High | `MarqueeDraggable.svelte` |
| **MagicCard** | Pure CSS + Svelte 5 | $state runes + CSS radial-gradient | Low | `MagicCard.svelte` |
| **ShineBorder** | Pure CSS | CSS @keyframes animations | Very Low | `ShineBorder.svelte` |
| **StaggeredMenu** | Native Svelte | Svelte `fly` transition | Low | `StaggeredMenu.svelte` |

### Components Using External Libraries

| Component | Dependencies | Why External Library? | Complexity | File |
|-----------|--------------|----------------------|------------|------|
| **CardStackMotionFlip** | @humanspeak/svelte-motion | FLIP (First, Last, Invert, Play) layout animations are complex to implement manually. Library provides automatic position interpolation. | High | `CardStackMotionFlip.svelte` |
| **CardStackMotionSpring** | @humanspeak/svelte-motion | Advanced drag gestures with spring physics, constraints, and momentum. Complex state management benefits from library abstractions. | High | `CardStackMotionSpring.svelte` |

---

## Decision Criteria

### When to Use Zero Dependencies (Pure CSS/Native Svelte)

✅ **Use native approaches for:**
- Simple transitions (fade, slide, scale)
- CSS-based keyframe animations
- Mouse tracking with coordinate updates
- Basic hover/focus states
- List reordering (use native `animate:flip`)
- Value interpolation (use `Spring` or `Tween` classes)
- Micro-interactions

**Advantages:**
- Zero bundle impact
- Best performance (CSS runs off main thread)
- Easiest to understand and maintain
- No version compatibility issues
- Compile-time optimizations

### When to Use @humanspeak/svelte-motion

✅ **Use motion library for:**
- FLIP layout animations (automatic position tracking)
- Complex drag gestures with physics
- Spring configurations beyond simple cases
- Coordinated multi-element animations
- Advanced gesture handling (constraints, momentum, velocity)

**Advantages:**
- Pre-built, battle-tested implementations
- Complex physics already solved
- Consistent API for advanced features
- Gesture handling edge cases covered

---

## Implementation Details

### CardStack (Basic)
**Approach:** Pure CSS transitions
**Key Features:**
- Hover to preview
- Click to reveal
- Z-index stacking
- Transform: translateX(), translateY(), scale()

**Code Pattern:**
```svelte
<button
  style="transform: translate({x}px, {y}px); z-index: {z};"
  class="transition-all duration-300"
>
```

---

### CardStackAdvanced
**Approach:** Pure CSS + Event Handlers
**Key Features:**
- All features of basic CardStack
- Swipe gestures (touch events)
- Keyboard navigation (arrow keys)
- Accessibility (ARIA labels)

**Code Pattern:**
```svelte
onMount(() => {
  document.addEventListener('keydown', handleKeyDown);
  // Touch event handlers
});
```

---

### CardStackMotionFlip
**Approach:** @humanspeak/svelte-motion
**Dependencies:** `Motion` component, layout animations
**Key Features:**
- FLIP animations (automatic position transitions)
- 3D rotations
- Staggered timing
- Respects `prefers-reduced-motion`

**Code Pattern:**
```svelte
<motion.button
  layout
  transition={{
    layout: { duration: 0.6 },
    rotateY: { duration: 0.7, delay: index * 0.05 }
  }}
>
```

---

### CardStackMotionSpring
**Approach:** @humanspeak/svelte-motion
**Dependencies:** `Motion` component, drag gestures
**Key Features:**
- Draggable cards with physics
- Spring-based momentum
- Drag constraints
- Velocity tracking

**Code Pattern:**
```svelte
<motion.button
  drag="x"
  dragConstraints={{ left: -200, right: 200 }}
  dragElastic={0.2}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

---

### Marquee
**Approach:** Pure CSS @keyframes
**Key Features:**
- Infinite horizontal/vertical scroll
- Pause on hover
- Direction control
- Configurable speed

**Code Pattern:**
```svelte
<style>
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .animate { animation: marquee 20s linear infinite; }
</style>
```

---

### MarqueeDraggable
**Approach:** Native Svelte 5 Spring class
**Dependencies:** `svelte/motion` (built-in)
**Key Features:**
- Click and drag to control
- Spring physics for smooth animation
- Momentum on release
- Velocity-based direction change
- Infinite loop with modulo wrapping

**Code Pattern:**
```svelte
import { Spring } from 'svelte/motion';

const offsetSpring = new Spring(0, { stiffness: 300, damping: 30 });

function handlePointerMove(e: PointerEvent) {
  offsetSpring.target = dragStartOffset + deltaX;
}
```

**Why Native?**
The Svelte 5.8.0 `Spring` class provides the exact physics needed for smooth dragging. Using pointer events gives us full control over drag behavior, and the modulo wrapping creates seamless infinite scroll.

---

### MagicCard
**Approach:** Pure CSS + Svelte 5 $state runes
**Key Features:**
- Mouse-tracking spotlight effect
- Radial gradient follows cursor
- Smooth opacity transitions
- Theme support

**Code Pattern:**
```svelte
let mouseX = $state(-gradientSize);
let mouseY = $state(-gradientSize);

let bg = $derived(
  `radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent)`
);

<div style="background: {bg};" />
```

**Why Native?**
The effect only requires tracking mouse coordinates and updating a CSS property. No complex physics or timing needed.

---

### ShineBorder
**Approach:** Pure CSS @keyframes
**Key Features:**
- Animated border shine effect
- Customizable colors and speed
- Linear animation
- GPU-accelerated

**Code Pattern:**
```svelte
<style>
  @keyframes shine-border {
    from { background-position: 0% 0%; }
    to { background-position: 200% 0%; }
  }
</style>
```

---

### StaggeredMenu
**Approach:** Native Svelte `fly` transition
**Key Features:**
- Staggered item entrance
- Customizable delay per item
- Native transition system
- Accessibility support

**Code Pattern:**
```svelte
{#each items as item, index}
  <div in:fly={{ y: -10, duration: 300, delay: index * 50 }}>
    {item}
  </div>
{/each}
```

---

## Bundle Size Impact

| Dependency | Size | Used By | Status |
|------------|------|---------|--------|
| **svelte-motion** (old) | 670 kB | ❌ None | ✅ **REMOVED** |
| **@humanspeak/svelte-motion** | 408 kB | 2 components | ✅ Kept (justified) |
| **Native Svelte features** | 0 kB* | 7 components | ✅ Preferred |

*Native features are tree-shakeable and compile to optimized CSS

---

## Migration Notes

### From svelte-motion → Native Svelte 5

**MagicCard Migration:**
- ❌ `useMotionValue()` → ✅ `$state()`
- ❌ `useMotionTemplate` → ✅ `$derived()` with template literal
- ❌ `Motion` component → ✅ Regular `<div>` with inline styles

**MarqueeDraggable Migration:**
- ❌ `useMotionValue()` + `useSpring()` from svelte-motion → ✅ `new Spring()` from svelte/motion
- ❌ `Motion` component with drag props → ✅ Native pointer events
- ❌ Custom drag handlers → ✅ `onpointerdown`, `onpointermove`, `onpointerup`

### API Incompatibilities Found

**@humanspeak/svelte-motion vs svelte-motion:**
- ✅ Has: `motion` components, `useSpring`, `useTransform`, `useAnimationFrame`
- ❌ Missing: `useMotionValue`, `useMotionTemplate`, some API differences

**Result:** We migrated affected components to native Svelte 5 instead.

---

## Performance Characteristics

### Pure CSS Animations
- **Render:** Off main thread (GPU accelerated)
- **Frame Rate:** Consistent 60fps
- **Bundle:** 0 kB added
- **Best For:** Simple transitions, keyframes, transforms

### Native Svelte Transitions
- **Render:** Optimized by compiler
- **Frame Rate:** 60fps typical
- **Bundle:** Minimal (tree-shakeable)
- **Best For:** Enter/exit animations, coordinated transitions

### Native Svelte 5 Spring Class
- **Render:** JavaScript-driven with RAF
- **Frame Rate:** 60fps with proper implementation
- **Bundle:** Built-in to Svelte runtime
- **Best For:** Physics-based animations, spring effects, smooth interpolation

### @humanspeak/svelte-motion
- **Render:** JavaScript-driven
- **Frame Rate:** 60fps optimized
- **Bundle:** 408 kB
- **Best For:** Complex gestures, FLIP animations, advanced physics

---

## Testing Coverage

All components tested with:
- ✅ Svelte 5.16.1 compatibility
- ✅ TypeScript type checking
- ✅ Production build (Vite + Vercel adapter)
- ✅ Mobile touch events (where applicable)
- ✅ Keyboard navigation (where applicable)
- ✅ `prefers-reduced-motion` support (where applicable)

---

## Recommendations for New Components

1. **Start with native Svelte 5** - Use $state, $derived, $effect, and CSS
2. **Use built-in transitions** - `fly`, `fade`, `scale` from `svelte/transition`
3. **Try Spring/Tween classes** - For physics-based animations
4. **Only add @humanspeak/svelte-motion if:**
   - Implementing FLIP animations
   - Need complex drag gesture handling
   - Require advanced spring physics beyond Spring class
   - Coordinating many animated properties

---

## Version Information

- **Svelte:** 5.16.1
- **SvelteKit:** 2.15.5
- **@humanspeak/svelte-motion:** 0.1.12
- **Last Updated:** 2025-01-06

---

## Future Considerations

- **Evaluate Svelte 5 motion improvements** - Monitor new Spring/Tween APIs
- **Consider removing @humanspeak/svelte-motion** - If native features become powerful enough
- **Document prefers-reduced-motion** - Standardize across all components
- **Performance benchmarks** - Add FPS measurements for complex animations

---

*This matrix represents the state after Option A refactoring: Maximize Native implementations while keeping @humanspeak/svelte-motion only for components that genuinely benefit from it.*
