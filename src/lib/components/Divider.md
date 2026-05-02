# Divider — Technical Logic Explainer

## What Does It Do? (Plain English)

Divider draws a visual separator between sections of UI. Plain horizontal? It renders a native `<hr>`. With a label like "OR" between two login buttons, or as a vertical pipe between toolbar groups, it switches to a `<div role="separator">` with two flanking lines around the label. Three thicknesses, three line styles, any colour you want, and proper ARIA either way.

Think of it as a piece of punctuation for layouts — the comma between form sections, the colon between toolbar groups, the "OR" between two equally good choices.

## How It Works (Pseudo-Code)

```
state:
  orientation     ∈ { 'horizontal', 'vertical' }
  thickness       ∈ { 'thin', 'medium', 'thick' }      // 1 / 2 / 4 px
  lineStyle       ∈ { 'solid', 'dashed', 'dotted' }
  label           = '' or any string
  labelPosition   ∈ { 'left', 'center', 'right' }
  colour          = optional CSS colour string
  decorative      = boolean — when true, hide from AT entirely
  children        = optional snippet that overrides label

derive:
  hasLabel    = Boolean(label || children)
  customStyle = colour ? `--divider-colour: ${colour};` : ''

render:
  if orientation === 'horizontal' AND not hasLabel:
    <hr class="divider divider-h divider-{thickness} divider-{lineStyle}">
    // Browsers expose role="separator" automatically — free ARIA.

  else if orientation === 'horizontal' AND hasLabel:
    <div role="separator" class="divider-with-label divider-label-{labelPosition}">
      <span class="divider-line ... divider-line-start"></span>
      <span class="divider-label">{children ?? label}</span>
      <span class="divider-line ... divider-line-end"></span>
    </div>

  else (vertical):
    <div role="separator" aria-orientation="vertical"
         class="divider divider-v divider-{thickness} divider-{lineStyle}">

  if decorative:
    add aria-hidden="true" to the rendered element AND drop role="separator".
```

There is no `$effect`, no observer, no JS-side state at all — Divider is a pure render function plus a couple of derived values. The "logic" is choosing between three render paths.

## The Core Concept: Three Render Paths, One Component

Most divider components reach for `<hr>` and try to bolt a label on with `::before` / `::after` pseudo-elements. That works visually but the result is a mess of overlapping text-on-a-line that screen readers find confusing. Divider sidesteps this by branching on whether there's a label.

```
input                         output
─────────────────────────     ──────────────────────────────────────
horizontal, no label          <hr role="separator" (implicit)>
horizontal, label             <div role="separator">
                                <span line/><span label/><span line/>
                              </div>
vertical                      <div role="separator"
                                   aria-orientation="vertical">
decorative=true               aria-hidden="true"; role removed
```

Three concrete benefits:

1. **Semantic correctness for free.** The `<hr>` path uses the browser's built-in `role="separator"`. No extra ARIA, no fight with assistive tech.
2. **Real label rendering.** When a label is present the spans use flexbox (`flex: 1` on each line) rather than absolutely-positioned pseudo-elements. The label can be any text length, can wrap, can be a snippet (e.g. an icon), and the lines on either side reflow correctly.
3. **Decorative escape hatch.** When the divider is purely visual — say, a dashed flourish under a heading — `decorative={true}` strips the separator role and adds `aria-hidden`, so AT skips it. The visual output is identical; the ARIA tree is cleaner.

### Label-position trick

```css
.divider-label-left  .divider-line-start { flex: 0 0 1.5rem; }
.divider-label-right .divider-line-end   { flex: 0 0 1.5rem; }
```

The default has both flanking lines at `flex: 1`, so the label sits dead-centre. To shove the label left, the **left** line is pinned to a fixed 1.5 rem and the right line keeps `flex: 1` — it absorbs the rest of the width. Mirror image for `right`. Two lines of CSS replace what otherwise needs a Grid template.

## Colour Theming via CSS Custom Property

Every line — `<hr>`, the two flanking spans, the vertical bar — reads its colour from a single custom property:

```css
:global(:root) { --divider-colour: #e2e8f0; }

hr.divider-thin            { border-top: 1px solid var(--divider-colour); }
.divider-line.divider-thin { border-top: 1px solid var(--divider-colour); }
.divider-v.divider-thin    { border-left: 1px solid var(--divider-colour); }
```

When a caller passes `colour="#146ef5"`, the component writes `style="--divider-colour: #146ef5;"` on the wrapper. The custom property cascades to every internal element automatically — no per-element style override, no conditional class.

That cascading also means a parent can set `--divider-colour` on a section and every Divider inside picks it up without any prop drilling — a useful pattern for dark-mode themes.

## State Flow Diagram

```
   ┌────────────────────────────────────┐
   │  props in                          │
   │  - orientation                     │
   │  - thickness, lineStyle            │
   │  - label / children                │
   │  - colour, decorative              │
   └─────────────────┬──────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │  hasLabel?       │
            └────────┬─────────┘
                     │
       ┌─────────────┴───────────────┐
       │                             │
       ▼                             ▼
   ┌────────────────────┐      ┌──────────────────────┐
   │  horizontal +      │      │  horizontal + label  │
   │  no label?         │      │  → <div role=        │
   │  → <hr>            │      │    "separator">      │
   │  (free ARIA)       │      │    + 3 spans         │
   └────────────────────┘      └──────────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │  vertical?       │
            │  → <div          │
            │    role=         │
            │    "separator"   │
            │    aria-         │
            │    orientation=  │
            │    "vertical">   │
            └──────────────────┘

   decorative=true ──▶ role removed, aria-hidden=true added
                       (applies to whichever branch was taken)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction of the separator. |
| `thickness` | `'thin' \| 'medium' \| 'thick'` | `'thin'` | Line weight (1 / 2 / 4 px). |
| `lineStyle` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | CSS `border-style` for the line. |
| `label` | `string` | `''` | Visible label text. Omit for a plain line. |
| `labelPosition` | `'left' \| 'center' \| 'right'` | `'center'` | Where the label sits along the line. |
| `colour` | `string` | `'#e2e8f0'` | Any CSS colour value. Sets `--divider-colour` on the wrapper. |
| `decorative` | `boolean` | `false` | When true, hides from assistive tech (`aria-hidden`, no separator role). |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | — | Custom label content (overrides `label`). Useful for icon labels. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `label` and `children` both provided | `children` wins — the snippet renders, the string is ignored. |
| `decorative={true}` and label present | The separator role is dropped and `aria-hidden="true"` is set. Screen readers skip it entirely; the visual output is unchanged. |
| `colour` set on a parent via `style="--divider-colour: red"` | The Divider inherits the colour without any prop being passed. Useful for theming sections. |
| `orientation="vertical"` inside a non-flex container | The bar has `min-height: 1rem` so it shows up even with no parent height; otherwise it would collapse to zero. Use a flex parent for full-height bars. |
| `labelPosition="left"` with a long label | The left flanking line stays at 1.5 rem; the right line expands to fill. The label can wrap if the container narrows enough. |
| `thickness="thick"` with `lineStyle="dotted"` | Renders as 4 px dotted — browsers handle the dot spacing automatically. |
| Used inside a `flex` row without `align-self: stretch` on the vertical variant | The bar has `align-self: stretch` baked in; it'll always match the row height. |

## Dependencies

- **Svelte 5.x** — `$props` and `$derived` for the small amount of conditional rendering. No effects, no lifecycle.
- Zero external dependencies — pure CSS, no JS animation, no icon library.

## File Structure

```
src/lib/components/Divider.svelte         # implementation
src/lib/components/Divider.md             # this file
src/lib/components/Divider.test.ts        # vitest unit tests
src/routes/divider/+page.svelte           # demo page
```
