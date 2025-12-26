# ScratchToReveal - Technical Logic Explainer

## What Does It Do? (Plain English)

ScratchToReveal is an interactive scratch card component. Drag your finger or mouse across the grey surface to "scratch off" the coating and reveal hidden content underneath - just like a lottery scratch card! Once you've scratched away enough (default 70%), the content fully reveals itself.

**Think of it like:** A real scratch card from the shops. Scrape off the silver coating to see if you've won!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. MEASURE content dimensions (or use explicit width/height)
  2. CREATE canvas overlay sized to match content
  3. DRAW scratch surface (solid colour OR image)
  4. OPTIONALLY draw overlay text ("SCRATCH HERE!")

WHEN pointer DOWN on canvas:
  1. SET isScratching = true
  2. CAPTURE pointer (keeps events even if finger leaves canvas)
  3. START scratching at pointer location

WHILE scratching (pointer MOVE):
  1. CALCULATE position relative to canvas
  2. ERASE pixels at that position using 'destination-out'
  3. USE RequestAnimationFrame for 60fps smoothness

WHEN pointer UP:
  1. SET isScratching = false
  2. RELEASE pointer capture
  3. SAMPLE pixels to calculate scratch percentage
  4. IF percentage >= threshold AND autoReveal:
     - CLEAR entire canvas
     - SET isFullyRevealed = true
     - CALL onReveal callback

WHEN skip button clicked:
  1. CLEAR entire canvas
  2. SET isFullyRevealed = true

WHEN reset button clicked:
  1. SET isFullyRevealed = false
  2. REDRAW scratch surface
```

---

## The Canvas Magic: destination-out Compositing

The key trick is using Canvas 2D's `globalCompositeOperation = 'destination-out'`:

```
Before scratching:              After scratching:
┌─────────────────────┐        ┌─────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│        │▓▓▓▓▓░░░░░░░▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│        │▓▓▓░░░░░░░░░░░▓▓▓▓▓▓│
│▓▓▓▓SCRATCH HERE!▓▓▓▓│   →    │▓▓░░░PRIZE!░░░░▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│        │▓▓▓░░░░░░░░░░░▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│        │▓▓▓▓▓░░░░░░░▓▓▓▓▓▓▓▓│
└─────────────────────┘        └─────────────────────┘
   Grey canvas overlay            Scratched area shows
   covers hidden content          content underneath

▓ = Opaque pixels (scratch surface)
░ = Transparent pixels (scratched away)
```

**How 'destination-out' works:**

```typescript
ctx.globalCompositeOperation = 'destination-out';
ctx.arc(x, y, brushSize/2, 0, Math.PI * 2);
ctx.fill();
// Any pixels drawn are REMOVED (made transparent) instead of added
```

---

## Progress Calculation (Pixel Sampling)

To check how much has been scratched, we sample pixels:

```typescript
function updateProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data; // [R,G,B,A, R,G,B,A, ...]

  // Sample every 4th pixel for 4x performance
  const sampleRate = 4;
  let transparentCount = 0;
  let totalSamples = 0;

  for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
    totalSamples++;
    if (pixels[i + 3] === 0) {  // Check alpha channel (index 3)
      transparentCount++;
    }
  }

  scratchPercentage = (transparentCount / totalSamples) * 100;
}
```

**Why sample every 4th pixel?**
- Full pixel array can be millions of values
- Sampling gives accurate-enough percentage at 4x speed
- Only calculated on pointer up (not during scratch)

---

## Retina/HiDPI Display Support

Canvas uses physical pixels, CSS uses logical pixels. For crisp rendering:

```typescript
const dpr = window.devicePixelRatio || 1;  // e.g., 2 on Retina

// Canvas internal resolution (physical pixels)
canvas.width = canvasWidth * dpr;    // 600px on Retina
canvas.height = canvasHeight * dpr;  // 800px on Retina

// CSS display size (logical pixels)
canvas.style.width = `${canvasWidth}px`;   // 300px
canvas.style.height = `${canvasHeight}px`; // 400px

// Scale context to match
ctx.scale(dpr, dpr);  // Now 1 unit = 1 CSS pixel
```

---

## Pointer Events (Unified Input)

Instead of separate mouse/touch handlers, we use Pointer Events:

```typescript
// Works for mouse, touch, AND stylus!
onpointerdown={handlePointerDown}
onpointermove={handlePointerMove}
onpointerup={handlePointerUp}
onpointercancel={handlePointerUp}  // Handle interruptions (e.g., phone call)
```

**Pointer capture** keeps events flowing even if finger/cursor leaves the canvas:

```typescript
canvas.setPointerCapture(event.pointerId);
// ... scratching continues smoothly ...
canvas.releasePointerCapture(event.pointerId);
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scratchColor` | `string` | `'#999999'` | Solid colour for scratch surface |
| `scratchImage` | `string` | - | Image URL for scratch surface |
| `scratchText` | `string` | - | Overlay text (e.g., "SCRATCH HERE!") |
| `scratchTextColor` | `string` | `'#ffffff'` | Overlay text colour |
| `scratchTextSize` | `string` | `'24px'` | Overlay text size |
| `revealThreshold` | `number` | `70` | % to scratch before auto-reveal |
| `autoReveal` | `boolean` | `true` | Auto-reveal when threshold reached |
| `brushSize` | `number` | `40` | Scratch brush size in pixels |
| `brushShape` | `'circle' │ 'square'` | `'circle'` | Brush shape |
| `width` | `number │ 'auto'` | `'auto'` | Canvas width |
| `height` | `number │ 'auto'` | `'auto'` | Canvas height |
| `showProgress` | `boolean` | `false` | Show progress bar |
| `progressColor` | `string` | `'#3b82f6'` | Progress bar colour |
| `allowReset` | `boolean` | `true` | Allow reset after reveal |
| `resetButtonText` | `string` | `'Reset'` | Reset button text |
| `skipText` | `string` | `'Skip'` | Skip button text (null to hide) |
| `onReveal` | `() => void` | - | Callback when fully revealed |
| `onProgress` | `(%) => void` | - | Callback with progress percentage |
| `disabled` | `boolean` | `false` | Disable scratching |

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Skip scratching, reveal all |
| `R` | Reset (when fully revealed) |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Keyboard | Space/Enter to skip, R to reset |
| Screen readers | ARIA live region announces progress |
| Focus | Focus-visible outline on wrapper |
| Labels | role="application" with descriptive aria-label |
| Reduced motion | Transitions respect prefers-reduced-motion |

---

## Performance Considerations

- **RequestAnimationFrame** - smooth 60fps scratching
- **Pixel sampling** (every 4th) - fast progress calculation
- **Only on pointer up** - progress calculation not during scratch
- **willReadFrequently** hint - optimised for getImageData
- **Pointer capture** - prevents missed events

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| No children content | Empty reveal area |
| Very small brush | Still works, just slower to scratch |
| Disabled state | Cursor changes, scratching prevented |
| Rapid scratching | RAF throttles to 60fps |
| Pointer leaves canvas | Pointer capture keeps events flowing |
| Mobile scroll | `touch-action: none` prevents scroll during scratch |

---

## Dependencies

- **$lib/types** (ScratchToRevealProps) - TypeScript interface
- **Zero external dependencies** - pure HTML5 Canvas API

---

## File Structure

```
ScratchToReveal.svelte      # The component
ScratchToReveal.test.ts     # Unit tests
ScratchToReveal.md          # This explainer
```

---

*Last updated: 26 December 2025*
