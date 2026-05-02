# ScratchToReveal — Technical Logic Explainer

## What Does It Do? (Plain English)

ScratchToReveal puts a grey (or image, or coloured) coating over any content. Drag your finger or mouse across the coating and the pixels under your touch disappear, revealing the content underneath — exactly like a real lottery scratch card. Once you've cleared roughly 70% of the coating, the rest disappears automatically and a `onReveal` callback fires.

Think of a silver scratch panel on a physical card: drag, scrape, peek, win. The coating is a `<canvas>`, the content is regular DOM, and the "scraping" is real-time pixel erasure.

## How It Works (Pseudo-Code)

```
state:
  isScratching     = false
  isFullyRevealed  = false
  scratchPercentage = 0
  ctx              = canvas 2D context
  rafId            = pending RAF handle

on mount:
  measure container width/height (or use explicit width/height props)
  size canvas: physical = logical × devicePixelRatio
  ctx.scale(dpr, dpr)
  draw coating: solid colour OR image, with optional overlay text

events:
  on pointerdown(e):
    if disabled or isFullyRevealed: return
    isScratching = true
    canvas.setPointerCapture(e.pointerId)            // keep events even if cursor leaves canvas
    erase brush at (e.x, e.y) relative to canvas

  on pointermove(e):
    if not isScratching: return
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => erase brush at (e.x, e.y))

  on pointerup(e) / pointercancel(e):
    isScratching = false
    canvas.releasePointerCapture(e.pointerId)
    sample alpha pixels (every 4th) → scratchPercentage
    onProgress?.(scratchPercentage)
    if autoReveal AND scratchPercentage ≥ revealThreshold:
      ctx.clearRect(...)                              // wipe the rest
      isFullyRevealed = true
      onReveal?.()

  on Skip button click / Space / Enter:
    ctx.clearRect(...)
    isFullyRevealed = true
    onReveal?.()

  on Reset button click / R key:
    isFullyRevealed = false
    redraw coating from scratch

erase brush at (x, y):
  ctx.globalCompositeOperation = 'destination-out'
  if brushShape === 'circle':
    ctx.beginPath(); ctx.arc(x, y, brushSize / 2, 0, 2π); ctx.fill()
  else:
    ctx.fillRect(x − brushSize/2, y − brushSize/2, brushSize, brushSize)
```

The clever bit is `globalCompositeOperation = 'destination-out'`: anything you draw under that mode *removes* the corresponding pixels from the canvas instead of painting over them. The coating is being erased, not over-painted, so the canvas itself becomes transparent and the DOM behind shows through.

## The Core Concept: destination-out Compositing

Canvas 2D supports multiple compositing modes via `globalCompositeOperation`. The default is `'source-over'` — new pixels paint on top of existing ones. `'destination-out'` flips the relationship: new pixels punch a hole in what's already there, leaving transparency.

```
ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
ctx.fill();
// The circle drawn at (x, y) is now a transparent hole in the coating.
// The DOM beneath the canvas is visible through the hole.
```

```
Before scratching                     After scratching
┌──────────────────────┐              ┌──────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│              │▓▓▓▓▓▓░░░░░░░▓▓▓▓▓▓▓▓│
│▓▓▓▓SCRATCH HERE!▓▓▓▓▓│      →       │▓▓▓░░░░░░░░░░░▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│              │▓▓░░PRIZE INSIDE░░▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│              │▓▓▓░░░░░░░░░░░▓▓▓▓▓▓▓│
└──────────────────────┘              └──────────────────────┘
   Opaque coating                     Transparent holes show DOM
   (canvas pixels)                    underneath
```

`destination-out` keeps the entire image intact except where you draw, which is why partial scratching looks naturally jagged rather than a clean rectangle of removed coating.

## Progress Calculation: Pixel Sampling

To decide when to auto-reveal, the component reads back the canvas's pixel buffer and counts transparent pixels. The full pixel array is `width × height × 4` bytes (RGBA per pixel) — for a 600 × 800 canvas at 2× DPR that's nearly 4 million entries. Reading every byte every frame is too expensive, so the component samples.

```
function updateProgress():
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  pixels = imageData.data                  // [R,G,B,A, R,G,B,A, ...]

  sampleRate = 4                           // check every 4th pixel
  transparentCount = 0
  totalSamples = 0

  for i = 0; i < pixels.length; i += 4 × sampleRate:
    totalSamples++
    if pixels[i + 3] === 0:                // alpha channel
      transparentCount++

  scratchPercentage = (transparentCount / totalSamples) × 100
```

Two performance moves:

1. **Sampling.** Every 4th pixel is good enough — the error margin is well under 1% on real scratch patterns, and the loop is 16× faster than the naïve version.
2. **Only on `pointerup`.** Sampling never runs while the user is actively scratching. The cost is paid once, when the gesture ends.

The canvas is created with `getContext('2d', { willReadFrequently: true })`, which hints to the browser that `getImageData` will be called and asks for a software-backed buffer rather than a GPU texture (GPU readback is slow). Without the hint, sampling can stutter on first call.

## Retina / HiDPI Support

Canvas has two coordinate systems: physical pixels (the actual buffer) and logical pixels (CSS layout). On a Retina display, one CSS pixel maps to four physical pixels, and a naïvely-sized canvas looks blurry.

```
dpr = window.devicePixelRatio || 1     // 2 on Retina, 3 on some phones

canvas.width  = logicalWidth  * dpr     // physical buffer
canvas.height = logicalHeight * dpr
canvas.style.width  = `${logicalWidth}px`   // CSS layout
canvas.style.height = `${logicalHeight}px`

ctx.scale(dpr, dpr)                     // now 1 unit = 1 CSS pixel
```

After `ctx.scale(dpr, dpr)`, every drawing call is expressed in CSS pixels — a brush of `brushSize: 40` is a 40 × 40 CSS-pixel blob, but the underlying buffer paints 80 × 80 physical pixels on Retina. Crisp edges, no maths in the rest of the codebase.

## Pointer Events: Unified Input

Mouse, touch, and stylus all fire the same Pointer Events, so one set of handlers covers every input type:

```
onpointerdown
onpointermove
onpointerup
onpointercancel    // phone call, browser context menu, OS interruption
```

`canvas.setPointerCapture(pointerId)` is the move that makes scratching feel right. Without it, a user dragging too fast and crossing the canvas boundary would have the events go to whatever they drag over — typically the body — and scratching would stop mid-stroke. Pointer capture redirects all events from that pointer back to the canvas until `releasePointerCapture` is called or the pointer is lifted.

CSS `touch-action: none` on the canvas blocks the browser's default scroll/zoom gestures, so a vertical swipe inside a scratch card scratches instead of scrolling the page.

## State Flow Diagram

```
                ┌─────────────────────────┐
                │  IDLE (coating intact)  │
                │  isScratching=false     │
                │  isFullyRevealed=false  │
                └────────────┬────────────┘
                             │
                pointerdown ▼
                ┌─────────────────────────┐
                │  SCRATCHING             │
                │  isScratching=true      │
                │  pointer captured       │
                │  destination-out        │
                │  erasure each rAF tick  │
                └────────────┬────────────┘
                             │
                 pointerup  ▼
                ┌─────────────────────────┐
                │  SAMPLING               │
                │  read pixel buffer      │
                │  → scratchPercentage    │
                │  → onProgress?.()       │
                └────────────┬────────────┘
                             │
              percentage ≥ threshold AND autoReveal
                             ▼
                ┌─────────────────────────┐
                │  REVEALED               │
                │  ctx.clearRect()        │
                │  isFullyRevealed=true   │
                │  onReveal?.()           │
                └────────────┬────────────┘
                             │
                  Reset / R ▼
                ┌─────────────────────────┐
                │  redraw coating         │
                │  → IDLE                 │
                └─────────────────────────┘

   Skip / Space / Enter at any non-revealed state ──▶ direct to REVEALED
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scratchColor` | `string` | `'#999999'` | Solid colour for the coating. Ignored when `scratchImage` is set. |
| `scratchImage` | `string` | — | Image URL drawn as the coating. Replaces `scratchColor`. |
| `scratchText` | `string` | — | Optional overlay text painted on the coating (e.g. "SCRATCH HERE!"). |
| `scratchTextColor` | `string` | `'#ffffff'` | Colour of the overlay text. |
| `scratchTextSize` | `string` | `'24px'` | CSS font-size of the overlay text. |
| `revealThreshold` | `number` | `70` | Percentage of pixels cleared before auto-reveal fires. |
| `autoReveal` | `boolean` | `true` | When false, the user must scratch the entire surface manually. |
| `brushSize` | `number` | `40` | Brush diameter in CSS pixels. |
| `brushShape` | `'circle' \| 'square'` | `'circle'` | Brush shape — circle is softer, square is faster to clear. |
| `width` | `number \| 'auto'` | `'auto'` | Canvas width. `'auto'` measures the parent on mount. |
| `height` | `number \| 'auto'` | `'auto'` | Canvas height. `'auto'` measures the parent on mount. |
| `showProgress` | `boolean` | `false` | Render a progress bar reflecting `scratchPercentage`. |
| `progressColor` | `string` | `'#3b82f6'` | Progress bar fill colour. |
| `allowReset` | `boolean` | `true` | Show the Reset button after the reveal. |
| `resetButtonText` | `string` | `'Reset'` | Label for the Reset button. |
| `skipText` | `string` | `'Skip'` | Label for the Skip button. Pass `null` to hide it. |
| `onReveal` | `() => void` | — | Fires once when the surface is fully cleared. |
| `onProgress` | `(percentage: number) => void` | — | Fires after each `pointerup` with the latest scratch percentage. |
| `disabled` | `boolean` | `false` | Disables scratching entirely; cursor changes to indicate. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | required | The content revealed beneath the coating. |

### Keyboard

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Skip — clear the coating immediately. |
| `R` | Reset (only when fully revealed and `allowReset` is true). |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User scratches a tiny area then releases | `pointerup` samples the buffer; `scratchPercentage` rounds to ≈1–5%; `onProgress` fires; coating stays. |
| Pointer leaves the canvas mid-stroke | Pointer capture keeps events flowing to the canvas. The brush continues to follow the cursor / finger correctly. |
| User has `prefers-reduced-motion: reduce` | The reveal-complete fade is replaced with an instant cut. The scratching itself is unaffected — it's a direct manipulation, not an animation. |
| `width: 'auto'` on a parent with no measured width | The mount measurement reads 0 and the canvas renders empty. Set an explicit `width` or ensure the parent has a known size before the component mounts. |
| `disabled={true}` after partial scratching | Already-erased pixels stay cleared. New `pointerdown` events are ignored; cursor switches to `not-allowed`. |
| Rapid scratching at 120 Hz (high-refresh display) | RAF coalesces brush draws to one per frame. The visual is smooth; the underlying buffer doesn't accumulate redundant work. |
| User triggers a phone call mid-scratch | `pointercancel` fires; `isScratching` flips to false; pointer capture released. State is consistent — no orphan brush. |
| `scratchImage` URL fails to load | The canvas falls back to `scratchColor` (so a partial coating is still drawn). |

## Dependencies

- **Svelte 5.x** — `$state`, `$effect`, `$props`, snippets, and `bind:this` for the canvas reference.
- Zero external dependencies — pure HTML5 Canvas API for compositing, native Pointer Events for input, no animation library.

## File Structure

```
src/lib/components/ScratchToReveal.svelte         # implementation
src/lib/components/ScratchToReveal.md             # this file
src/lib/components/ScratchToReveal.test.ts        # vitest unit tests
src/routes/scratchtoreveal/+page.svelte           # demo page
src/lib/types.ts                                  # ScratchToRevealProps
```
