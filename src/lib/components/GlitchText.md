# GlitchText — Technical Logic Explainer

## What Does It Do? (Plain English)

GlitchText fakes the chromatic-aberration RGB-channel separation and tear-banding you see on glitchy CRTs, broken VHS tapes, or bad satellite feeds. The underlying text node is unchanged — two CSS pseudo-element ghost layers drift cyan and magenta either side of the glyph centres, while an occasional clipped horizontal "tear" band slices through and shoves part of the line sideways.

Three intensity profiles (`subtle`, `moderate`, `wild`) and three triggers (`auto`, `hover`, `viewport`) cover most scenes. Asset-free — no images, no SVG, no shader. Just CSS pseudo-elements, `clip-path`, and a small rAF loop driving deterministic pseudo-random offsets.

## How It Works (Pseudo-Code)

```
state:
  active            = false
  dxCyan, dyCyan    = current cyan ghost offset (px)
  dxMagenta, dyMag  = current magenta ghost offset (px)
  tearTop, tearHeight, tearDx, tearVisible = tear-band parameters

derive:
  cfg = pickIntensity(intensity)    // { offsetMax, tearMs, jitterMs, opacity }

helpers (pure, exported):
  pseudoRand(seed, salt) → 0..1     // deterministic Math.sin hash
  jitterOffset(cfg, seed)  → { dx, dy }   ∈ [-offsetMax, +offsetMax]
  tearBand(cfg, seed)      → { top%, height%, dx } for the clip-path slice
  scheduleNextTear(cfg, now) → ms until next tear

start():
  if isReducedMotion: bail
  active = true
  rAF loop tickJitter:
    seed = floor(now / 80)
    a = jitterOffset(cfg, seed)
    b = jitterOffset(cfg, seed + 7)
    dxCyan = a.dx; dyCyan = a.dy
    dxMagenta = -b.dx; dyMagenta = -b.dy   // mirrored = real chromatic aberration
    rAF(tickJitter)
  scheduleTear():
    setTimeout(after scheduleNextTear ms):
      seed = floor(performance.now())
      band = tearBand(cfg, seed)
      tearTop, tearHeight, tearDx = band.*
      tearVisible = true
      setTimeout(after cfg.tearMs):
        tearVisible = false
        if active: scheduleTear()

trigger gating:
  'auto':     start() onMount
  'hover':    start() on mouseenter / focusin; stop() on mouseleave / focusout
  'viewport': IntersectionObserver → start() on first intersection, then disconnect

stop():
  active = false
  cancelAnimationFrame; clearTimeout × 2
  reset all offsets to 0; tearVisible = false
```

## The Core Concept: Pseudo-Random Jitter at 60 fps

The RGB channels need to look "alive" — pure random would feel fizzy and uniform. The component uses a `Math.sin` hash for **deterministic** pseudo-random offsets:

```js
function pseudoRand(seed, salt) {
  const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}
```

Each rAF tick takes `seed = floor(now / 80)` so the seed only advances every ~80ms — that gives the eye time to register each offset before it moves. Without the divisor the offsets would change every frame at 60 Hz and look like noise rather than a glitch.

Cyan and magenta use the **same** seed but different salts (`1, 2` for cyan, `1, 2` shifted by `+7` for magenta), then magenta is **negated**. The mirror is what makes it look like real chromatic aberration: when the cyan ghost drifts up-left, the magenta drifts down-right, and the original glyph sits between them.

```
       ┌───────────┐
       │  cyan     │   transform: translate(+dx, +dy)
       │     ┌─────┴───┐
       │     │ ORIGIN  │   real text node (z-index: 2)
       └─────┤         │
             │     ┌───┴───────┐
             └─────┤ magenta   │   transform: translate(-dx, -dy)
                   └───────────┘
```

The tear band is independent: every `~jitterMs` (with random jitter ±50%) the component samples a band — top in 0–80% of the line height, height 5–30%, horizontal shift up to `4× offsetMax`. A fresh `<span>` with that text and a `clip-path: inset(top% 0 (100% - top% - height%) 0)` renders only the slice, translated sideways. After `tearMs` (80–200ms depending on intensity) the band hides and the next one is scheduled.

```
  Tear band on a 4-line headline:

  Lorem ipsum dolor sit amet
  consectetur adipiscing elit  ← ░░░ entire band shifted +dxpx
  ───────────────────────────
  sed do eiusmod tempor incididunt
  ut labore et dolore magna aliqua.
```

## CSS Animation Strategy

The cyan and magenta ghosts are **CSS pseudo-elements** (`::before`, `::after`) on the inner `.glitch-base` span. Their content comes from `attr(data-text)` — so they always carry the right glyphs, no JS sync needed. Their colour is set via custom properties `--glitch-cyan` and `--glitch-magenta` (themable), and their position via `transform: translate(var(--cyan-dx), var(--cyan-dy))`. A `mix-blend-mode: difference` on the tear-band span makes the slice look like a real channel inversion rather than a flat overlay.

The rAF loop only writes inline CSS custom properties on the host element. Browsers paint at their own pace; the inline-style assignment is cheap and we intentionally throttle the seed advance to ~80ms so we don't fight the compositor.

```css
.glitch.active .glitch-base::before {
  content: attr(data-text);
  color: var(--glitch-cyan);
  transform: translate(var(--cyan-dx, 0), var(--cyan-dy, 0));
  opacity: var(--clone-opacity, 0.65);
}
@media (prefers-reduced-motion: reduce) {
  .glitch.active .glitch-base::before,
  .glitch.active .glitch-base::after,
  .glitch-tear { display: none; }
}
```

## Performance

- One rAF loop while `active`. Cancelled on `stop()` and on unmount.
- Two `setTimeout` chains (tear-show, tear-hide) — never more than two outstanding.
- Inline-style writes are a handful of CSS custom properties on a single span; modern engines diff these in microseconds.
- `'viewport'` trigger uses `IntersectionObserver` and disconnects after the first intersection — the component is dormant until visible, then fires once.
- Reduced-motion users never enter `start()`; the component renders the static base text with no jitter and the pseudo-elements stay invisible.

## State Flow Diagram

```
                trigger: 'auto'
  [mounted] ───────────────────────────────▶ [active]
       │                                          │
       │ trigger: 'hover'                         │ rAF tick → jitter offsets
       │                                          │ setTimeout → tear band cycle
       │   on mouseenter / focusin                │
       │   on mouseleave / focusout ──────┐       │
       │                                  ▼       │
       │ trigger: 'viewport'         [inactive]   │
       │   first IntersectionObserver entry       │
       │     ──────────────────────────▶ [active] │
       │                                          │
       └─────────────────────────────────────────┤
                                                  │
                              prefers-reduced-motion
                                                  ▼
                                            [inactive]
                                            ghosts hidden
                                            tear hidden
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text content (read by assistive tech as-is). |
| `intensity` | `'subtle' \| 'moderate' \| 'wild'` | `'moderate'` | Effect amplitude — controls offset magnitude, tear duration, jitter rate, and clone opacity. |
| `trigger` | `'auto' \| 'hover' \| 'viewport'` | `'auto'` | When the effect starts (mount, hover/focus, or first viewport entry). |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User has `prefers-reduced-motion: reduce` | `start()` bails immediately; `@media` rule hides pseudo-elements and tear span — pure static text. |
| `'viewport'` trigger and `IntersectionObserver` unsupported | Component falls back to `start()` onMount, never observing visibility. |
| `'hover'` trigger with keyboard navigation | `focusin`/`focusout` mirror the mouse handlers, so Tab focus also activates the effect. |
| Component unmounts while active | `onDestroy` runs `stop()` (cancels rAF, clears both timeouts) and `observer?.disconnect()`. |
| Unknown `intensity` string passed in | `pickIntensity` falls back to `'moderate'`. |
| Theming via `body .glitch.glitch { --glitch-cyan: #... }` | Doubled-class trick wins specificity over the component's own scoped declaration; see comments in source. |
| Empty `text` prop | Empty span renders; ghosts have no `attr(data-text)` so they paint nothing. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `onMount`, `onDestroy` for lifecycle.
- **`IntersectionObserver`** (native) — used only for `trigger="viewport"`; component falls back to immediate start when missing.
- Zero external dependencies otherwise — pure CSS pseudo-elements + `clip-path` + rAF loop.

## File Structure

```
src/lib/components/GlitchText.svelte   # implementation
src/lib/components/GlitchText.md       # this file (rendered inside ComponentPageShell)
src/lib/components/GlitchText.test.ts  # vitest unit tests for the pure helpers
src/routes/glitchtext/+page.svelte     # demo page
```
