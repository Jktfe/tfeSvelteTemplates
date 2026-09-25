# TokenSwatchGrid - Technical Logic Explainer

## What Does It Do? (Plain English)

TokenSwatchGrid lays out a design system's colour tokens as swatch cards grouped into **chrome**, **brand** and **semantic** columns. Each card shows the colour, its CSS custom-property name, a friendly name, a usage note and a quick contrast label (AA, Review or Unknown). It sits naturally before or beside `ThemeTokenInspector` when a team needs to review the actual token inventory.

**Think of it like:** the paint-chart wall at a decorating shop — every colour on its own chip, sorted by family, with a note on the back about where it works best.

---

## How It Works (Pseudo-Code)

```
INPUTS:
  tokens: TokenSwatch[]    # { name, value, group, usage, foreground? }

DERIVED:
  groups = groupTokenSwatches(tokens)
           → { chrome: [...], brand: [...], semantic: [...] }  (source order kept)

RENDER for group in ['chrome', 'brand', 'semantic']:
  <section aria-labelledby="{group}-tokens">
    FOR token in groups[group]:
      swatch background = token.value
      swatch text       = token.foreground ?? '#111827'
      friendly name     = readableTokenName(token.name)   # '--brand-accent' → 'brand accent'
      ratio             = contrastRatio(token.value, token.foreground)
      label             = tokenContrastLabel(ratio)       # 'AA' | 'Review' | 'Unknown'
```

---

## The Core Concept: WCAG Contrast in Twenty Lines

`contrastRatio(background, foreground)` implements the WCAG 2.x formula with no dependencies:

```
1. Parse both colours as 6-digit hex → [r, g, b]   (anything else → undefined)
2. Linearise each channel:
     c = channel / 255
     c ≤ 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4
3. Relative luminance L = 0.2126 R + 0.7152 G + 0.0722 B
4. ratio = (L_lighter + 0.05) / (L_darker + 0.05)      → rounded to 2 dp
```

`tokenContrastLabel(ratio)` then turns the number into a review cue:

| Ratio | Label | Meaning |
|-------|-------|---------|
| `≥ 4.5` | `AA` | Passes WCAG AA for normal body text. |
| `< 4.5` | `Review` | Might still be fine for large text or decoration — check its usage. |
| `undefined` | `Unknown` | The value is not a 6-digit hex (for example `rgb()`, `oklch()`, a `var()` or 3-digit hex). |

### Exported helpers

| Export | Purpose |
|--------|---------|
| `readableTokenName(name)` | Strips the leading `--` and turns dashes into spaces. |
| `contrastRatio(background, foreground?)` | WCAG ratio against `foreground` (defaults to `#111827`), or `undefined`. |
| `tokenContrastLabel(ratio)` | Maps a ratio to `'AA'`, `'Review'` or `'Unknown'`. |
| `groupTokenSwatches(tokens)` | Buckets tokens by `group`, always returning all three keys. |

---

## State Flow Diagram

TokenSwatchGrid is stateless — everything is derived from `tokens`:

```
   tokens prop ──▶ groupTokenSwatches ──▶ { chrome | brand | semantic }
                                                   │
                                                   ▼  per token
                                   ┌───────────────────────────────────┐
                                   │ readableTokenName(name)           │
                                   │ contrastRatio(value, foreground)  │──▶ swatch card
                                   │ tokenContrastLabel(ratio)         │
                                   └───────────────────────────────────┘

   tokens change ──▶ $derived regroups ──▶ cards re-render
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tokens` | `TokenSwatch[]` | — (required) | Tokens with `name`, `value`, `group` (`'chrome' \| 'brand' \| 'semantic'`), `usage` and optional `foreground`. |
| `title` | `string` | `'Token swatch grid'` | Heading above the swatches. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| A group has no tokens | Its heading still renders with an empty swatch row. |
| `value` is `rgb()`, `oklch()`, `var(--x)` or 3-digit hex | The swatch still paints (CSS understands it) but the label reads `Unknown`. |
| `foreground` omitted | Contrast is measured against `#111827` and the swatch text uses it. |
| Two tokens share a `name` | Names are keys within a group — keep them unique. |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$derived`, `$props`) and scoped CSS.

---

## File Structure

```
src/lib/components/TokenSwatchGrid.svelte     # implementation + exported contrast helpers
src/lib/components/TokenSwatchGrid.md         # this file (rendered inside ComponentPageShell)
src/lib/components/TokenSwatchGrid.test.ts    # vitest unit tests
src/routes/tokenswatchgrid/+page.svelte       # demo page
```
