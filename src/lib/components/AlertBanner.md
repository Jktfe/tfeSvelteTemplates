# AlertBanner — Technical Logic Explainer

## What Does It Do? (Plain English)

AlertBanner is an inline status notice that lives in the document flow and stays put until something on the page removes it. Use it to communicate state directly where the user is reading — a save-failed message under a form, a "trial ends in 3 days" banner above a dashboard, an empty-results note inside a filtered list. Each banner picks one of four variants — `info`, `success`, `warning`, `error` — and adopts both the right colour palette *and* the right ARIA role automatically.

Think of it as a polite Post-it note stuck to the page: visible, dismissible if you want it to be, but never floating over the rest of the UI the way a Toast does.

## How It Works (Pseudo-Code)

```
props:
  variant      = 'info' | 'success' | 'warning' | 'error'  // default 'info'
  title        = optional bold heading
  message      = optional body line
  dismissable  = boolean                                    // default false
  onDismiss    = optional callback
  children     = optional snippet (action buttons / links)

derive role:
  if variant is 'error' or 'warning': role = 'alert'        // assertive
  else:                                role = 'status'      // polite
  aria-live = role === 'alert' ? 'assertive' : 'polite'

render:
  <div role={role} aria-live={...}>
    <icon for {variant} />              // inline SVG, aria-hidden
    <body>
      {if title}    <strong>{title}</strong>
      {if message}  <p>{message}</p>
      {if children} <div class="actions">{render children}</div>
    </body>
    {if dismissable}
      <button aria-label="Dismiss" onclick={() => onDismiss?.()}>×</button>
  </div>
```

## The Core Concept: Variant → Both Colour And Role

Most banner libraries treat appearance and accessibility as two separate decisions: pass `colour="red"` and *separately* set `role="alert"`. AlertBanner ties them together because they're really the same decision in disguise. The variant is the *intent*, and intent fixes both the visual treatment and how assistive tech should announce it.

```
variant     palette                 ARIA role     aria-live
─────────────────────────────────────────────────────────────
info        blue tint               status        polite
success     green tint              status        polite
warning     amber tint              alert         assertive
error       red tint                alert         assertive
```

Why this matters: an `error` banner that's only styled red but uses `role="status"` *fails silently* for blind users — the screen reader doesn't interrupt to announce it, and they may discover the failure several minutes later when they Tab past it. Conversely, a polite "Saved!" banner with `role="alert"` rudely interrupts whatever the user was reading. Tying role to variant means the visual designer can pick `variant="error"` and the right ARIA semantics fall into place automatically.

The component implements this with a tiny `$derived`:

```
let role = $derived(variant === 'error' || variant === 'warning' ? 'alert' : 'status');
```

That's it. One line, one source of truth.

## CSS Animation Strategy

The banner mounts with a 200ms slide-in:

```css
@keyframes slide-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

`transform` and `opacity` are GPU-accelerated and don't trigger layout, so the animation stays smooth even if the banner appears in the middle of a long page. The motion is intentionally small — four pixels — because the banner is *part of the page layout*, not a floating panel. A larger entrance would imply "this is a separate UI layer" and is wrong for an inline notice.

`prefers-reduced-motion: reduce` removes the animation outright. Because the banner participates in document flow, it doesn't need a fade fallback the way a modal would — it's just *there* in the layout when the user lands.

## Distinct From ToastNotification

Both communicate state, but they answer different questions:

- **AlertBanner** lives in the page. It stays until something dismisses it. It's the right tool for *page-level* or *region-level* notices that the user should be able to come back to: form errors, trial expiry, no-results-found inside a filtered list.
- **ToastNotification** floats over the page. It's ephemeral — appearing for a few seconds and disappearing. It's the right tool for *transient confirmations* and *background events*: "Saved!", "Copied to clipboard", "Connection lost".

A useful test: if the user might want to *re-read* the message thirty seconds later, you want a banner. If the message is a confirmation that an action they just took succeeded, you want a toast.

## State Flow Diagram

```
                  ┌──────────────────┐
                  │   not rendered   │
                  └────────┬─────────┘
                           │ parent renders <AlertBanner ... />
                           ▼
                  ┌──────────────────┐
                  │  MOUNT + ANIMATE │  200ms opacity + translateY
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │     VISIBLE      │
                  │   (in flow)      │  role / aria-live announces once
                  └────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              │ user clicks ×           │ parent unmounts banner
              │ (only if dismissable)   │
              ▼                         ▼
         onDismiss?.()             ┌──────────┐
              │                    │  GONE    │
              ▼                    └──────────┘
       parent typically            (no exit animation —
       hides via state             instant removal)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Drives both colour palette *and* ARIA role. |
| `title` | `string` | `''` | Optional bold heading line. |
| `message` | `string` | `''` | Optional body text under the title. |
| `dismissable` | `boolean` | `false` | Render the `×` close button on the right. |
| `onDismiss` | `() => void` | `undefined` | Fires when the close button is clicked. Parent is responsible for unmounting. |
| `children` | `Snippet` | `undefined` | Optional snippet for action elements (links, buttons) under the message. |
| `class` | `string` | `''` | Extra classes appended to the banner. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Both `title` and `message` are empty but `children` is given | The banner still renders — the action area becomes the only content. Useful for compact action banners ("Need help? [Contact support]"). |
| `dismissable` is true but `onDismiss` is not supplied | The `×` renders and is clickable, but nothing happens visually — the banner has no internal "hidden" state, so the parent must drive removal via its own state. |
| Variant changes dynamically (e.g. info → error) | ARIA role and colour palette update reactively. Screen readers may not re-announce — assume the role at first render is what the user hears. |
| User has `prefers-reduced-motion: reduce` | The 200ms slide-in is skipped; the banner appears statically. The visual / aural cue still fires. |
| Multiple banners stacked vertically | Each fires its own announcement; aggressive variants (`error`, `warning`) may interrupt the previous polite ones. Prefer one banner per region. |
| Banner contains a focusable element via `children` | Tab order works as normal — the banner doesn't trap focus. The `×` button is the last tab stop inside the banner. |
| Long messages wrap onto multiple lines | The icon stays top-aligned with the first line via `align-items: flex-start`; the body and dismiss button sit alongside. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, snippets.
- Zero external runtime dependencies. The four icons are inline SVG, the colour palette is plain CSS, and the slide-in animation is pure CSS keyframes.

## File Structure

```
src/lib/components/AlertBanner.svelte         # component implementation
src/lib/components/AlertBanner.md             # this file (rendered inside ComponentPageShell)
src/lib/components/AlertBanner.test.ts        # vitest unit tests
src/routes/alertbanner/+page.svelte           # demo page
```
