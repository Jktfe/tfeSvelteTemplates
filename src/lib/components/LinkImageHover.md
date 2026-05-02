# LinkImageHover — Technical Logic Explainer

## What Does It Do? (Plain English)

LinkImageHover is an inline link that reveals a floating image preview when the user hovers it on a desktop or taps it once on a phone. The link itself stays a plain anchor so it inherits everything anchors get for free — keyboard navigation, screen-reader semantics, right-click "open in new tab", and the user's preferred external-link behaviour. The preview is a small thumbnail that drops in from above with a blur transition; on touch devices it stays open until the user taps it again to navigate or taps elsewhere to dismiss.

It is the kind of decoration that earns its keep on documentation pages, reference lists, and anywhere a link would benefit from a visual aside without forcing the reader off-page first.

## How It Works (Pseudo-Code)

```
state:
  isHover            = false   // desktop hover state
  showPreviewMobile  = false   // touch tap-to-preview state
  isTouchDevice      = false   // capability flag
  containerRef                 // bound DOM node for click-outside

on mount:
  isTouchDevice = matchMedia('(pointer: coarse)').matches

effect (re-runs when state changes):
  if isTouchDevice and showPreviewMobile:
    after 10ms (avoid same-tap closure):
      addEventListener(document, 'click', handleClickOutside)
    on cleanup:
      removeEventListener

on link mouseenter (desktop only via use:linkEffect):
  isHover = true

on link mouseleave (desktop only):
  isHover = false

on link click:
  if isTouchDevice and not showPreviewMobile:
    event.preventDefault()           // don't navigate yet
    showPreviewMobile = true
  // else (desktop, or mobile second-tap) → allow native navigation

on preview button click (mobile only):
  event.stopPropagation()            // don't bubble to document
  showPreviewMobile = false
  window.open(href, target)          // navigate

render:
  if (isHover and not isTouchDevice) or (showPreviewMobile and isTouchDevice):
    if isTouchDevice:
      <button onclick={handlePreviewClick}> <img in:blur /> </button>
    else:
      <img in:blur />                // not interactive on desktop
  <a href target onclick={handleLinkClick}>{ text }</a>
```

The desktop and touch paths are deliberately split because the underlying gestures differ. Hover is continuous and reversible; tap is discrete and stateful. Trying to share one path produces a worst-of-both-worlds component that double-fires on hybrid devices.

## The Core Concept: Capability-Switched Behaviour

Two media queries decide which path runs:

- `(pointer: coarse)` — true for primarily touch-driven devices (phones, most tablets). Stays false for laptops with touchscreens whose primary input is the trackpad.
- *(implicit)* hover semantics — only fire on devices that actually emit hover events.

Detection happens once on mount via `matchMedia`, and the result drives a hard fork in render and event-handling logic.

```
┌──────────────────────┐      ┌──────────────────────┐
│  (pointer: fine)     │      │  (pointer: coarse)   │
│  desktop / laptop    │      │  phone / tablet      │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           ▼                             ▼
   hover handlers fire             tap handlers fire
   isHover toggles                 showPreviewMobile toggles
   preview = <img>                 preview = <button><img></button>
   click → navigate immediately    1st tap → preview only
                                   2nd tap → navigate
                                   tap elsewhere → dismiss
```

The `linkEffect` Svelte action is how desktop hover is wired without polluting the markup. Actions are functions called once per element with `(node) => { destroy() }` semantics — perfect for adding/removing listeners deterministically.

The first-tap-prevent-default path is the trick that makes the touch UX work without wrapper buttons everywhere: the link is still a real `<a>`, but on touch devices the first tap calls `event.preventDefault()` to suppress navigation, sets state to "preview shown", and the second tap (which by that point hits a wrapping `<button>` over the image) calls `window.open(href, target)` explicitly.

## CSS Animation Strategy

The reveal uses Svelte's built-in `blur` transition rather than a custom animation. The `in:blur={{ duration: 300 }}` directive on the image runs once per mount: a fade-in plus a CSS filter blur that resolves to clarity over 300 ms. There is no `out:` transition — the image is removed instantly when state flips back, which keeps the dismissal snappy on mobile and avoids visible "stuck preview" feel.

```svelte
<img in:blur={{ duration: 300 }} … />
```

The image is absolutely positioned `bottom: 40px` (Tailwind utilities or inline style) so it sits 40 px above the link text, regardless of viewport size. Tailwind's `h-44 w-44` (the default `imageWidth`) sizes it consistently — the `imageWidth` prop is a Tailwind utility class string so consumers can adjust without writing CSS.

`rounded-lg shadow-lg` on the image and `z-50` on both the link and preview ensure the preview floats over neighbouring inline content without being clipped by overflow boundaries.

## State Flow Diagram

```
                       ┌──────────────────────┐
                       │       IDLE           │
                       │  isHover = false     │
                       │  showPreview = false │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              │ desktop hover                          │ touch first tap
              ▼                                        ▼
        ┌──────────────┐                       ┌─────────────────┐
        │  HOVER OPEN  │                       │  TAP OPEN       │
        │  preview img │                       │  preview button │
        └──────┬───────┘                       └─────┬─────┬─────┘
               │                                     │     │
   pointer leaves                            tap preview   tap outside
               │                                     │     │
               ▼                                     ▼     ▼
        ┌──────────────┐                       ┌─────────────────┐
        │   IDLE       │                       │  navigate href  │
        │   img gone   │                       │  & set IDLE     │
        └──────────────┘                       └─────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | `'https://example.com'` | URL the link points to. Standard anchor semantics. |
| `text` | `string` | `'Link Text'` | Visible link text. Inherits the host typography. |
| `imageSrc` | `string` | a Pinterest example URL | Source URL of the preview image. |
| `imageAlt` | `string` | `'Preview Image'` | Alt text — read by screen readers. Required for accessibility even though the preview is decorative. |
| `imageWidth` | `string` | `'h-44 w-44'` | Tailwind utility class string sizing the preview. Pass anything Tailwind understands (e.g. `'h-32 w-48'`). |
| `target` | `string` | `'_blank'` | Standard anchor `target`. When `_blank`, `rel="noopener noreferrer"` is added automatically. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User has `pointer: coarse` but also a mouse | The first detected primary pointer wins on mount. We honour the coarse path; users get tap-to-preview. Acceptable — hybrid devices are rare and the mobile UX is no worse than tap-to-navigate. |
| `target='_self'` | The component sets `rel` only when target is `_blank`. Same-window navigation works as a normal anchor would. |
| Image fails to load | Standard `<img>` failure — the alt text is shown. The preview button (mobile) remains tappable; consumers can wire `onerror` themselves if they need a fallback. |
| Multiple instances side by side | Each tracks its own state. Hovering one does not affect the others. Click-outside handlers are scoped per-instance via `containerRef`, so opening one preview on mobile dismisses any other. |
| User taps the preview rapidly | `stopPropagation` stops the document click-outside fire-back, so the navigation runs cleanly. The 10 ms `setTimeout` before adding the click-outside listener prevents the *opening* tap from immediately closing the preview. |
| Preview overflows the viewport edge | The preview is `position: absolute` with `bottom: 40px` from the link — it always floats up. Near the top of the viewport it can extend beyond the page edge; consumers can override positioning via CSS or wrap with their own constraints. |
| `prefers-reduced-motion: reduce` | Not specifically handled — Svelte's `blur` transition still runs at the configured 300 ms. Consumers wanting strict suppression should wrap with their own `@media` rule and override the duration to 0. |
| Component unmounts with mobile preview open | The `$effect` cleanup removes the document click listener; no leaked handler. |

## Dependencies

- **Svelte 5** — `$state`, `$props`, `$effect`, `onMount`, action syntax (`use:linkEffect`).
- **`svelte/transition`** — built-in `blur` transition for the preview reveal. No third-party animation library.
- **`$lib/types`** — `LinkImageHoverProps` interface for type safety.
- **TailwindCSS** — sizing utilities (`h-44 w-44`, `rounded-lg`, `shadow-lg`, `z-50`) drive the preview presentation. Removing Tailwind would mean porting these to scoped CSS.

## File Structure

```
src/lib/components/LinkImageHover.svelte      # implementation
src/lib/components/LinkImageHover.md          # this explainer
src/routes/linkimagehover/+page.svelte        # demo page
src/routes/linkimagehover/+page.server.ts     # SSR data load (curated link sets)
src/lib/types.ts                              # LinkImageHoverProps interface
```
