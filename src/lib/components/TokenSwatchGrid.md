# TokenSwatchGrid

## What Does It Do? (Plain English)

`TokenSwatchGrid` displays theme tokens as grouped swatches with usage notes and quick contrast labels. It is useful before or beside `ThemeTokenInspector` when teams need to review the actual design-token inventory.

## How It Works (Pseudo-Code)

```text
receive token swatches
group tokens by chrome, brand, semantic
calculate optional contrast ratio
render color cards with token name, value, usage, and label
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tokens` | `TokenSwatch[]` | Required | Token definitions with name, color value, group, and usage. |
| `title` | `string` | `"Token swatch grid"` | Heading above the swatches. |

## Dependencies

No external dependencies.
