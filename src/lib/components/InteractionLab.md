# InteractionLab - Technical Logic Explainer

## What Does It Do? (Plain English)

InteractionLab is a review bench for micro-interactions. Teams list their hover, press, drag and keyboard scenarios with a duration, an easing curve and a risk level; the lab lets you pick one, feel it on a live target, flip a reduced-motion preview, and read a one-line readiness note ("Ready", "Review timing", "Needs pointer edge-case tests" or "Needs reduced-motion fallback"). A footer counts how many scenarios exist per mode.

**Think of it like:** a test kitchen for motion. Each recipe gets cooked on the stove in front of you, and the head chef leaves a sticky note saying whether it is ready for the menu.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. RECEIVE scenarios (InteractionScenario[])
  2. activeId = '' ; reducedMotion = false
  3. EFFECT: IF no activeId AND scenarios exist → activeId = scenarios[0].id

DERIVED:
  active = scenario with id == activeId, else scenarios[0]
  counts = modeCount(scenarios)                 # { hover, press, drag, keyboard }

RENDER stage for active:
  --duration = reducedMotion ? 80ms : clampDuration(durationMs)   # 80..1200ms
  --ease     = scenario.easing
  target class il-target--{mode}                # CSS decides the transform on hover/focus
  note       = motionReadiness(active, reducedMotion)

ON scenario button click → activeId = scenario.id
ON "Reduced motion" toggle → reducedMotion = !reducedMotion
```

---

## The Core Concept: Readiness Rules

`motionReadiness(scenario, reducedMotion)` is a pure function that returns the first rule that fires:

```
1. reducedMotion AND durationMs > 0        → "Needs reduced-motion fallback"
2. mode == 'drag' AND risk != 'low'        → "Needs pointer edge-case tests"
3. durationMs > 700                        → "Review timing"
4. otherwise                               → "Ready"
```

The order is deliberate: accessibility first (anything that moves needs a reduced-motion plan), then input risk (drag interactions break in the most creative ways), then feel (anything longer than 700ms starts to feel sluggish for direct manipulation).

### Exported helpers

| Export | Purpose |
|--------|---------|
| `clampDuration(ms)` | Rounds and clamps a duration to 80–1200ms for the preview. |
| `motionReadiness(scenario, reducedMotion?)` | Returns the readiness note described above. |
| `modeCount(scenarios)` | Counts scenarios per mode, always returning all four keys. |

---

## CSS Animation Strategy

The stage target is a single element whose transition reads two custom properties:

```css
.il-target {
  transition: transform var(--duration) var(--ease), background var(--duration) var(--ease);
}
.il-target--hover:hover    { transform: translateY(-8px); }
.il-target--press:hover    { transform: scale(0.96); }
.il-target--drag:hover     { transform: translateX(18px) rotate(2deg); }
.il-target--keyboard:hover,
.il-target--keyboard:focus-within { transform: scale(1.03); }
```

Only `transform` and `background` animate, so previews stay on the compositor. Toggling the reduced-motion preview collapses `--duration` to 80ms so reviewers can feel what the fallback would be like.

---

## State Flow Diagram

```
   ┌──────────────────────┐  scenarios arrive  ┌───────────────────────────┐
   │  NO SELECTION        │ ─────────────────▶ │  PREVIEWING               │
   │  activeId = ''       │  effect picks [0]  │  active scenario on stage │
   └──────────────────────┘                    │  readiness note shown     │
                                               └──────┬─────────────┬──────┘
                              click scenario button   │             │ toggle reduced motion
                                                      ▼             ▼
                                         ┌────────────────┐  ┌──────────────────────┐
                                         │ activeId = id  │  │ --duration = 80ms    │
                                         │ re-derive note │  │ note re-evaluated    │
                                         └───────┬────────┘  └──────────┬───────────┘
                                                 └──────────┬───────────┘
                                                            ▼
                                                       PREVIEWING
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scenarios` | `InteractionScenario[]` | — (required) | Scenarios with `id`, `label`, `mode` (`'hover' \| 'press' \| 'drag' \| 'keyboard'`), `durationMs`, `easing` and `risk` (`'low' \| 'medium' \| 'high'`). |
| `title` | `string` | `'Interaction lab'` | Heading above the lab. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `scenarios` is empty | No stage renders; the footer shows zero for every mode. |
| Selected scenario removed | Falls back to the first scenario. |
| `durationMs` below 80 or above 1200 | Clamped for the preview and the displayed duration. |
| Reduced-motion preview on | Every scenario with a non-zero duration reports "Needs reduced-motion fallback". |
| Invalid `easing` string | The browser ignores the transition timing function and falls back to `ease`. |
| OS-level `prefers-reduced-motion: reduce` | The lab does not read it automatically — use the toggle to preview the fallback. |
| Touch devices | `:hover` previews fire on tap; keyboard scenarios respond to focus. |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$state`, `$derived`, `$effect`, `$props`) and scoped CSS.

---

## File Structure

```
src/lib/components/InteractionLab.svelte     # implementation + exported readiness helpers
src/lib/components/InteractionLab.md         # this file (rendered inside ComponentPageShell)
src/lib/components/InteractionLab.test.ts    # vitest unit tests
src/routes/interactionlab/+page.svelte       # demo page
```
