# Marquee - Technical Logic Explainer

## What Does It Do? (Plain English)

Marquee creates an endlessly scrolling carousel of content. Think of a news ticker at the bottom of a TV screen, or those scrolling logo displays on company websites. Content smoothly glides across the screen and seamlessly loops back around.

**Think of it like:** A conveyor belt at a sushi restaurant - items keep moving past you in an endless loop!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. RENDER the container with overflow: hidden
  2. DUPLICATE content `repeat` times (default: 4 copies)
  3. APPLY CSS animation to each copy
  4. Animation moves content across its width, then snaps back

THE INFINITE LOOP TRICK:
  - Multiple copies create the illusion of endless content
  - When copy 1 exits left, copy 2 is already in view
  - Animation duration covers the full width
  - Seamless because copies are identical

WHEN pauseOnHover is true:
  - CSS pauses animation on :hover
  - Content freezes in place
  - Resumes when mouse leaves
```

---

## The Infinite Loop Trick (Visual)

```
Container (overflow: hidden - only shows this window)
┌─────────────────────────────────────┐
│  [A][B][C]  [A][B][C]  [A][B][C]    │ ← Multiple identical copies
└─────────────────────────────────────┘
       ↑
       Visible area

Animation moves everything left:
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←

When copy 1 exits left, copy 2 takes its place:
┌─────────────────────────────────────┐
│    [A][B][C]  [A][B][C]  [A][B][C]  │
└─────────────────────────────────────┘
         ↑
         Seamless transition!
```

---

## CSS Animation Strategy

The animation is defined in `tailwind.config.js`:

```javascript
// Animation moves content 100% of its width to the left
animation: {
  marquee: 'marquee var(--duration) linear infinite',
  'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
},
keyframes: {
  marquee: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(calc(-100% - var(--gap)))' },
  },
  'marquee-vertical': {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(calc(-100% - var(--gap)))' },
  },
},
```

**Key points:**
- `linear` timing = constant speed (no acceleration)
- `infinite` = loops forever
- `-100%` moves exactly one content width
- Gap subtracted to account for spacing

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pauseOnHover` | `boolean` | `false` | Pause animation on mouse hover |
| `vertical` | `boolean` | `false` | Scroll vertically instead of horizontally |
| `repeat` | `number` | `4` | Number of content copies (more = smoother) |
| `reverse` | `boolean` | `false` | Reverse scroll direction |
| `duration` | `number` | `40` | Seconds for one complete cycle |
| `class` | `string` | `''` | Additional CSS classes |
| `children` | `Snippet` | - | Content to scroll |

---

## Why Multiple Copies?

```
repeat=1 (BAD):
┌─────────┐
│[A][B][C]│    [gap]    [A][B][C] (animation restarts - visible jump!)
└─────────┘

repeat=4 (GOOD):
┌─────────┐
│[A][B][C]│[A][B][C][A][B][C][A][B][C] (always content in view)
└─────────┘
```

With more copies, there's always content visible during the transition. 4 is a good default that works for most content widths.

---

## Pause on Hover

```css
/* Tailwind class: group-hover:[animation-play-state:paused] */

.group:hover .animate-marquee {
  animation-play-state: paused;
}
```

The `group` class on the container enables group-hover targeting on children.

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Screen readers | `role="region"` with `aria-label` |
| Reduced motion | Tailwind's `motion-reduce:` variants can be applied |
| Keyboard | Content is focusable within the marquee |

---

## Performance Considerations

- **GPU acceleration** - CSS transforms use the compositor thread
- **No JavaScript animation** - pure CSS for 60fps smoothness
- **Will-change** - browser can optimise for transform animations
- **Overflow hidden** - only renders visible content

---

## Common Patterns

### Logo Carousel
```svelte
<Marquee duration={30} pauseOnHover={true}>
  <img src="/logo1.svg" alt="Partner 1" />
  <img src="/logo2.svg" alt="Partner 2" />
  <img src="/logo3.svg" alt="Partner 3" />
</Marquee>
```

### Testimonial Ticker
```svelte
<Marquee duration={60} repeat={2}>
  {#each testimonials as t}
    <div class="testimonial-card">{t.text}</div>
  {/each}
</Marquee>
```

### Vertical News Feed
```svelte
<Marquee vertical={true} duration={20}>
  {#each headlines as h}
    <p>{h.title}</p>
  {/each}
</Marquee>
```

---

## Dependencies

- **$lib/utils** (cn helper for class merging)
- **TailwindCSS** (utility classes + custom animation)
- **Zero external dependencies**

---

## File Structure

```
Marquee.svelte      # The component
Marquee.test.ts     # Unit tests
Marquee.md          # This explainer
```

---

*Last updated: 26 December 2025*
