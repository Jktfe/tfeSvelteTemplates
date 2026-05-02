# ToastNotification — Technical Logic Explainer

## What Does It Do? (Plain English)

ToastNotification is a global, non-blocking alert system. You mount one container in your root layout, then call `addToast({ message, severity })` from anywhere — a button handler, a fetch error path, a server action — and a small card slides in at the corner of the screen, lives for a few seconds, and silently goes away. Multiple toasts stack up; users can dismiss them with `×`, with `Escape`, or by clicking the optional action button.

Think of it as a dispatcher and a bulletin board: anything in your app can drop a message on the board, and the board takes care of styling, stacking, announcing to assistive tech, and tidying up after itself.

## How It Works (Pseudo-Code)

```
module-level singleton state:
  toastState.stack = []                  // array of active toasts (Svelte 5 $state)

addToast(toast):
  id = toast.id or random-string
  newToast = merge(toast, sensible defaults)
  push newToast onto toastState.stack
  if newToast.duration > 0:
    schedule setTimeout → dismissToast(id) after duration ms
  return id

dismissToast(id):
  index = stack.findIndex by id
  if found: splice it out of stack

container component:
  derive displayedToasts = stack.slice(-maxVisible)   // newest N

  on Escape key (window):
    if displayedToasts non-empty and last is dismissible:
      dismissToast(last.id)

  for each toast in displayedToasts:
    role = toast.severity == 'error' ? 'alert' : 'status'
    aria-live = error ? 'assertive' : 'polite'
    render with severity icon, message, optional action button, optional ×
    on action click: run callback, then dismissToast(id)
    on × click: dismissToast(id)
```

## The Core Concept: A Module-Level Singleton

The whole point of a toast system is that *anyone* can fire a toast without prop drilling, context wiring, or import gymnastics. The component achieves that with a Svelte 5 trick that's easy to miss: **state declared at module scope inside a `.svelte.ts` file is shared across the whole app**.

```
src/lib/toast.svelte.ts
  ↓
  export const toastState = $state({ stack: [] })   // ONE instance, shared everywhere
  export function addToast(...) { toastState.stack.push(...) }
  export function dismissToast(id) { ... }
```

Any component, server-action result handler, or utility module that imports `addToast` mutates the same array. The `<ToastNotification />` container also imports `toastState` and reads `stack` reactively — so a push from anywhere triggers a re-render exactly where it needs to.

The `.svelte.ts` extension is what unlocks rune syntax outside of components. Without it, `$state(...)` would be a syntax error.

This is a *singleton by file*, not a singleton by class. There's no `getInstance()`, no provider, no React-style context. Module identity is the lock.

## Auto-Dismiss Lifecycle

Each toast stores its dismiss schedule as a `setTimeout`. When `addToast` runs:

1. The toast is appended to `stack` immediately — the user sees it on the next tick.
2. If `duration > 0`, a `setTimeout(() => dismissToast(id), duration)` is scheduled.
3. When the timer fires, `dismissToast` looks the entry up by id and splices it out.

A few subtle properties fall out of this design:

- **`duration: 0` makes a toast sticky.** No timer is scheduled, so it stays until the user dismisses it (or the page unloads). Useful for "this connection failed, please reconnect" alerts that the user *must* see.
- **Manual dismiss races safely.** If the user clicks `×` before the timer fires, the toast is removed from the stack; when the late timer eventually fires, `findIndex` returns `-1` and `dismissToast` is a no-op. No exception, no double-removal.
- **Pause-on-hover is intentionally absent.** Browser timers keep ticking under the cursor; we accept that toasts may dismiss during a hover read because the alternative — pausing/resuming hundreds of timers — adds complexity for a marginal UX win.

## XSS Protection

The toast `message` string is interpolated as text content (`{toast.message}`), not as HTML. Svelte's `{...}` interpolation escapes by default, so a message of `"<script>alert(1)</script>"` renders literal angle brackets — never executed. The action label is the same.

The severity icons are SVG path strings stored in a constant inside the component, not user-supplied, so there's no `{@html}` boundary to defend.

## CSS Animation Strategy

Each toast slides into place using Svelte's built-in `fly` and `fade` transitions:

```
in:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 300 }}
out:fade={{ duration: 200 }}
```

Top-anchored stacks fly *down* into view (the Y offset is negative, so they start above the final position). Bottom-anchored stacks fly *up*. The vertical gap and `flex-direction: column-reverse` for bottom positions keep newest toasts always closest to the screen edge.

The `pointer-events: none` on the container is critical. Without it, the invisible 400-px-wide column the container occupies would block clicks on whatever sits underneath (a navbar, a dropdown). Each toast then re-enables pointer events on itself with `pointer-events: auto`. The result: the user can click straight through the empty space, but interact with any visible toast.

`prefers-reduced-motion: reduce` zeroes out both the slide and the fade — toasts pop in and out without motion cues. The text-only severity colour border and live region announcement still convey the toast's meaning.

## State Flow Diagram

```
                ┌──────────────────┐
                │  caller invokes  │
                │   addToast(...)  │
                └────────┬─────────┘
                         │
                         ▼
              ┌────────────────────┐
              │ push to            │
              │ toastState.stack   │
              │ schedule timeout   │
              └────────┬───────────┘
                       │ reactive update
                       ▼
              ┌────────────────────┐
              │  TOAST VISIBLE     │
              │  in container      │
              │  (last maxVisible) │
              └────────┬───────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │ click ×      │ click action │ Escape key   │ timer fires
        │              │              │              │
        ▼              ▼              ▼              ▼
              ┌────────────────────┐
              │  dismissToast(id)  │
              │  splice from stack │
              └────────┬───────────┘
                       │
                       ▼
                  ┌─────────┐
                  │  GONE   │
                  └─────────┘
```

## Props Reference

### Container (`<ToastNotification />`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Screen corner where toasts stack. |
| `maxVisible` | `number` | `5` | Maximum number of toasts shown simultaneously; older ones drop off the back. |
| `offsetY` | `string` | `'1rem'` | Vertical inset from the chosen edge — bump it up to clear sticky navbars. |
| `offsetX` | `string` | `'1rem'` | Horizontal inset from the chosen edge. |
| `class` | `string` | `''` | Extra classes appended to the container. |

### `addToast(data: ToastData)`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `message` | `string` | required | Text body shown in the toast. |
| `severity` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Drives the icon, accent stripe, and ARIA role. |
| `duration` | `number` | `5000` | Milliseconds before auto-dismiss; `0` disables auto-dismiss. |
| `dismissible` | `boolean` | `true` | Render the `×` close button. |
| `action` | `{ label: string; onclick: () => void }` | `undefined` | Optional inline button — clicking runs the callback then dismisses. |
| `id` | `string` | random | Caller-supplied id. Useful when you want to dedupe by passing the same id again. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Caller fires the same toast id twice in quick succession | Both push onto the stack — there is no de-dupe by id at the API layer. Pass a stable id and dismiss the previous one yourself if dedupe matters. |
| `duration: 0` and the user never dismisses | The toast persists for the lifetime of the page; nothing leaks because the entry sits in a single in-memory array. |
| The user clicks `×` before the auto-dismiss timer fires | The entry is removed immediately; when the timer eventually fires, `findIndex` returns `-1` and `dismissToast` exits without throwing. |
| More than `maxVisible` toasts queue up | Only the newest `maxVisible` render. Older entries remain in `stack` but aren't visible. They still auto-dismiss on their own timers. |
| `severity: 'error'` is fired | The toast is rendered with `role="alert"` and `aria-live="assertive"` so screen readers interrupt to announce it; other severities are `role="status"` / `aria-live="polite"`. |
| Escape pressed with multiple visible toasts | Only the most recent dismissible toast is closed. Press again to keep dismissing from the newest. |
| `prefers-reduced-motion: reduce` is set | Slide-in / fade-out animations are removed; toasts appear and disappear instantly. |
| Container mounted twice (e.g. nested layouts) | Both render the same `toastState.stack` — every toast appears in both places. Mount the container once at the root. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, snippets, and especially the rune-enabled `.svelte.ts` module that backs the singleton.
- **`svelte/transition`** — built-in `fly` and `fade` transitions for slide-in / fade-out.
- Zero external runtime dependencies. Severity icons are inline SVG paths.

## File Structure

```
src/lib/components/ToastNotification.svelte    # container component
src/lib/components/ToastNotification.md         # this file (rendered inside ComponentPageShell)
src/lib/toast.svelte.ts                         # module-level state + addToast/dismissToast API
src/lib/types.ts                                # ToastData, ToastSeverity, ToastPosition, ToastNotificationProps
src/routes/toastnotification/+page.svelte       # demo page
```
