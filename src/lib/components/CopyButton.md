# CopyButton — Technical Logic Explainer

## What Does It Do? (Plain English)

A focused button that copies a string to the clipboard via `navigator.clipboard.writeText`, then flips its label and icon to a brief confirmation ("Copied!") for a configurable duration before reverting. Useful next to code blocks, share URLs, API keys, invite codes — anywhere users need to grab a value without selecting and right-clicking.

Think of it as a one-purpose magic wand: the value is already chosen, the user just needs to commit it to the clipboard. The visual flip from "Copy" to "Copied!" is the whole UX loop, no toast required.

## How It Works (Pseudo-Code)

```
state:
  copied      = boolean (true while in success state)
  resetTimer  = setTimeout handle for reverting copied = false

events:
  on click:
    try:
      await navigator.clipboard.writeText(value)
      copied = true
      fire onCopy(value)
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => copied = false, copiedDuration)
    catch:
      // Clipboard API unavailable or permission denied
      // Stay in idle state; consumers can detect via onCopy not firing

derive displayLabel:
  copied ? copiedLabel : label

render:
  <button onclick={handleClick}>
    if variant !== 'text': icon (clipboard | checkmark when copied)
    if variant !== 'icon': label or copiedLabel
    <span aria-live="polite" sr-only>copiedLabel or ''</span>
  </button>
```

The whole logic is one click handler and one timeout. The aria-live region is the screen-reader equivalent of the visual flip — when `copied` becomes true, the SR-only span announces "Copied!" through the live region without disrupting any other focus.

## The Core Concept: Async Clipboard With Graceful Failure

`navigator.clipboard.writeText` returns a Promise that rejects in three real-world cases:

1. **Insecure context.** The Clipboard API requires HTTPS (or `localhost`) — calling it from `http://example.com` rejects.
2. **Permission denied.** Browsers may prompt for clipboard permission on first use; a denial rejects.
3. **API not available.** Older browsers (or hardened embeds like cross-origin iframes with `allow="clipboard-write"` missing) don't expose `navigator.clipboard` at all — `writeText` is undefined.

The try/catch is therefore essential, not optional. The strategy is **silent failure**:

```
try {
  await navigator.clipboard.writeText(value);
  // success path: flip to copied state
} catch {
  // do nothing — copied stays false, label stays "Copy"
}
```

The button doesn't show a "couldn't copy" error. The reasoning: most consumers don't have a UX for a copy failure (no error toast in scope, no fallback flow), so showing an error would just confuse the user. Instead, the visual flip simply doesn't happen. Consumers who care about success can rely on `onCopy` firing — it only fires on the success path, so `(value) => analytics.track('copy', value)` only tracks real copies.

For applications that need a fallback (e.g. very old Safari), wrap CopyButton's `onCopy` and pair it with a `<textarea>`-and-`document.execCommand('copy')` fallback. That dance isn't built in because it doubles the component's surface area for a vanishingly small audience.

## The Reset Timer & Click-Spam Resilience

If the user clicks the button twice within `copiedDuration`, the second click would reset `copied = true` and start a new timeout. The previous timeout is still scheduled to fire and would set `copied = false` *after* the second click's timeout — clobbering the success state mid-flight.

The fix is to cancel the previous timer before scheduling a new one:

```
copied = true;
clearTimeout(resetTimer);              // kill the in-flight reset
resetTimer = setTimeout(() => copied = false, copiedDuration);
```

So spamming the button keeps the success state visible for `copiedDuration` *after the last click* — never longer, never shorter. The `resetTimer` is the only side-effect bookkeeping the component does; everything else is pure derived state.

## Accessibility: aria-live Without Disrupting Focus

When the button flips to "Copied!", the visual change is obvious to sighted users. For screen readers, the label change inside the button isn't reliably announced — many AT implementations don't fire change events for in-place text mutations.

The fix is a separate `aria-live="polite"` region:

```
<span class="sr-only" role="status" aria-live="polite">
  {copied ? copiedLabel : ''}
</span>
```

When `copied` becomes true, the span's text changes from `''` to `copiedLabel`. AT detects the live region's content change and announces it. Because `aria-live="polite"` waits for a quiet moment, the announcement doesn't interrupt anything the user was already reading.

The visual icon also flips — clipboard glyph → checkmark — so colour is not the only success signal. WCAG 1.4.1 satisfied.

## State Flow Diagram

```
              ┌────────────────────────┐
              │   IDLE                  │
              │   copied = false        │
              │   shows label + 📋 icon │
              └────────────┬────────────┘
                           │
                       click
                           │
                           ▼
              ┌────────────────────────┐
              │   COPYING (async)       │
              │   await writeText(value)│
              └────────┬──────┬─────────┘
                       │      │
              success  │      │  failure (silent)
                       │      │
                       ▼      ▼
              ┌────────────┐  back to IDLE
              │  COPIED    │
              │ copied=true│
              │ clearTimer │
              │ setTimer(  │
              │  duration) │
              │ shows      │
              │ copiedLabel│
              │  + ✓ icon  │
              │ aria-live  │
              │  announces │
              │ onCopy()   │
              │  fires     │
              └─────┬──────┘
                    │
       click again (spam)│      timer fires after
                    │            copiedDuration ms
                    │             │
                    ▼             ▼
              clearTimer   copied = false
              setTimer     back to IDLE
              (extends
               COPIED
               duration)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | The text to copy. |
| `label` | `string` | `'Copy'` | Idle button text. |
| `copiedLabel` | `string` | `'Copied!'` | Success label after a successful copy. |
| `variant` | `'text' \| 'icon' \| 'both'` | `'both'` | Visual treatment: label only, icon only, or both. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding + font scale. |
| `copiedDuration` | `number` | `2000` | Milliseconds to keep the success state visible. |
| `ariaLabel` | `string` | `label` | Override the button's `aria-label`. Defaults to the current display label. |
| `onCopy` | `(value: string) => void` | — | Fires only after a successful copy. |
| `class` | `string` | `''` | Extra classes on the button. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Page served over `http://` (insecure context) | `navigator.clipboard.writeText` rejects; the catch block fires; button stays in idle state. `onCopy` does not fire. |
| User has denied clipboard permission | Same as insecure context — silent failure. Consider showing a fallback "select and copy manually" path in your UI if this is likely. |
| User spam-clicks the button | Each click cancels the in-flight reset timer and schedules a new one. The success state stays visible for `copiedDuration` after the last click. |
| `value` changes while in copied state | The success label still says `copiedLabel` until the timer fires — there's no race. The next click writes the new value. |
| `variant="icon"` and no `ariaLabel` | `aria-label` falls back to `label` (default `'Copy'`). AT users hear the button name even though no visible text is rendered. |
| User has `prefers-reduced-motion: reduce` | The colour transition is removed; the icon swap and label swap are instant. |
| Clipboard API undefined (very old browser) | `navigator.clipboard?.writeText(value)` would throw; the try/catch swallows it. Same silent-failure path. |
| Page navigates away mid-copy (Promise still pending) | The `resetTimer` becomes orphaned; the component unmount cleans nothing up explicitly but the timer fires harmlessly into a destroyed component (no-op). |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`. The whole component is one async handler.
- **Browser Clipboard API** — `navigator.clipboard.writeText`. Requires a secure context (HTTPS or localhost). No fallback for old browsers — users on insecure or legacy contexts get silent failure.
- Zero other external dependencies. Native button, scoped CSS, inline icon SVGs.

## File Structure

```
src/lib/components/CopyButton.svelte    # implementation
src/lib/components/CopyButton.md        # this file (rendered inside ComponentPageShell)
src/lib/components/CopyButton.test.ts   # vitest unit tests
src/routes/copybutton/+page.svelte      # demo page
```
