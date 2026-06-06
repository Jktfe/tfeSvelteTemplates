# ColorPicker

## What Does It Do? (Plain English)

ColorPicker lets a user choose a colour visually. It shows a square saturation/brightness plane, a vertical hue slider down the side, a live preview swatch, an editable hex field, a row of preset swatches, and — where the browser supports it — a native "pick from screen" eyedropper button. The chosen colour flows out as a bindable 6-digit hex string.

**Think of it like:** the colour panel in a design app. Drag inside the square to set how vivid and how bright the colour is, slide the rainbow bar to spin the hue, or just type a hex code.

---

## How It Works (Pseudo-Code)

```
ON mount:
  PARSE the incoming `value` hex → RGB → HSV
  STORE hue, sat, val as the source of truth

WHILE the user interacts:
  hex      = HSV → RGB → '#rrggbb'   (derived)
  value    = hex                     (effect pushes it up to the binding)

WHEN parent overwrites `value` with a hex we did not produce:
  PARSE it → HSV and re-sync hue/sat/val

DRAG on the plane:
  sat = x position across the plane (0 → 1)
  val = 1 - y position down the plane (top is brightest)

DRAG on the hue track:
  hue = y position down the track × 360

TYPE in the hex field:
  hold a draft string; on Enter / blur, parse it.
  valid → adopt it; invalid → snap back to the live colour

CLICK a swatch / use the eyedropper:
  parse the picked hex → HSV and adopt it
```

---

## Why HSV Is the Source of Truth

Hex (and RGB) cannot remember a hue once a colour collapses to black or white. Pure black is `#000000` whether the user arrived there from red, green or blue — the hue information is gone. If the picker stored only hex, dragging the brightness to zero and back would reset the hue to red every time.

By keeping `hue`, `sat` and `val` as the live state and only *deriving* hex from them, the hue slider stays put while you drag saturation or brightness to their extremes. Hex is computed on the way out, never the way in (except when re-syncing an external write).

```
hue/sat/val  ──derived──▶  rgb  ──derived──▶  hex  ──effect──▶  value (binding)
     ▲                                                              │
     └──────────────  re-sync only on foreign external write  ──────┘
```

---

## The Saturation / Value Plane

The square is painted with three stacked layers, cheaply, in pure CSS:

1. A solid background of the **pure hue** (`hsv(hue, 1, 1)`), set via the `--hue-color` custom property.
2. A left-to-right white→transparent gradient — moving right increases saturation.
3. A bottom-to-top black→transparent gradient — moving up increases brightness (value).

The handle is positioned with `left: sat%` and `top: (1 - val)%` because the top edge is the brightest. Pointer maths reads the plane's bounding rect and clamps the normalised offsets into `[0, 1]`.

---

## Keyboard Model

Both the plane and the hue track are `role="slider"` with `tabindex="0"`, so they are reachable and operable without a mouse.

```
Plane focused:
  ArrowLeft / ArrowRight   sat ∓ 0.02   (Shift → 0.1)
  ArrowUp   / ArrowDown    val ± 0.02   (Shift → 0.1)

Hue track focused:
  ArrowUp / ArrowLeft      hue − 2      (Shift → 10)
  ArrowDown / ArrowRight   hue + 2      (Shift → 10)
  Home                     hue → 0
  End                      hue → 360

Hex input:
  Enter                    commit + blur
```

Each handled key calls `preventDefault()` so the page does not scroll while the slider moves.

---

## State Flow Diagram

```
            ┌──────────────────────┐
            │  hue / sat / val      │  ← source of truth
            └───────────┬──────────┘
                        │ derived
                        ▼
                ┌──────────────┐
        ┌───────│  rgb → hex   │
        │       └──────┬───────┘
        │              │ $effect
        │              ▼
        │      ┌──────────────┐
        │      │   value       │ (bind:value out)
        │      └──────┬───────┘
        │             │ foreign write?
        │             ▼
        │      ┌──────────────┐
        └──────│ re-sync HSV   │
               └──────────────┘

   Inputs that mutate hue/sat/val:
     plane drag · plane arrows
     hue drag   · hue arrows / Home / End
     hex commit · swatch click · eyedropper
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'#3b82f6'` | Bindable selected colour as a 6-digit hex string. Accepts `#rgb` or `#rrggbb` on input. |
| `swatches` | `string[]` | curated 12-colour palette | Preset hex swatches shown in a row beneath the picker. Pass `[]` to hide the row. |
| `showHex` | `boolean` | `true` | Show the editable hex text input. |
| `showEyeDropper` | `boolean` | `true` | Offer the native EyeDropper button — only renders when the browser supports the API. |
| `label` | `string` | `'Colour picker'` | ARIA label for the overall picker group. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Invalid hex typed in the field | On commit (Enter/blur) the draft snaps back to the live colour; HSV is untouched. |
| 3-digit shorthand (`#0af`) | Expanded to `#00aaff` before parsing. |
| `value` set to black/white externally | Re-synced to HSV; hue defaults sensibly (0) when undetectable, but the live drag still preserves the last set hue. |
| Brightness or saturation dragged to 0 | Hue is retained because HSV — not hex — is the source of truth. |
| EyeDropper unsupported | The button is feature-detected and simply not rendered. |
| EyeDropper dismissed by the user | Caught silently — no change to the colour. |
| `swatches={[]}` | The swatch row is omitted entirely. |
| `prefers-reduced-motion` | Handle position transitions are disabled. |

---

## Dependencies

- **Zero external dependencies.** All HSV ⇄ RGB ⇄ hex conversion is inline pure functions.
- The eyedropper uses the native `window.EyeDropper` API directly (feature-detected, no polyfill).

---

## File Structure

```
ColorPicker.svelte    # The component
ColorPicker.test.ts   # Unit tests
ColorPicker.md        # This explainer
```
