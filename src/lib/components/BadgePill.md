# BadgePill — Technical Logic Explainer

## What Does It Do? (Plain English)

BadgePill is a small rounded pill for status indicators, category tags, count badges, and removable filter chips. Three visual *variants* (solid / soft / outline) crossed with six semantic *tones* (neutral / info / success / warning / danger / brand) and three sizes give you fifty-four ready-made looks from one prop set. Optional leading dot for status indicators; optional trailing × for tag-pickers.

Think of it as the swiss-army knife of UI labels: tiny, recognisable, and shaped to fit anywhere a single piece of metadata needs to live.

## How It Works (Pseudo-Code)

```
props:
  label        = optional string
  tone         = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'
  variant      = 'solid' | 'soft' | 'outline'
  size         = 'sm' | 'md' | 'lg'
  dot          = boolean
  dismissible  = boolean
  onDismiss    = optional callback
  children     = optional snippet (overrides label)

render <span class="badge-pill badge-{tone} badge-{variant} badge-{size}"
            data-tone={tone} data-variant={variant}>
  if dot:          <span .badge-dot aria-hidden />
  if children:     {render children()}
  else if label:   <span .badge-label>{label}</span>
  if dismissible:
    <button aria-label="Dismiss"
            onclick={(e) => { e.stopPropagation(); onDismiss?.(); }}>
      ×
    </button>
</span>
```

There is no internal state, no event lifecycle beyond the dismiss click. The component is pure CSS-driven presentation.

## The Core Concept: Three Orthogonal Axes Compose 54 Looks

Most badge libraries ship dozens of pre-named variants (`badge-success`, `badge-success-outline`, `badge-success-solid-large`). BadgePill ships three orthogonal axes and lets the consumer combine them:

```
                        size
                        ┌──────────────────┐
                        │  sm    md    lg   │
        ┌───────────────┼──────────────────┤
   tone │  neutral      │   ┌─┐  ┌──┐  ┌────┐
        │  info         │   │ │  │  │  │    │     × variant ∈ {solid, soft, outline}
        │  success      │   └─┘  └──┘  └────┘
        │  warning      │
        │  danger       │
        │  brand        │
        └──────────────────────────────────┘

  3 variants × 6 tones × 3 sizes = 54 looks, one prop combination at a time
```

Each axis is independent:
- **Tone** is the *meaning* — what does this pill represent?
- **Variant** is the *visual weight* — how loud should it be?
- **Size** is the *physical scale* — how much space does it occupy?

This composition lets you keep semantics and styling separate. The same `tone="success"` is applied to a quiet outline pill in a dense table and a high-contrast solid pill on a marketing page — without invented variant names.

## Optional Status Dot

When `dot={true}`, a small leading circle is rendered using `currentColor`. Because the dot inherits the pill's foreground colour (which is set per-tone), it always matches the variant's palette automatically — no extra colour prop needed.

```
[●] Active     ← tone="success", dot=true → dot is green
[●] Pending    ← tone="warning", dot=true → dot is amber
[●] Failed     ← tone="danger",  dot=true → dot is red
```

The dot is `aria-hidden`. Colour alone never carries meaning — the label *says* "Active" or "Pending" so colour-blind and non-visual users get the same information.

## Dismiss Button Mechanics

When `dismissible={true}`, a real `<button>` is rendered as a child of the pill span. Clicking it:

1. Fires `event.stopPropagation()` so a parent click handler (e.g. on the pill itself, if it's inside a clickable card) doesn't also fire.
2. Calls `onDismiss?.()` — the component does *not* hide itself; it tells the parent to remove it from the data array.

The button is keyboard-focusable, has `aria-label="Dismiss"`, and shows a focus ring tied to `currentColor` so it's visible against any tone's background.

```svelte
<BadgePill label="Frontend" dismissible onDismiss={() => removeTag('frontend')} />
```

The parent maintains the source of truth (the tag array). The component is a leaf — it never owns the visibility decision.

## Performance

A BadgePill is the cheapest possible component: a single `<span>` with two or three optional children. There are no observers, no transitions on initial render, no derived state to recompute. You can put thousands of pills on a page (a tag cloud, a kanban view, a faceted filter list) without performance impact.

The dismiss handler is a tiny inline function created per-pill; in heavy renders consider hoisting it to a stable callback in the parent if you're seeing reconciliation cost — but in practice this is never the bottleneck.

## State Flow Diagram

```
              ┌──────────────────┐
              │  parent renders  │
              │  <BadgePill ...> │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │     VISIBLE      │
              │   (no internal   │
              │      state)      │
              └────────┬─────────┘
                       │ user clicks ×
                       │ (only if dismissible)
                       ▼
              event.stopPropagation()
              onDismiss?.()
                       │
                       ▼
              parent decides what to do
              (typically removes from array,
               causing the pill to unmount)
```

The component itself never changes state — appearance changes happen via prop updates from the parent, and removal happens via parent unmount.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Text content. Use `children` snippet for richer content. |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'brand'` | `'neutral'` | Semantic colour role. |
| `variant` | `'solid' \| 'soft' \| 'outline'` | `'soft'` | Visual weight: filled / tinted / bordered. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Pill physical size. |
| `dot` | `boolean` | `false` | Show leading status dot, coloured to match the tone. |
| `dismissible` | `boolean` | `false` | Render a trailing `×` button. |
| `onDismiss` | `() => void` | `undefined` | Fires when the `×` button is clicked. Parent removes the pill. |
| `children` | `Snippet` | `undefined` | Custom content snippet — overrides `label`. |
| `class` | `string` | `''` | Extra classes appended to the pill. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Both `label` and `children` are passed | `children` wins; `label` is ignored. Lets callers add icons or rich content alongside text. |
| Neither is passed | Pill renders empty — only the optional dot and × show. Useful for status-dot-only indicators where the surrounding context provides the meaning. |
| `dismissible` is `true` but no `onDismiss` | The `×` renders; clicks fire `stopPropagation` but no removal happens. Pair them up. |
| Tone changes dynamically | Colour palette updates immediately. The dot, label colour, and dismiss focus ring all follow because they all use `currentColor` or per-tone CSS. |
| Pill nested in a clickable parent | The dismiss button calls `event.stopPropagation()` so clicking `×` does *not* trigger the parent's click. Good. |
| User has `prefers-reduced-motion: reduce` | No animations to disable — pills don't animate by default. The hover/focus transition on `×` is removed cleanly. |
| Hundreds of pills in a tag cloud | Performance is fine. No observers or watchers per pill; pure scoped CSS. |
| Long label that wraps | The pill expands horizontally; if you don't want wrapping, set `white-space: nowrap` on the parent or constrain `max-width` on the pill via the `class` prop. |

## Dependencies

- **Svelte 5.x** — `$props`, snippets.
- Zero external runtime dependencies. Pure scoped CSS, no transitions on rest, no animations.

## File Structure

```
src/lib/components/BadgePill.svelte         # component implementation
src/lib/components/BadgePill.md             # this file (rendered inside ComponentPageShell)
src/lib/components/BadgePill.test.ts        # vitest unit tests
src/routes/badgepill/+page.svelte           # demo page
```
