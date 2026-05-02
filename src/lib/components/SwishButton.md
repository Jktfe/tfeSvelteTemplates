# SwishButton — Technical Logic Explainer

## What Does It Do? (Plain English)

SwishButton is a call-to-action button that puts on a tiny three-act play whenever the cursor passes over it. The original label slides off to the left and fades, a duplicate label appears from the right with a contextual icon glued to it (an arrow for normal buttons, an X for disabled, a curved arrow for resets), and a tiny dot sitting in the corner blooms outwards into a fully-coloured background. All three layers run on the same 300ms timeline, so the eye reads it as a single coordinated swoosh rather than three separate animations.

It is intentionally a *button* and nothing more — native semantics are preserved end-to-end. Tab focus, keyboard activation, disabled states, form-submit semantics, and any extra HTML attributes you spread in all behave exactly as they would on a vanilla `<button>`. The drama is layered on top.

## How It Works (Pseudo-Code)

```
on render:
  resolve props: text, type, disabled, onclick, class, ...rest
  emit <button class="group …" {onclick} {disabled} {type} {...rest}>
    layer 1 — original label:
      span: translate-x-1 (rest)
            group-hover → translate-x-12 + opacity-0 (slides out left, fades)
    layer 2 — incoming label + icon:
      div absolutely positioned
        translate-x-12 + opacity-0 (rest)
        group-hover → -translate-x-1 + opacity-100 (slides in from right)
        if disabled    → render <X-icon SVG>
        else if reset  → render <undo-icon SVG>
        else           → render <arrow-icon SVG>
    layer 3 — accent dot:
      div: 8×8 px, positioned at (20%, 40%)
            group-hover → snaps to (0%, 0%), 100%×100%, scale 1.8
            (becomes the new background)

all three layers share:
  transition-duration: 300ms
  Tailwind `group-hover:` selector so one parent state drives all three
```

The `group` Tailwind utility is the keystone here: it scopes the `:hover` state to the parent button and lets every child layer key off it. No JavaScript state, no event handlers wired to children — just declarative CSS via Tailwind's group variants.

## The Core Concept: Three Layers, One Timeline

The illusion of a single coordinated motion comes from picking transform endpoints that all complete on the same beat. Each layer uses `transition-all duration-300`, so when the parent's `:hover` flips, the browser fires three transitions in lockstep:

```
t=0ms                                t=300ms
│                                    │
├── label₁: x=4px,  α=1   ────────►  x=48px, α=0   (fade out left)
│
├── label₂: x=48px, α=0   ────────►  x=-4px, α=1   (slide in from right)
│
└── dot:    8×8 at (20%,40%), s=1   →100%×100% at (0,0), s=1.8  (background bloom)
```

Two design decisions make the gesture feel deliberate rather than busy:

- **Layer 2 starts where Layer 1 ends.** Both labels travel through the same horizontal corridor. As one exits the right edge, the other arrives at it — the eye perceives a *replacement*, not two separate slides happening in parallel.
- **The dot's expansion has nothing to do with the labels.** It is a separate spatial gesture (corner → fill) so it doesn't compete for attention. It establishes the new background so the incoming label has somewhere to land.

The dot's `scale-[1.8]` overshoot is not vanity — at scale 1.0 a `100%×100%` element exactly fills the button, but the rounded-lg radius of the dot would create a hairline gap at the corners. Scaling slightly past 100% pushes the dot's curved edge well outside the button's clipping radius, so the fill looks crisp.

## CSS Animation Strategy

Everything is Tailwind utility classes — no custom keyframes, no JavaScript, no `requestAnimationFrame`. The component is small enough that you can read every transition in the markup itself.

```html
<!-- layer 1 -->
<span class="translate-x-1 transition-all duration-300
             group-hover:translate-x-12 group-hover:opacity-0">…</span>

<!-- layer 2 -->
<div class="absolute translate-x-12 opacity-0 transition-all duration-300
            group-hover:-translate-x-1 group-hover:opacity-100">…</div>

<!-- layer 3 -->
<div class="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] transition-all duration-300
            group-hover:left-[0%] group-hover:top-[0%]
            group-hover:h-full group-hover:w-full
            group-hover:scale-[1.8]"></div>
```

`transition-all` is normally an anti-pattern (it animates every changing property, including layout-triggers like `width` and `height`), but here it is deliberate: the dot's bloom *requires* width/height to animate, and Tailwind's atomic classes mean we don't pay for transitioning properties that aren't actually changing on the other layers.

Reduced motion is delegated to Tailwind's built-in `motion-reduce:` variant pattern. The component itself does not opt-in by default — consumers can layer overrides via the `class` prop if their design system expects automatic suppression.

## State Flow Diagram

```
                       ┌─────────────────┐
                       │   REST STATE    │
                       │  label₁ visible │
                       │  label₂ off-R   │
                       │  dot small      │
                       └────────┬────────┘
                                │ pointer enters
                                ▼
                       ┌─────────────────┐
                       │  HOVER STATE    │
                       │  (300ms transit)│
                       │  label₁ slides L│
                       │  label₂ slides L│
                       │  dot blooms     │
                       └────────┬────────┘
                                │ pointer leaves
                                ▼
                       ┌─────────────────┐
                       │  REST STATE     │
                       │  (300ms reverse)│
                       └─────────────────┘

         ┌────────────────────────────────────────────┐
         │  disabled prop = true → button blocks      │
         │  pointer events; X-icon replaces arrow     │
         │  in layer 2 should hover ever fire (e.g.   │
         │  forced via class).                        │
         └────────────────────────────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'Button'` | Label rendered in both layer 1 and layer 2. |
| `class` | `string` | `''` | Extra Tailwind / custom classes appended to the button. Renamed from `class` because it is a JS reserved word. |
| `onclick` | `(e: MouseEvent) => void` | — | Standard click handler. Spread directly onto the native button. |
| `disabled` | `boolean` | `false` | Native `disabled`. Also swaps the layer 2 icon to an `X`. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type. `reset` swaps the icon to a curved-undo SVG. |
| `...rest` | `Record<string, unknown>` | — | Any other native button attributes (form, name, value, aria-*) flow through. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `disabled = true` | Hover transitions still fire if the host CSS allows them, but native pointer events are blocked so `onclick` will not run. The X-icon makes the unavailable state legible even when hovered. |
| `type = 'submit'` inside a `<form>` | Submits the form on click as a native button would. The animation does not interfere with submission timing — the click event propagates immediately. |
| `text` empty string | Both labels render empty. The dot bloom and arrow icon are still visible — the button still reads as a clickable surface. |
| Custom `class` overrides width / colour | The component uses `cn()` to merge classes, so user classes win deterministically over the defaults. Tailwind's atomic system keeps overrides predictable. |
| Very long `text` (e.g. 30 characters) | The `w-32` default width clips the label. Override with the `class` prop (`class="w-48"`) — the underlying transitions are unit-agnostic. |
| Touch devices | `:hover` activates on tap-and-hold but doesn't reliably fire on tap-release. Most platforms emit a brief synthetic hover; the animation either flashes or doesn't run. Fine for the use case (buttons still work) — don't rely on the swish to *signal* anything important. |
| `prefers-reduced-motion: reduce` | Not handled automatically. Wrap with consumer-side `motion-reduce:transition-none` in the `class` prop if your design language demands suppression. |

## Dependencies

- **Svelte 5** — `$props()` rune; `text` is read directly from props rather than a snippet slot.
- **TailwindCSS** — every animation utility (`group`, `transition-all`, `duration-300`, `group-hover:*`) is Tailwind. Removing Tailwind would require either porting the utilities to scoped CSS or accepting a static button.
- **`$lib/utils`** — `cn()` for safe class merging (a `clsx` + `tailwind-merge` style helper).
- **`$lib/types`** — `SwishButtonProps` interface keeps prop shapes consistent across consumers.
- **No icon library** — all three icons (arrow, X, undo) are inline SVG. Saves ~20–60 KB and avoids a font/CDN dependency.

## File Structure

```
src/lib/components/SwishButton.svelte         # implementation
src/lib/components/SwishButton.md             # this explainer
src/routes/swishbutton/+page.svelte           # demo page
src/lib/types.ts                              # SwishButtonProps interface
src/lib/utils.ts                              # cn() helper
```
