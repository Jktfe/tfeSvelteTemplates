# Spinner — Technical Logic Explainer

## What Does It Do? (Plain English)

Spinner is the universal "we're working on it" indicator. It signals that something is happening when you don't yet know how long it'll take — a form submitting, a fetch in flight, a background sync. Pick one of four visual styles (`ring`, `dots`, `bars`, `pulse`) and one of three sizes; drop it inside any text-coloured element and it picks up the colour automatically. There's no JavaScript animation loop, no timer, no requestAnimationFrame — it's a single span with a CSS keyframe.

Think of it as the digital equivalent of a barista's hand twirl: a quiet, ongoing signal that progress is happening even though you can't see what.

## How It Works (Pseudo-Code)

```
props:
  variant   = 'ring' | 'dots' | 'bars' | 'pulse'   // default 'ring'
  size      = 'sm' | 'md' | 'lg'                    // default 'md'
  color     = optional CSS colour                   // default: currentColor
  label     = optional visible caption
  ariaLabel = string                                 // default 'Loading'

derive:
  effectiveAriaLabel = label || ariaLabel    // visible label preferred
  colorStyle = color ? "--spinner-color: {color};" : ''

render <div role="status" aria-live="polite"
            aria-label={effectiveAriaLabel}
            style={colorStyle}
            class="spinner spinner-{variant} spinner-{size}">
  switch variant:
    'ring':  <svg> circle with stroke-dasharray; CSS rotates SVG
    'dots':  three <span class="dot">; CSS staggers bounce keyframes
    'bars':  three <span class="bar">; CSS staggers wave keyframes
    'pulse': two <span class="ring">; CSS scales them outward in sequence
  if label:
    <span class="spinner-label">{label}</span>
</div>
```

## The Core Concept: One Component, Four Visual Personalities

Different products want different "we're loading" personalities. A bank app wants a quiet ring that says *competent*. A consumer app wants three bouncing dots that say *friendly*. A media player wants vertical bars that nod to audio processing. A background-sync indicator wants concentric pulse rings that say *ambient*.

Rather than ship four spinner components, Spinner exposes a `variant` prop and switches the inner markup. Each variant has its own keyframe but shares the same wrapper, sizing, colour inheritance, and ARIA contract.

```
ring   →  <svg> with rotating stroke-dasharray gap
dots   →  three dots, each animating "y=0 ↔ y=-50%" with a 0.16s stagger
bars   →  three bars, each animating "scaleY 0.4 → 1 → 0.4" with stagger
pulse  →  two rings scaling 0 → 1.4 with opacity 0.7 → 0
```

All four variants react identically to `size` (which sets the wrapper's `font-size`, and the inner elements size in `em`), `color` (set as a CSS custom property), and `prefers-reduced-motion` (which falls back to a calm opacity fade).

## Inheriting `currentColor` Means Zero Theming

Spinner's default `color` is `currentColor`. Drop it inside any element with a text colour and the spinner inherits it:

```svelte
<button class="text-blue-500"><Spinner size="sm" /> Submitting…</button>
<!-- spinner is blue -->

<button class="text-red-700"><Spinner size="sm" /> Deleting…</button>
<!-- spinner is red -->
```

This means there's no separate "what colour against what background" decision — the spinner inherits the contrast story the surrounding text has already negotiated. When the parent context changes (dark mode, a coloured panel, a destructive button), the spinner follows automatically.

When you want to override, the `color` prop becomes a `--spinner-color` CSS custom property. Each variant's keyframe references `var(--spinner-color, currentColor)`, so the override cascades correctly.

## CSS Animation Strategy

All four variants use pure CSS keyframes. There is no `requestAnimationFrame` loop, no `setInterval`, no `Animation` object. The browser handles everything; the component has zero runtime overhead while spinning.

**Ring:**
```css
@keyframes spinner-rotate { to { transform: rotate(360deg); } }
.spinner-ring svg { animation: spinner-rotate 0.85s linear infinite; }
```

**Dots:** three children, each with the same bounce keyframe but staggered `animation-delay` (0s, 0.16s, 0.32s) so they offset.

**Bars:** same staggering pattern but the keyframe scales `transform: scaleY(...)`.

**Pulse:** two concentric rings starting at `scale(0)` and ending at `scale(1.4)` with fading opacity — staggered by 0.5s so one starts as the other is halfway out.

**Reduced motion:** all four variants fall back to a single opacity-pulse keyframe:

```css
@media (prefers-reduced-motion: reduce) {
  .spinner * { animation: spinner-fade 1.5s ease-in-out infinite !important; }
}
@keyframes spinner-fade {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
```

The component still indicates "working" without spinning, bouncing, or scaling — no vestibular discomfort, no rotational motion that triggers sensitivity.

## Accessibility Notes

The wrapper has `role="status"` and `aria-live="polite"`. When the spinner appears, screen readers announce its accessible name once.

The accessible name comes from the visible `label` if present, otherwise from `ariaLabel`. The visible-label-wins rule prevents screen readers from saying "Submitting" twice (once from the visible text, once from `aria-label="Loading"`).

The animated SVGs and spans are all `aria-hidden="true"` — they're decorative; the textual label is what's announced.

`role="status"` is the right ARIA pattern for activity messages. `aria-live="polite"` ensures the announcement waits for the user's current reading flow rather than interrupting.

## Distinct From ProgressBar / ProgressRing

- **Spinner** is for *unknown duration*. You don't know what percent done; you just know something's happening.
- **ProgressBar / ProgressRing** are for *known percent*. Use them when you can compute a meaningful value.

If you can show progress, do — it gives users far better information. The Spinner is the fallback when no honest progress estimate exists.

For loading-time placeholders that should match content shape, see **SkeletonLoader** instead.

## State Flow Diagram

```
       Parent decides to show spinner
                    │
                    │  (e.g. submitting=true)
                    ▼
            ┌─────────────────┐
            │   Spinner       │
            │   renders       │
            │   role="status" │
            └────────┬────────┘
                     │ aria-live announces label
                     ▼
            ┌─────────────────┐
            │  CSS animation  │
            │  loops          │
            │  indefinitely   │
            └────────┬────────┘
                     │ parent decides loading is done
                     ▼
            ┌─────────────────┐
            │  Spinner        │
            │  unmounted      │
            │  (no exit       │
            │   animation)    │
            └─────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'ring' \| 'dots' \| 'bars' \| 'pulse'` | `'ring'` | Visual style. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Drives a `font-size` on the wrapper; inner elements scale with `em`. |
| `color` | `string` | `currentColor` | Override the inherited text colour. Forwarded as `--spinner-color`. |
| `label` | `string` | `''` | Optional visible caption rendered next to the animation. |
| `ariaLabel` | `string` | `'Loading'` | Used as the accessible name only when no visible `label` is set. |
| `class` | `string` | `''` | Extra classes appended to the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Both `label` and `ariaLabel` are set | The visible `label` becomes the accessible name; `ariaLabel` is ignored to avoid double-reading. |
| Neither is set | Defaults to `ariaLabel="Loading"` for the screen reader; nothing visible. |
| `color` is an invalid CSS colour | Browser resolves it to the cascaded default — usually black. Same outcome as setting `color: garbage` anywhere. |
| Spinner inside a button that's been disabled | Renders fine. The spinner is decorative; the button's disabled state is independent. |
| Operation takes more than ~10 seconds | Spinners get anxiety-inducing past that — show a status message, an estimate, or progressive content. |
| User has `prefers-reduced-motion: reduce` | All four variants fall back to a calm opacity pulse. Activity is still signalled without rotational/bouncing motion. |
| Spinner is rendered hundreds of times on one page | Performance is fine — pure CSS keyframes are GPU-efficient. The wrapper has no runtime watchers. |
| Server-side render | The wrapper renders normally; the keyframe starts as soon as CSS hydrates client-side. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`.
- Zero external runtime dependencies. All four variants are pure CSS keyframes.

## File Structure

```
src/lib/components/Spinner.svelte         # component implementation
src/lib/components/Spinner.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Spinner.test.ts        # vitest unit tests
src/routes/spinner/+page.svelte           # demo page
```
