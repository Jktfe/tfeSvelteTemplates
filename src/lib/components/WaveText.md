# WaveText — Technical Logic Explainer

## What Does It Do? (Plain English)

WaveText sets a phrase on a smooth sine wave, so the letters rise and dip like a line of bunting. Hover over it, tab to it with the keyboard, or tap it, and a ripple flows through the letters as if someone flicked the rope. Two numbers — `amplitude` and `wavelength` — shape the whole thing.

**Think of it like:** writing on a skipping rope. Hold it still and you have wavy type; give it a shake and the wave travels along it.

---

## How It Works (Pseudo-Code)

```
state:
  phase    = 0        // radians — slides the crests sideways
  playing  = false    // bindable — is the ripple flowing?

derived:
  effectivePhase = reducedMotion ? (playing ? π : 0) : phase
  pathData       = buildWavePath(amplitude, wavelength, effectivePhase)

every animation frame (only if playing, on screen, motion allowed):
  phase = (phase + 2π × speed × dt) mod 2π      // dt clamped to 0.1s

render:
  <path id={unique} d={pathData} />
  <text text-anchor={align}>
    <textPath href="#unique" startOffset={align}>{text}</textPath>
  </text>

events (trigger = 'hover'):
  pointerenter (mouse / pen) → playing = true
  pointerleave               → playing = false (unless keyboard-focused)
  focus (focus-visible only) → playing = true
  blur                       → playing = false (unless still hovered)
  click / tap / Enter / Space → toggle (ignored while a mouse is hovering)
  Escape                     → playing = false

events (trigger = 'click'):
  click / tap / Enter / Space → toggle
  Escape                      → playing = false
```

---

## The Core Concept: Building the Wave

The path is generated, not hand-drawn. For every `x` across the 1200-unit viewBox:

```
y = centreY + amplitude × sin(2π × x / wavelength − phase)
```

```
 amplitude ┬      ╭──╮        ╭──╮        ╭──╮
           │    ╱      ╲    ╱      ╲    ╱      ╲
 centre ───┼──╱──────────╲╱──────────╲╱──────────╲──
           │
           └──────── wavelength ────────┘
```

- **amplitude** — how tall the crests are (SVG units).
- **wavelength** — distance between crests (SVG units).
- **phase** — shifts every crest sideways. Advancing it over time is what makes the ripple travel.

Points are sampled every `wavelength ÷ 24` units, giving a smooth curve with straight `L` segments. The step is floored at `1200 ÷ 600`, so a silly-small wavelength can never produce thousands of points. A non-positive wavelength draws a flat line instead of dividing by zero.

---

## Performance

- The requestAnimationFrame loop only exists while `playing` is true, the element is on screen (IntersectionObserver) and motion is allowed. An idle WaveText costs nothing per frame.
- Each frame rebuilds one path string of ~120 points — trivial work, and the browser only re-lays out the one `<textPath>`.
- The old version used `:global(svg)` and `:global(text)`, which restyled **every** SVG on the page. All styles are now scoped to `.wt-root` / `.wt-text`.

### Reduced motion

With `prefers-reduced-motion: reduce` there is no flowing ripple. Instead, toggling `playing` flips the wave by half a cycle (`phase = π`) in a single step, so the state change is still visible — the crests become troughs — without any movement.

### Theming tokens

| Token | Kind | Light | Dark |
|-------|------|-------|------|
| `--wave-text-fg` | chrome | `#111827` | `#f3f4f6` |
| `--wave-text-bg` | chrome | `transparent` | `transparent` |
| `--wave-text-focus-ring` | chrome | `#2563eb` | `#93c5fd` |
| `--wave-text-font` | type | `'Space Mono', monospace` | — |
| `--wave-text-size` | type | `32px` | — |
| `--wave-text-radius` | shape | `12px` | — |

---

## State Flow Diagram

```
                ┌───────────────────────┐
                │         STILL         │
                │    playing = false    │
                │   no animation frame  │
                └──────────┬────────────┘
                           │ hover (mouse) · focus-visible
                           │ click / tap / Enter / Space
                           ▼
                ┌───────────────────────┐
                │        FLOWING        │
                │    playing = true     │
                │  rAF advances phase   │──── reduced motion ───▶ FLIPPED
                └──────────┬────────────┘                         (phase = π,
                           │ pointerleave · blur                   no rAF)
                           │ click / tap / Enter / Space · Escape
                           ▼
                         STILL
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'WAVING TEXT'` | The phrase to render |
| `amplitude` | `number` | `20` | Wave height in SVG units |
| `wavelength` | `number` | `200` | Distance between crests in SVG units |
| `playing` | `boolean` (bindable) | `false` | Whether the ripple is flowing |
| `trigger` | `'hover' \| 'click' \| 'none'` | `'hover'` | Interaction model |
| `speed` | `number` | `0.5` | Wave cycles per second while flowing |
| `align` | `'start' \| 'middle' \| 'end'` | `'middle'` | Where the phrase sits along the wave |
| `height` | `number` | `220` | Container height in px |
| `label` | `string` | `text` | Accessible name override |
| `class` | `string` | `''` | Extra classes on the root element |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `wavelength <= 0` | Flat line — the text still renders |
| `amplitude = 0` | Flat line |
| Very small wavelength | Sample count capped at 600 points |
| Phrase longer than the wave | Glyphs past the path's end are clipped by SVG — shorten the text or lower `--wave-text-size` |
| `trigger="none"` | Decorative `role="img"`; control motion with `bind:playing` |
| Mouse hovering, then clicks | Click is ignored so the hover ripple keeps going |
| Touch device | Tap toggles the ripple |
| Tab hidden for a while | Frame delta clamped to 0.1s |
| `prefers-reduced-motion: reduce` | Half-cycle flip instead of animation |
| Many instances on one page | Unique `$props.id()` path ids — no cross-wiring |

---

## Dependencies

- **Zero external dependencies.**
- `$lib/types` — `WaveTextProps`, `PathTextTrigger`. Inline these if you copy the component elsewhere.
- Requires **Svelte 5.20+** for `$props.id()`.

---

## File Structure

```
src/lib/components/WaveText.svelte    # The component (+ exported pure helpers)
src/lib/components/WaveText.test.ts   # Path maths + rendered behaviour
src/lib/components/WaveText.md        # This explainer
src/routes/wavetext/+page.svelte      # Demo page (gallery + playground)
```
