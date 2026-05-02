# NeonSign — Technical Logic Explainer

## What Does It Do? (Plain English)

NeonSign renders a string of text as a glowing neon tube — a hard white inner core surrounded by saturated coloured haze, occasionally twitching the way real-world neon does. You can mark specific characters as "burnt out" (so `NO VACANCY` can have the `NO` dimmed), toggle a power state on or off, and choose between subtle real-world twitch and an aggressive dying-tube flicker.

Think of it as the late-night diner sign in every noir film — except instead of a dozen layers of Photoshop blur, it's a single CSS `text-shadow` stack with five carefully-tuned blur radii.

## How It Works (Pseudo-Code)

```
state:
  value     = string                  // text to render
  colour    = 'pink' | 'cyan' | 'yellow' | 'green' | 'red' | 'purple'
  intensity = 1                        // multiplier on shadow blur radii
  flicker   = 'none' | 'subtle' | 'broken'
  broken    = [int, ...]               // character indices to dim
  on        = true                     // power state
  seed      = 7                        // for deterministic flicker phase

derive:
  palette       = pickPalette(colour) ?? PALETTES.pink
  shadowStack   = buildShadowStack(palette, intensity)
                = "0 0 (2*i)px white,
                   0 0 (4*i)px palette.glow,
                   0 0 (8*i)px palette.glow,
                   0 0 (16*i)px palette.halo,
                   0 0 (32*i)px palette.halo"
  mask          = brokenMask(value, broken)        // boolean[] per char
  chars         = value.split('')
  animationName = flicker === 'none'
                    ? 'none'
                    : `neon-flicker-${flicker}`
  animationDelay = flicker === 'none'
                    ? '0s'
                    : `-${(abs(seed) % 600) / 100}s`
                    // negative delay → starts mid-cycle, phase-shifted by seed

render:
  span.neon-root role="img" aria-label={value}
                 class={ on ? 'neon-on' : 'neon-off' }
                 style: --neon-glow, --neon-halo, --neon-dim,
                        --neon-shadow, --neon-anim, --neon-delay
    for each char, idx:
      span.neon-char aria-hidden
                    class={ mask[idx] ? 'neon-broken' : '' }

CSS:
  .neon-char {
    text-shadow: var(--neon-shadow);
    animation-name:     var(--neon-anim);
    animation-duration: 6s;
    animation-delay:    var(--neon-delay);
    animation-timing-function: steps(40, end);
  }
  .neon-broken { text-shadow: faint; animation: none; opacity: 0.85 }
  .neon-off .neon-char { /* same as broken */ }
```

After the inline styles are written, the GPU handles every frame. There is no `requestAnimationFrame`, no canvas, no SVG. The only "JavaScript" cost is the deterministic LCG inside `flickerSchedule` — and that runs once per render, not per frame.

## The Core Concept: Five-Layer Text-Shadow Stack

The whole illusion lives in one CSS property:

```css
.neon-char {
  text-shadow:
    0 0  2px #fff,                              /* hard white core      */
    0 0  4px #ff3aa9,                           /* inner saturated tube */
    0 0  8px #ff3aa9,                           /* outer saturated tube */
    0 0 16px rgba(255, 58, 169, 0.55),          /* inner atmospheric haze */
    0 0 32px rgba(255, 58, 169, 0.55);          /* outer atmospheric haze */
}
```

Five blur stops at exponentially-increasing radii (2 → 4 → 8 → 16 → 32). The brain reads this as a real glowing object because that's exactly how light scatters off a glass tube into surrounding air — bright sharp core, saturated mid-band, soft atmospheric falloff.

`buildShadowStack` builds this string at render time, scaling each radius by the `intensity` multiplier:

```ts
return [
  `0 0 ${(2 * i).toFixed(2)}px #fff`,
  `0 0 ${(4 * i).toFixed(2)}px ${palette.glow}`,
  `0 0 ${(8 * i).toFixed(2)}px ${palette.glow}`,
  `0 0 ${(16 * i).toFixed(2)}px ${palette.halo}`,
  `0 0 ${(32 * i).toFixed(2)}px ${palette.halo}`
].join(', ');
```

Why no blur filter? `filter: blur()` blurs the *whole element including its background*; on a coloured background the text would smear into the surroundings instead of glowing. `text-shadow` blurs only the projected shadow of the glyphs — the glyphs themselves stay sharp, which is critical for legibility.

### Deterministic flicker via seeded LCG

Real neon twitches because of voltage instabilities; the visual is sub-second drops in luminance. The component models this with two static keyframe blocks:

```css
@keyframes neon-flicker-subtle {
  0%, 12%, 13%, 100% { opacity: 1; }
  12.5%              { opacity: 0.78; }
  47%, 48%           { opacity: 1; }
  47.5%              { opacity: 0.86; }
}
@keyframes neon-flicker-broken {
  0%, 100% { opacity: 1; }
  7%       { opacity: 0.36; }
  7.4%     { opacity: 1; }
  18%      { opacity: 0.22; }
  /* ... 6 deep dips total */
}
```

Two profiles, both static: `subtle` has 2 shallow ~0.8 dips, `broken` has 6 deep ~0.2-0.5 dips. Per-sign uniqueness comes from a **negative `animation-delay`** computed from the seed: `-${(abs(seed) % 600) / 100}s`. With a 6 s cycle, the negative delay phase-shifts the animation by 0–6 s, so two signs with different seeds light up at different points in the dip schedule even though they share the same keyframe.

The exported `flickerSchedule(seed, profile)` function — used by tests and advanced consumers — generates a *different* style of schedule: a deterministic LCG-based dip table with random opacity values per dip. The runtime CSS uses the static keyframes for cheapness; consumers who want generated keyframes can build them from `flickerSchedule`.

`steps(40, end)` timing function discretises the animation into 40 frames per cycle — the dip transitions snap rather than ease, which reads more like an electrical fault than a smooth dimmer.

### Burnt-out characters

`brokenMask(value, broken)` produces a boolean array where each `true` index renders the character with the dim palette colour and disables its animation:

```css
.neon-broken {
  color: var(--neon-dim);
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.06),
               0 0 4px rgba(0, 0, 0, 0.5);
  animation: none;
  opacity: 0.85;
}
```

The dim shade is a deeply darkened version of the palette colour (e.g. pink's `#3a1a2a`), so the character is still faintly visible — it reads as "this tube exists but is unlit", not "this character is missing".

`on={false}` applies the same treatment to *every* character via `.neon-off .neon-char`, with no extra DOM changes.

## CSS Animation Strategy

Three independent layers cooperate:

1. **The shadow stack** is static — written once into `--neon-shadow` and never touched. The `transition: text-shadow 220ms ease` on `.neon-char` smooths the moment when `intensity` or `colour` props change at runtime.
2. **The flicker keyframe** is one of three static rules (`subtle`, `broken`, or none). The component picks the rule by setting `--neon-anim` to its name, and phase-shifts it via `--neon-delay`.
3. **The broken/off override** disables the animation for affected characters and applies a darker, much lower-blur shadow stack so the dim shade reads as "off" not "fading".

`prefers-reduced-motion: reduce` is honoured by a single CSS rule:

```css
@media (prefers-reduced-motion: reduce) {
  .neon-char { animation: none; }
}
```

The static glow remains, so the sign still looks lit — only the flicker stops.

## Performance

- **Zero JS per frame.** All animation is CSS keyframes.
- **One DOM node per character** (`<span class="neon-char">`). For a 10-character sign that's 10 nodes plus the wrapper.
- **`text-shadow` with 5 blur stops is the most expensive part.** Each stop is a separate compositor pass; on low-end mobile a 50-character sign at high intensity can saturate the GPU. Drop `intensity` to ~0.6 or shrink the sign to mitigate.
- **Two static `@keyframes` rules** are reused across all instances on the page; per-sign uniqueness comes from the negative `animation-delay`, not from generated keyframes.
- **No measurement, no observers, no rAF.** The component is a pure function of its props.

## State Flow Diagram

```
                  ┌─────────────────────────────┐
                  │  render with on=true        │
                  │  flicker=subtle (default)   │
                  └────────────┬────────────────┘
                               │ mount (no JS work)
                               ▼
                  ┌─────────────────────────────┐
                  │  flickering                 │
                  │  CSS keyframe runs per-char │
                  │  phase-shifted by seed      │
                  └────────────┬────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
              │ broken=[i,...] │ on=false        │ flicker='none'
              ▼                ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ partial      │  │ off          │  │ steady       │
      │ flicker      │  │ all chars    │  │ no anim;     │
      │ + dim chars  │  │ dim;         │  │ static glow  │
      │ at indices   │  │ no anim      │  │              │
      └──────────────┘  └──────────────┘  └──────────────┘

  prefers-reduced-motion: reduce ──► CSS @media kills animation
                                     (static glow remains)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Text to render. Each character becomes its own `<span>` for per-character flicker / break control. |
| `colour` | `'pink' \| 'cyan' \| 'yellow' \| 'green' \| 'red' \| 'purple'` | `'pink'` | Palette name. Unknown values fall back to `pink`. |
| `intensity` | `number` | `1` | Multiplier on the shadow blur radii. `0` collapses the glow; values up to ~2 still composite cleanly. |
| `flicker` | `'none' \| 'subtle' \| 'broken'` | `'subtle'` | Flicker profile. `none` is steady, `subtle` is real-world twitch, `broken` is a dying tube. |
| `broken` | `number[]` | `[]` | Character indices to render dim. Out-of-range and non-integer indices are silently ignored. |
| `on` | `boolean` | `true` | Power state. `false` collapses every character to the dim shade and disables the flicker. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Type-scale size class (`sm` = 1.75rem, `md` = 3rem, `lg` = 5rem). |
| `seed` | `number` | `7` | Phase-shifts the flicker animation. Same seed → same paint. |
| `class` | `string` | `''` | Extra classes on the root `<span>`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Unknown palette name | `pickPalette` falls back to `pink`. |
| `value` is empty string | Wrapper renders with `aria-label=""`; no character spans. Visually empty. |
| `value` contains emoji or surrogate pairs | `value.split('')` splits by UTF-16 code units, so emoji pairs split into two glyphs. For emoji-heavy text, swap to `Array.from(value)` if you fork the component. |
| `broken={[100]}` on a 10-char value | `brokenMask` ignores out-of-range indices; sign renders normally. |
| `broken=[0.5]` (non-integer) | Ignored — `Number.isInteger` filters it. |
| `intensity` = 0 | Shadow radii become 0; characters render as plain white text on `.neon-on`, plain dim text on `.neon-off`. |
| `intensity` = `Infinity` / `NaN` | `Math.max(0, intensity)` returns `Infinity` / `NaN`; CSS treats those as invalid and the shadow drops out. The white character colour remains. |
| `prefers-reduced-motion: reduce` | CSS `@media` kills the animation; static glow remains. |
| Component scrolled offscreen | Browser throttles the layer's compositor work. No JS to pause. |
| Hi-DPI / retina | `text-shadow` is resolution-independent; the glow scales correctly. |
| Multiple instances on one page | Same-seed instances flicker in lockstep (intentional — same visual identity); different seeds phase-shift via `animation-delay`. |
| `seed` = 0 / negative | `Math.abs(seed) % 600` handles both; phase-shift collapses to 0 s for `seed=0`. |
| Component used inside a `<button>` | Works fine; `role="img"` is valid inside interactive elements. The `aria-label` on the sign reads first. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`. Module-script exports (`pickPalette`, `buildShadowStack`, `flickerSchedule`, `brokenMask`, `isReducedMotion`) for unit testing.
- Zero external dependencies — no font CDN, no SVG, no canvas, no animation library.

## File Structure

```
src/lib/components/NeonSign.svelte         # implementation + module-level helpers
src/lib/components/NeonSign.md             # this file (rendered inside ComponentPageShell)
src/lib/components/NeonSign.test.ts        # vitest unit tests
src/routes/neonsign/+page.svelte           # demo page
```
