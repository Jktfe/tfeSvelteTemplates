# EmptyState — Technical Logic Explainer

## What Does It Do? (Plain English)

EmptyState is the friendly "nothing here yet" placeholder that turns a blank region into a useful, communicative one. Drop it into an empty inbox, a search with no results, an onboarding panel that hasn't been filled out — anywhere a section of your UI has nothing to render — and it gives the user three things at once: a visual cue (icon), a clear sentence about *why* it's empty, and an optional path forward (a CTA).

Think of it as the UI equivalent of a courteous shop assistant noticing you can't find what you're looking for, and offering directions.

## How It Works (Pseudo-Code)

```
props:
  title       = string heading (optional)
  size        = 'sm' | 'md' | 'lg'           // default 'md'
  variant     = 'default' | 'card' | 'minimal'  // default 'default'
  icon        = optional snippet
  description = optional snippet
  action      = optional snippet
  class       = extra classes

render <section role="status" aria-live="polite">
  if icon:        <div class="empty-icon">{render icon}</div>
  if title:       <h3 class="empty-title">{title}</h3>
  if description: <p  class="empty-description">{render description}</p>
  if action:      <div class="empty-action">{render action}</div>
</section>
```

There is no internal state, no event handling, no effect. The component is purely presentational — its job is to lay out the four canonical pieces of an empty state in a consistent, accessible way.

## The Core Concept: Three Sizes × Three Variants As Composable Surface Treatments

EmptyState exists in nine layout combinations from a tiny prop set. The clever bit is that **size** and **variant** address two orthogonal axes:

```
                size=sm                  size=md                  size=lg
              ┌──────────┐             ┌──────────┐             ┌──────────┐
default       │ dashed   │             │ dashed   │             │ dashed   │
              │ box, sm  │             │ box, md  │             │ box, lg  │
              └──────────┘             └──────────┘             └──────────┘

card          │ solid    │             │ solid    │             │ solid    │
              │ shadow,  │             │ shadow,  │             │ shadow,  │
              │ sm       │             │ md       │             │ lg       │

minimal       │ no chrome│             │ no chrome│             │ no chrome│
              │ sm       │             │ md       │             │ lg       │
```

- **Size** controls vertical breathing room and the icon/title/description font scales. `sm` is for inline messages inside a list, `md` is the default card-sized empty state, `lg` fills a dashboard-sized region.
- **Variant** controls the surface chrome. `default` adds a dashed border (signals "this is a placeholder"), `card` adds a solid panel (looks like a real piece of UI), `minimal` strips chrome (lets the parent layout breathe).

Pick one of each, and you get the right empty state for the context. Same icon, title, and message — different visual weight.

## Snippet-Driven Slots

The icon, description, and action are *snippets*, not strings. This is deliberate: an icon could be an emoji, a SVG, an `<img>`, or a full sub-component. A description could be a sentence with bold text or a link. An action could be a single button or a row of two.

```
<EmptyState title="No results">
  {#snippet icon()}🔍{/snippet}
  {#snippet description()}
    Try a different term — see <a href="/help">search tips</a>.
  {/snippet}
  {#snippet action()}
    <button onclick={clearFilters}>Clear filters</button>
    <button onclick={resetSearch}>Start over</button>
  {/snippet}
</EmptyState>
```

By using snippets rather than `iconHtml` strings or `IconComponent` props, EmptyState avoids two trapdoors: it never needs to dangerously inject HTML, and it never needs to take a prop type for "anything renderable". The Svelte 5 snippet primitive does both safely.

## Accessibility Notes

The wrapper is a `<section>` with `role="status"` and `aria-live="polite"`. When EmptyState appears (e.g. after the user applies a filter that returns zero results), screen readers announce its content politely — the title, then the description.

The icon is `aria-hidden="true"` because it's purely decorative. If the icon carried meaning the title doesn't (rare in practice), the caller can omit `aria-hidden` from inside the snippet.

The title uses `<h3>`, which assumes the page has an `<h1>`/`<h2>` higher up. If the empty state is the *only* content on the page (very rare), use a wrapping component that renders an `<h1>`.

Action buttons in the action snippet are normal interactive controls — they're keyboard-focusable and announce themselves the way buttons always do. EmptyState doesn't try to manage focus; the user reaches the CTA via Tab.

## Distinct From SkeletonLoader

These two answer related but distinct questions:

- **SkeletonLoader** is for "we have data on the way, here's a placeholder of its shape so the layout doesn't jump when it arrives". Used during loading.
- **EmptyState** is for "the data has arrived, and there isn't any". Used after loading.

If your fetch hasn't returned, use SkeletonLoader. If your fetch returned an empty array, use EmptyState. They often appear in the same component, behind different conditions:

```
{#if loading}
  <SkeletonLoader shape="rect" height="200px" />
{:else if items.length === 0}
  <EmptyState title="No items" ... />
{:else}
  <ItemList {items} />
{/if}
```

## State Flow Diagram

```
       Parent decides to show empty state
                    │
                    │  (e.g. items.length === 0)
                    ▼
            ┌─────────────────┐
            │   EmptyState    │
            │   renders       │
            │  role="status"  │
            └────────┬────────┘
                     │ aria-live="polite"
                     ▼
        Screen reader announces:
        "<title>. <description>."
                     │
                     │ user taps action button (if present)
                     ▼
            Action handler runs
            (parent unmounts EmptyState
             once data arrives or the
             empty condition resolves)
```

EmptyState has no internal states — it is always either rendered or not, and the parent decides.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `''` | Bold heading line. Empty string skips the `<h3>`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Drives vertical padding and font sizes. |
| `variant` | `'default' \| 'card' \| 'minimal'` | `'default'` | Surface chrome — dashed, solid, or none. |
| `icon` | `Snippet` | `undefined` | Leading visual. Emoji, SVG, `<img>`, anything. |
| `description` | `Snippet` | `undefined` | Body copy under the title. May contain inline links. |
| `action` | `Snippet` | `undefined` | CTA region — typically one or two buttons. |
| `class` | `string` | `''` | Extra classes appended to the section. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| All snippets and `title` are empty | Renders an empty `<section>` with chrome but no content. Looks like an empty card — not useful, but not broken. The component never errors. |
| Description contains a focusable link | Tab order is normal — the link is reachable and announced. EmptyState does not steal or trap focus. |
| Multiple action buttons in the action snippet | Both render side-by-side; CSS stacks them with a small gap. Authors are responsible for visual hierarchy (primary vs. secondary). |
| User has `prefers-reduced-motion: reduce` | Nothing changes — EmptyState has no animations to disable. |
| EmptyState appears repeatedly as filters change | Each appearance triggers a fresh `aria-live` announcement. Aggressive filter changes can produce chatty announcements; consider debouncing the parent. |
| `variant="minimal"` inside a parent that already has a border | Use this combination deliberately — the minimal variant strips chrome so the parent can supply it. Avoids double-bordering. |
| Icon snippet renders a large image | The icon container has no max-size; the image will set the layout. Constrain the image inside the snippet (`width: 64px;`) if you need a fixed size. |

## Dependencies

- **Svelte 5.x** — `$props`, snippets. Renders entirely from props.
- Zero external runtime dependencies. Pure scoped CSS.

## File Structure

```
src/lib/components/EmptyState.svelte         # component implementation
src/lib/components/EmptyState.md             # this file (rendered inside ComponentPageShell)
src/lib/components/EmptyState.test.ts        # vitest unit tests
src/routes/emptystate/+page.svelte           # demo page
```
