---
title: Stepper
description: Multi-step progress indicator with done/current/pending states, optional clickable navigation, and horizontal or vertical orientation.
category: Helpful UX
author: AntClaude
---

# Stepper

A compact step indicator for multi-stage flows — checkout, onboarding wizards, anything with a clear sequence.

- **Done** steps show a checkmark and a filled badge.
- **Current** step shows its number in the active colour with a heavier label.
- **Pending** steps are dimmed and (optionally) locked from clicking.

## Key Features

- Numbered or icon steps with done / current / pending states
- Horizontal (default) or vertical orientation
- Optional `clickable` mode with `onSelect` callback for jump-to-step navigation
- Pending steps stay locked even when clickable, so users can't skip ahead
- Custom palette via `activeColor`, `doneColor`, `pendingColor`
- Accessible — `role="list"`, `aria-current="step"`, real buttons when clickable
- Connectors marked `aria-hidden` to keep screen-reader output clean
- Honours `prefers-reduced-motion`
- Zero dependencies, pure CSS + tiny inline SVG checkmark

## Usage

```svelte
<script lang="ts">
  import Stepper from '$lib/components/Stepper.svelte';

  let step = $state(1);
  const steps = ['Cart', 'Shipping', 'Payment', 'Review'];
</script>

<!-- Read-only -->
<Stepper {steps} currentStep={step} />

<!-- Click to jump to any completed/current step -->
<Stepper
  {steps}
  currentStep={step}
  clickable
  onSelect={(i) => (step = i)}
/>

<!-- Vertical layout -->
<Stepper {steps} currentStep={step} orientation="vertical" />

<!-- Custom palette -->
<Stepper
  {steps}
  currentStep={step}
  activeColor="#a855f7"
  doneColor="#16a34a"
  pendingColor="#cbd5e1"
/>
```

## Props

| Prop           | Type                            | Default        | Description |
|----------------|---------------------------------|----------------|-------------|
| `steps`        | `string[]`                      | `[]`           | Step labels (length determines count). |
| `currentStep`  | `number`                        | `0`            | Index of the current step (0-based). |
| `orientation`  | `'horizontal' \| 'vertical'`    | `'horizontal'` | Layout direction. |
| `clickable`    | `boolean`                       | `false`        | Enables jump-to-step on done/current steps. |
| `onSelect`     | `(index: number) => void`       | `undefined`    | Called when a clickable step fires. |
| `activeColor`  | `string`                        | `'#3b82f6'`    | Current step ring/text colour. |
| `doneColor`    | `string`                        | `'#22c55e'`    | Completed step fill colour. |
| `pendingColor` | `string`                        | `'#cbd5e1'`    | Pending step ring colour. |
| `class`        | `string`                        | `''`           | Extra classes. |

## When to use

- Checkout / order flows
- Onboarding wizards
- Multi-page forms
- Any sequence where users benefit from a "where am I" cue

## When not to use

- Indeterminate or branching flows — Stepper assumes a linear sequence
- More than ~6 steps on mobile — switch to a vertical orientation or chunk the flow
- Pure progress-percent indicators — use ProgressRing or a horizontal bar
