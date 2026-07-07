# BackToTop

## What Does It Do? (Plain English)

BackToTop is a small floating button that hides itself until you have scrolled a certain distance down the page, then quietly fades into a corner of the screen. Click it (or reach it with the keyboard and press Enter) and the page glides smoothly back to the top.

**Think of it like:** the "return to top" escalator at the end of a very long staircase. You do not see it while you are still near the top — it only appears once you are deep enough down the page that a shortcut home actually saves you effort.

It can watch the whole `window` (the default) or any single scrollable element you point it at, so it works equally well for a long article and for a tall, independently-scrolling panel.

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. PROBE prefers-reduced-motion → store as `reduced`
  2. RESOLVE the scroll target (window | element | selector)
  3. ATTACH a passive scroll listener to that target
  4. RUN one initial measurement (page may already be scrolled)

WHEN the target SCROLLS:
  1. IF a frame is already queued → ignore (throttle)
  2. ELSE requestAnimationFrame(update)

INSIDE update() (once per frame):
  1. READ the target's scrollTop
  2. SET visible = scrollTop > threshold

WHEN visible flips true:
  1. RENDER the <button> (it did not exist in the DOM before)
  2. PLAY the fly-in transition — UNLESS reduced motion (duration 0)

WHEN the button is CLICKED / activated:
  1. behavior = (smooth AND not reduced) ? 'smooth' : 'auto'
  2. target.scrollTo({ top: 0, behavior })

WHEN component unmounts:
  1. CANCEL any pending animation frame
  2. REMOVE the scroll listener
```

---

## The Core Concept: Throttled Scroll Detection

Scroll events fire a *lot* — dozens per second during a flick on a trackpad. Doing real work inside every one of them is the classic way to make a page feel sticky. BackToTop avoids that with a `requestAnimationFrame` throttle.

The pattern is a one-slot queue:

```
function handleScroll() {
  if (rafId) return;                       // a frame is already pending — drop this event
  rafId = requestAnimationFrame(update);   // otherwise, book exactly one
}

function update() {
  rafId = 0;                               // slot is free again
  visible = readScrollTop(target) > threshold;
}
```

No matter how many scroll events arrive between two frames, only **one** measurement runs per frame — the browser's natural ~60fps cadence. The actual read is a single property access (`scrollY` for the window, `scrollTop` for an element), and the only state change is a boolean, so there is nothing to make the main thread stutter.

The comparison itself lives in a pure, exported helper so it can be unit-tested without a DOM:

```
isPastThreshold(scrollTop, threshold) → scrollTop > threshold
```

Using a strict `>` (not `>=`) means a page sitting *exactly* at the threshold keeps the button hidden — the button only shows up once you are genuinely past the line.

---

## CSS Animation Strategy

The button is not hidden with `opacity: 0` — it is not in the DOM at all until `visible` becomes true. This is a deliberate accessibility choice (see Edge Cases) and it also means the appear/disappear animation is a Svelte block transition rather than a CSS class toggle.

The entrance is a short upward `fly`, but it is **gated on reduced motion** by feeding the duration from the probed preference:

```svelte
<button transition:fly={{ y: 12, duration: reduced ? 0 : 220 }}>
```

When the user has asked for reduced motion, `duration` collapses to `0`, so the button simply appears and disappears with no travel. The hover lift and shadow are plain CSS transitions, and those are switched off in a `@media (prefers-reduced-motion: reduce)` block for a belt-and-braces guarantee — the JS gate and the CSS gate agree.

Position is pure CSS: `position: fixed` plus `bottom` and either `right` or `left`, chosen by the `pos-{position}` class. Because it is `fixed`, in a demo it must be trapped inside a `contain: layout paint; transform: translateZ(0)` stage or it will anchor to the viewport and hijack the whole page.

---

## State Flow Diagram

```
                 ┌───────────────────────┐
                 │        HIDDEN         │
                 │    visible = false    │
                 │   (button NOT in DOM) │
                 └───────────┬───────────┘
                             │
        scrollTop > threshold│   (per rAF tick)
                             ▼
                 ┌───────────────────────┐
                 │       VISIBLE         │
                 │    visible = true     │
                 │  fly-in (gated on RM) │
                 └───────────┬───────────┘
                             │
             ┌───────────────┼────────────────┐
             │ scroll back    │ click / Enter  │
             │ above threshold│                │
             ▼                ▼                │
     ┌───────────────┐  ┌───────────────────┐ │
     │    HIDDEN     │  │  scrollTo({top:0}) │ │
     │ (fly-out)     │  │  behavior resolved │ │
     └───────────────┘  └─────────┬─────────┘ │
                                   │           │
                                   └───────────┘
                          (scroll passes threshold → HIDDEN)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `threshold` | `number` | `300` | Pixels scrolled before the button appears. |
| `smooth` | `boolean` | `true` | Smooth-scroll on click (ignored under reduced motion). |
| `label` | `string` | `'Back to top'` | aria-label, and visible text when `showLabel` is set. |
| `showLabel` | `boolean` | `false` | Render `label` as visible text beside the icon. |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Which corner the button sits in. |
| `target` | `Window \| HTMLElement \| string` | `window` | Scroll source — window, an element, or a CSS selector. |
| `class` | `string` | `''` | Extra classes forwarded to the button. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Page too short to scroll past threshold | Button never appears — nothing to return from. |
| Page restored mid-scroll (bfcache / anchor) | Initial measurement in `onMount` shows the button immediately if already past threshold. |
| `prefers-reduced-motion` set | Fly-in duration is 0 and the scroll jump is instant (`behavior: 'auto'`). |
| Button hidden | Not rendered at all — so it is never a phantom Tab stop for keyboard users. |
| Invalid `position` value | Coerced to `'bottom-right'` by `pickPosition`. |
| `target` selector matches nothing | Falls back to `window`; an empty string also means window. |
| Rapid scroll bursts | rAF throttle collapses them to one measurement per frame. |
| Component unmounts mid-scroll | Pending rAF is cancelled and the listener removed — no leaks, no orphan callbacks. |

---

## Dependencies

- **Zero external dependencies** — pure Svelte 5 runes + scoped CSS.
- `svelte/transition` (`fly`) — a built-in, not a third-party package.
- Inline SVG for the up-arrow icon — no icon library.

---

## File Structure

```
BackToTop.svelte      # The component (inline Props interface + module helpers)
BackToTop.test.ts     # Pure-helper + render/scroll contract tests
BackToTop.md          # This explainer
```
