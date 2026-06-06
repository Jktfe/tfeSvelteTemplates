# DataVizInspector

## What Does It Do? (Plain English)

`DataVizInspector` scores chart specifications against practical QA checks: title, rows, source, alt text, units, and legend visibility.

## How It Works (Pseudo-Code)

```text
receive chart specs
choose active chart
run chart QA checks
calculate score and verdict
render pass/review checklist
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `specs` | `DataVizSpec[]` | Required | Chart specs to inspect. |
| `title` | `string` | `"Data viz inspector"` | Heading above the inspector. |

## Dependencies

No external dependencies.
