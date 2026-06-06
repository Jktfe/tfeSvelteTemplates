# InteractionLab

## What Does It Do? (Plain English)

`InteractionLab` lets teams review hover, press, drag, and keyboard interaction scenarios with timing, easing, risk, and reduced-motion readiness.

## How It Works (Pseudo-Code)

```text
receive interaction scenarios
choose active scenario
toggle reduced-motion preview
derive readiness note from mode, timing, and risk
render a stage plus scenario controls
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scenarios` | `InteractionScenario[]` | Required | Interaction scenarios with mode, duration, easing, and risk. |
| `title` | `string` | `"Interaction lab"` | Heading above the lab. |

## Dependencies

No external dependencies.
