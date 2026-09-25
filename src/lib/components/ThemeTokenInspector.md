# ThemeTokenInspector

## What Does It Do? (Plain English)

`ThemeTokenInspector` is a live reference panel for the convention in `docs/THEMING.md`: chrome flips, brand stays, semantic stays. It groups known theme tokens, lets maintainers preview light and dark values, shows swatches with a contrast-ish readability label, and produces copyable CSS override snippets.

## How It Works (Pseudo-Code)

```text
receive token rows or use the default theming rows
group rows by chrome / brand / semantic
pick preview mode: light or dark
for each visible token:
  resolve the preview value
  render light, dark, and active swatches
  compare active value against the preview surface
generate CSS grouped by selector
copy snippets through the native clipboard API
```

## State Flow Diagram

```text
defaultThemeTokenRows
  -> groupTokenRows()
  -> active category filter
  -> tokenValueForMode()
  -> swatches + contrastLabel()
  -> cssOverrideSnippet()
  -> copy button
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `ThemeTokenRow[]` | `defaultThemeTokenRows` | Token metadata to inspect. |
| `title` | `string` | `"Theme token inspector"` | Heading shown in the panel. |
| `initialMode` | `"auto" \| "light" \| "dark"` | `"auto"` | Starting preview mode. `auto` mirrors the viewer's OS colour scheme until they press Light or Dark. |

## Helper Exports

| Export | Description |
| --- | --- |
| `groupTokenRows(rows)` | Returns chrome, brand, and semantic row arrays. |
| `resolvePreviewMode(chosen, systemPrefersDark)` | Returns the live preview mode: an explicit Light/Dark pick wins, otherwise the OS colour scheme. |
| `tokenValueForMode(row, mode)` | Resolves the active token value, falling back to light when dark is intentionally stable. |
| `flipsInDark(row)` | Reports whether a token changes in dark mode. |
| `hexToRgb(value)` | Parses `#rrggbb` colors for testable color math. |
| `relativeLuminance(value)` | Computes WCAG-style luminance for hex colors. |
| `contrastRatio(foreground, background)` | Computes a numeric contrast ratio. |
| `contrastLabel(value, mode)` | Returns a high / ok / low / n/a label for the preview surface. |
| `cssOverrideSnippet(rows, mode)` | Builds grouped CSS override snippets by selector. |

## Theming

The panel's own chrome uses `--tti-*` tokens on `.tti`. With `initialMode="auto"` (the default) the `.tti-auto` class lets `@media (prefers-color-scheme: dark)` flip those tokens from the very first paint, so the inspector matches the page with no flash of light chrome. Pressing **Light** or **Dark** pins the preview: **Dark** adds `.tti-dark`, **Light** removes both classes and keeps the inline light defaults, whatever the OS says. The swatch preview, contrast labels, and copyable snippets follow the same resolved mode (`resolvePreviewMode(chosen, systemPrefersDark)`).

| Property | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--tti-bg` / `--tti-panel` / `--tti-panel-strong` | `#ffffff` / `#f8fafc` / `#f1f5f9` | `#111827` / `#172033` / `#1f2937` | Surfaces |
| `--tti-fg` / `--tti-muted` / `--tti-code` | `#111827` / `#64748b` / `#0f172a` | `#f9fafb` / `#a7b3c6` / `#eef2ff` | Text |
| `--tti-border` / `--tti-accent` | `#dbe3ef` / `#315f9f` | `#334155` / `#8bb8ff` | Borders, active state |
| `--tti-swatch-border` / `--tti-swatch-stripe` / `--tti-shadow` | slate alphas | light alphas | Swatch outlines, "stable" stripe, panel shadow |
| `--tti-kind-*` / `--tti-tone-*` | `#315f9f`, `#9a3412`, `#047857`, `#b91c1c` | lighter tints of the same hues | Kind badges and contrast labels |

The kind and tone labels are semantic: they keep their hue family on both schemes and only lighten for legibility on dark panels.

This component exists to explain the repository-wide token rule:

| Kind | Dark behavior | Examples |
| --- | --- | --- |
| Chrome | Flips in dark mode. | `--tooltip-bg`, `--kbd-border`, `--rating-star-empty` |
| Brand | Stays stable unless consumers explicitly opt in. | `--rating-star-filled`, `--fill-color`, `--accent` |
| Semantic | Stays stable because color carries state meaning. | `--success`, `--warning`, `--error`, `--info` |

Override examples use direct selectors such as `body .kbd.kbd` because component-scoped CSS variables are declared on the component root. See `docs/THEMING.md` for the specificity rationale.

## Edge Cases

- Tokens without a `dark` value are treated as intentionally stable.
- Contrast labels are a quick surface-read cue, not a full accessibility audit for every component state.
- Non-hex colors return `N/A` from contrast helpers so generated snippets can still render.
- Dark snippets for flipping chrome tokens use a `.dark` selector shape to make manual mode overrides easy to copy.

## Dependencies

No external dependencies. Clipboard behavior uses `navigator.clipboard` when available.

## File Structure

```text
src/lib/components/ThemeTokenInspector.svelte
src/lib/components/ThemeTokenInspector.test.ts
src/lib/components/ThemeTokenInspector.md
src/routes/themetokeninspector/+page.svelte
```
