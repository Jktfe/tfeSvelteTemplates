# HoldToConfirm - Technical Logic Explainer

## What Does It Do? (Plain English)

A press-and-hold confirmation button for destructive UX flows: hold-to-delete, hold-to-send, hold-to-leave-call. The user must keep pressure on the control for the full `duration` — release before completion cancels, release after completion fires `onConfirm`. Designed to defeat habituation: users cannot accidentally tap-confirm an irreversible action.

Pairs naturally with `Switch` (different idiom: instant boolean toggle vs. gated commit), `SwishButton` / `MagneticButton` (different commitment: cosmetic-motion CTAs vs. safety-gated commit), `ProgressBar` / `ProgressRing` (different binding: passive value display vs. user-driven gesture timer). Never a substitute for a real progress indicator — use a value-bound primitive when you need to communicate progress of a background task.

**Think of it like:** the dead-man's handle on a train. The action only happens if you keep deliberate pressure on the control for the whole count — let go early and nothing happens.

---

## How It Works (Pseudo-Code)

```
state:
  holding   = false
  confirmed = false
  reduced   = isReducedMotion()      # read once on mount

startHold():
  1. IF disabled OR confirmed OR holding → return
  2. holding = true                  # CSS fill animation starts (duration = safeDuration)
  3. timer = setTimeout(safeDuration):
       holding = false
       confirmed = true
       onConfirm()
       after 700ms → confirmed = false

cancelHold():
  1. IF not holding → return
  2. holding = false; clearTimeout(timer)   # CSS fill snaps back
  3. onCancel()

ON pointerdown:
  IF disabled → return
  IF reduced  → confirm immediately (single press), reset after 700ms
  ELSE        → setPointerCapture(pointerId); startHold()

ON pointerup / pointercancel / pointerleave → cancelHold()

ON keydown Enter or Space (ignoring auto-repeat):
  preventDefault()
  IF reduced → confirm immediately
  ELSE       → startHold()

ON keyup Enter or Space → cancelHold()

ON destroy → clear both timers
```

---

## The Core Concept: Gated Commitment

- **Three variants** — `ring` (SVG `stroke-dashoffset` fill on a circular gauge), `bar` (linear horizontal progress filling the button background), `glow` (radial pulse fill expanding from centre). Each is a distinct visual rhythm, not a colour swap.
- **Pointer + keyboard parity** — `pointerdown` / `pointerup` / `pointercancel` / `pointerleave` drive the gesture for mouse / touch / pen. `Enter` (and `Space`) start a programmatic hold cycle; releasing the key before `duration` cancels. Most "hold to confirm" implementations either drop keyboard support or fake it with a 2-step click — both defeat the gesture's purpose. This one keeps the contract.
- **Pointer capture** — `setPointerCapture` keeps the gesture alive even if the user drags outside the button's bounding box mid-hold.
- **Reduced-motion bypass** — under `prefers-reduced-motion: reduce` the gesture collapses to a single-press confirm, with a visible "Press and hold for {duration}s" text fallback explaining the original contract. The dialog text is the fallback safety; the gesture is the primary safety.
- **CSS-driven progress** — fill animation runs on the GPU (`stroke-dashoffset` / `width` / `transform: scale`); JS only fires the `setTimeout` for the confirm callback.
- **Pure helpers exported** — `pickVariant`, `isValidVariant`, `clampDuration`, `isReducedMotion`. Directly unit-testable without rendering.
- **Confirmed-state hold** — after `onConfirm` fires the visible "Confirmed" state holds for 700 ms before resetting, so the user sees their action register.

## Usage

```svelte
<script>
	import HoldToConfirm from '$lib/components/HoldToConfirm.svelte';
</script>

<HoldToConfirm onConfirm={() => deleteAccount()} />

<HoldToConfirm
	variant="bar"
	duration={2000}
	label="Hold to send"
	onConfirm={sendIrrevocably}
/>

<HoldToConfirm
	variant="glow"
	duration={1200}
	label="Hold to leave call"
	onConfirm={hangUp}
/>

<HoldToConfirm disabled label="Saving — please wait" />
```

## CSS Animation Strategy: Variant Table

| Variant | Mechanism                                | Vibe                                   |
| ------- | ---------------------------------------- | -------------------------------------- |
| `ring`  | SVG `stroke-dashoffset` 126 → 0 over duration | Circular gauge filling around an icon |
| `bar`   | `width: 0% → 100%` on a fill behind the label | Linear progress underneath the text  |
| `glow`  | Radial gradient `opacity 0 → 1`, `scale 0.6 → 1` | Pulse blooming from the centre      |

## Distinct From Similar Components

- **`Switch`** — instant boolean toggle. No timer, no gesture commitment.
- **`SwishButton`** / **`MagneticButton`** — single-click CTAs with cosmetic motion. No gating.
- **`ProgressBar`** / **`ProgressRing`** — passive value display. Bound to data, not user gesture.
- **`Stepper`** / **`Pagination`** — multi-step navigation. Not a single gated commit.
- **Native `confirm()`** — modal interrupt. Users habituate to dismissing it; HoldToConfirm requires sustained intention.

## Pure helpers (module-script exports)

- `pickVariant(name)` — returns `'ring' | 'bar' | 'glow'`. Falls back to `'ring'`.
- `isValidVariant(name)` — type guard for variant names.
- `clampDuration(n)` — clamps to `[200, 10000]` ms. NaN / Infinity / non-numeric → `1500`.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Accessibility

- Button carries `role="button"` (native), `aria-label` (label or override), `aria-pressed` (reflects the holding state for AT users), `aria-disabled` (mirrors the `disabled` prop).
- Decorative ring / bar / glow elements are `aria-hidden="true"` so the label is the only screen-reader text.
- Keyboard contract is symmetric with pointer: `Enter` (or `Space`) starts the hold; releasing the key before `duration` cancels. Repeat events are filtered so holding the key does not start a second cycle.
- Visible focus ring (`outline: 2px solid var(--htc-color)`) — the user always knows when the control is focused.
- Under `prefers-reduced-motion: reduce`: the gesture collapses to a single-press confirm and a visible text fallback ("Press and hold for {duration}s — reduced-motion mode collapses to a single press") explains the original contract. The safety contract is preserved — the dialog text replaces the gesture, the user still has to make an explicit decision.

## Performance

- 1 `<button>` + 1 fill element (SVG / span / span) + 1 label span. No `requestAnimationFrame`, no canvas, no `ResizeObserver`.
- Visible progress is GPU-composited: `stroke-dashoffset` (ring), `width` (bar), `opacity + transform: scale` (glow). The browser interpolates on its own.
- The JS `setTimeout` only fires the `onConfirm` callback; it does not drive the visible animation.

## Recipes

- **Hold to delete account**: `<HoldToConfirm duration={2500} label="Hold to delete account" onConfirm={deleteAccount} />`
- **Hold to send irreversible payment**: `<HoldToConfirm variant="bar" duration={2000} label="Hold to send £{amount}" onConfirm={pay} />`
- **Hold to leave a call**: `<HoldToConfirm variant="glow" duration={1200} label="Hold to leave call" onConfirm={hangUp} />`
- **Hold to fire the missile**: `<HoldToConfirm variant="ring" duration={3000} label="Hold to launch" onConfirm={launch} />` — the longer the duration, the higher the gesture cost, the lower the false-positive rate.
- **Disabled while saving**: `<HoldToConfirm disabled label="Saving — please wait" />`

---

## State Flow Diagram

```
                 ┌──────────────────────┐
                 │  IDLE                │◀───────────────────────────────┐
                 │  holding = false     │                                │
                 │  confirmed = false   │                                │
                 └──────────┬───────────┘                                │
      pointerdown / Enter   │                                            │
      (not disabled)        │                                            │
          reduced motion? ──┼── yes ─────────────────────┐               │
                            │ no                         │               │
                            ▼                            ▼               │
                 ┌──────────────────────┐     ┌──────────────────────┐   │
                 │  HOLDING             │     │  CONFIRMED           │   │
                 │  fill animating      │────▶│  onConfirm() fired   │───┘
                 │  timer running       │timer│  "Confirmed" 700ms   │ 700ms
                 └──────────┬───────────┘ ends└──────────────────────┘
                            │
    pointerup / pointerleave│/ pointercancel / keyup before timer ends
                            ▼
                     onCancel() → IDLE
```

---

## Props Reference

| Prop        | Type                       | Default              | Description                                                       |
| ----------- | -------------------------- | -------------------- | ----------------------------------------------------------- |
| `duration`  | `number`                   | `1500`               | Clamped `[200, 10000]` ms. Malformed → `1500`.              |
| `label`     | `string`                   | `'Hold to confirm'`  | Visible label and default `aria-label`.                     |
| `variant`   | `'ring' \| 'bar' \| 'glow'` | `'ring'`             | Unknown → `'ring'`.                                         |
| `onConfirm` | `() => void`               | no-op                | Fires after the user holds for `duration` ms.               |
| `onCancel`  | `() => void`               | no-op                | Fires on release-before-completion or `pointercancel`.      |
| `disabled`  | `boolean`                  | `false`              | Sets `aria-disabled` and the native `disabled` attribute.   |
| `ariaLabel` | `string \| undefined`      | `label` value        | Use when the visible label is decorative.                   |
| `class`     | `string`                   | `''`                 | Extra classes on the wrapper button.                        |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Released one frame before `duration` | Cancelled — `onCancel` fires and `onConfirm` does not. |
| Pointer dragged outside the button mid-hold | Pointer capture keeps the gesture alive until release. |
| Key held down (auto-repeat) | Repeat `keydown` events are ignored, so only one hold cycle starts. |
| Pressed again during the 700ms confirmed state | Ignored — the button must return to idle first. |
| `duration` is `NaN`, negative or huge | Clamped to `[200, 10000]` ms; malformed values become `1500`. |
| Unknown `variant` string | Falls back to `'ring'`. |
| `disabled` is `true` | Pointer and keyboard input are ignored; `aria-disabled` is set. |
| `prefers-reduced-motion: reduce` | A single press confirms, and a visible text fallback explains the original hold contract. |
| Component unmounts mid-hold | Both timers are cleared so `onConfirm` never fires on a dead component. |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (runes, `onMount`, `onDestroy`) and scoped CSS.

---

## File Structure

```
src/lib/components/HoldToConfirm.svelte                  # implementation + exported pure helpers
src/lib/components/HoldToConfirm.md                      # this file (rendered inside ComponentPageShell)
src/lib/components/HoldToConfirm.test.ts                 # vitest unit + interaction tests
src/lib/components/HoldToConfirmTestHarness.test.svelte  # DOM harness for mounted tests
src/routes/holdtoconfirm/+page.svelte                    # demo page
```
