# Stepper — Technical Logic Explainer

## What Does It Do? (Plain English)

A compact visual indicator for multi-stage flows — checkout, onboarding wizards, multi-page forms. Each step has one of three states (done, current, pending) and they're joined by connector lines, so users always have a "you are here on a 4-step journey" cue. Optional `clickable` mode turns done and current steps into jump-to-step navigation; pending steps stay locked so users can't skip ahead before finishing what they're on.

Think of it as the metro-line diagram on a Tube map: you can see every station on the line, the one you've reached, and the ones still ahead. The dots and lines tell you where you've been, where you are, and how much is left.

## How It Works (Pseudo-Code)

```
state:
  steps[]      = string labels (length determines step count)
  currentStep  = index of the active step (0-based)
  clickable    = whether done/current steps fire onSelect when clicked

derive per step i:
  state = i < currentStep ? 'done'
        : i === currentStep ? 'current'
        : 'pending'
  color = state === 'done'    ? doneColor
        : state === 'current' ? activeColor
        :                        pendingColor

render:
  for each step i:
    if clickable && state !== 'pending':
      <button onclick={onSelect(i)}>circle + label</button>
    else:
      <div>circle + label</div>
    circle:
      'done'    → filled badge with checkmark SVG
      'current' → outlined badge with number, active colour
      'pending' → outlined badge with number, dimmed
    if i < steps.length - 1:
      connector line, coloured 'done' or 'pending'

events:
  on click step (clickable && !pending):
    fire onSelect(index)
    parent updates currentStep
```

The states are *derived* from `currentStep`, not stored separately — pass `currentStep = 2` and steps 0 and 1 are done, step 2 is current, steps 3+ are pending. There's no separate "completion" state to track.

## The Core Concept: Three States Derived From One Cursor

A naïve stepper stores a `done` boolean per step. That works but breaks the moment you need backwards navigation: clicking step 1 from step 3 should mark steps 2 and 3 as *not done* anymore, and the consumer has to remember to update three booleans atomically.

This component stores **one number** — `currentStep` — and derives state from position:

```
state(i) = i < currentStep ? 'done'
         : i === currentStep ? 'current'
         : 'pending'
```

Backwards navigation just decrements `currentStep`. Forwards navigation increments. Skipping a step in code is a no-op for the data model — `currentStep = 5` automatically marks steps 0–4 as done. The whole state machine is one cursor moving left/right, which is the right mental model for a linear flow.

The trade-off: this component models **linear flows only**. Branching flows (step 2A or step 2B based on a choice) need a richer state model — at that point you've outgrown a Stepper.

## Connector Colour Logic

Each step renders a connector line *after* itself unless it's the last:

```
if i < steps.length - 1:
  connector colour = state === 'done' ? doneColor : pendingColor
```

Note: the connector colour follows the *step before it*, not the step after. That means the connector between step 2 (done) and step 3 (current) is doneColor — visually showing "this part of the journey is complete". The connector between step 3 (current) and step 4 (pending) is pendingColor — "you haven't crossed this yet".

This subtle rule produces a clean, intuitive read: the line behind you is bright, the line ahead is dim, with the breakpoint at the current step.

## Click-to-Jump With a Locked Future

When `clickable` is true, only `done` and `current` steps render as `<button>`s. Pending steps render as plain `<div>`s with no click handler. The reasoning:

- **Going back**: clicking step 1 from step 3 lets users review or correct earlier input. This is desired in checkout flows — "wait, was that the right address?"
- **Skipping ahead**: clicking step 5 from step 1 would let users bypass validation on steps 2–4. That's almost always wrong. If the parent wants to allow it, they can listen to `onSelect` and decide for themselves; but locking pending steps at the component level makes the safe default safe.

The `aria-current="step"` attribute is set on the current step's `<li>`, so AT users hear "*current step, 2 of 5: Shipping*". Each step has `aria-label="Step N of M: Label"` for context.

## State Flow Diagram

```
   currentStep = 2 (step 3, 0-indexed: 'Payment'):

   ┌──────┐ ── ┌──────┐ ── ┌──────┐ ── ┌──────┐ ── ┌──────┐
   │  ✓   │    │  ✓   │    │  3   │    │  4   │    │  5   │
   │ done │    │ done │    │ curr │    │ pend │    │ pend │
   └──────┘    └──────┘    └──────┘    └──────┘    └──────┘
    Cart       Address     Payment      Review      Confirm

   click step 0 (clickable mode, state='done'):
     onSelect(0) fires
     parent sets currentStep = 0
     re-derive: step 0 = current, 1+ = pending
     stepper re-renders left-to-right with the new cursor

   click step 4 (clickable mode, state='pending'):
     no <button>, no click handler
     nothing happens
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `string[]` | `[]` | Step labels. Length determines step count. |
| `currentStep` | `number` | `0` | Index of the current step (0-based). |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction. |
| `clickable` | `boolean` | `false` | Make done and current steps clickable for jump-to-step navigation. |
| `onSelect` | `(index: number) => void` | `undefined` | Fires when a clickable step is activated. |
| `activeColor` | `string` | `'#3b82f6'` | Current step ring + label colour. |
| `doneColor` | `string` | `'#22c55e'` | Completed step badge fill colour. |
| `pendingColor` | `string` | `'#cbd5e1'` | Pending step ring colour. |
| `class` | `string` | `''` | Extra classes on the `<ol>`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `currentStep > steps.length - 1` | Every step renders as `done` (no current, no pending). The badge of step N-1 still shows the checkmark. Useful for "all done" success screens. |
| `currentStep < 0` | Every step renders as `pending`. Nothing is current. |
| Single-step flow (`steps.length === 1`) | One badge, no connector. State is `current` if `currentStep === 0`, else `done` or `pending`. |
| `clickable` but `onSelect` omitted | Steps still render as `<button>`s for keyboard parity; clicks are no-ops. |
| `currentStep` set to a `pending` step's index by parent (jumped ahead) | The step becomes `current`; preceding steps that weren't done before are now `done` retrospectively. Linear cursor model means there's no "you skipped" detection — the parent owns gating. |
| User has `prefers-reduced-motion: reduce` | Step-marker colour transitions and label transitions are removed; state changes are instant. |
| Vertical orientation on a narrow screen | Steps stack top-to-bottom; connectors become vertical lines. Connector min-height ensures visible spacing even with short labels. |
| Step labels longer than the badge width allows | Labels truncate with ellipsis (`overflow: hidden; text-overflow: ellipsis`) on horizontal; full-width on vertical. Keep labels short — "Shipping", not "Enter your shipping address". |

## Dependencies

- **Svelte 5.x** — `$props`, `{@const}` for per-iteration derived values. The state derivation is a single function; the rendering is a `{#each}` loop.
- Zero external dependencies. Inline SVG checkmark, scoped CSS, no icon library.

## File Structure

```
src/lib/components/Stepper.svelte    # implementation
src/lib/components/Stepper.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Stepper.test.ts   # vitest unit tests
src/routes/stepper/+page.svelte      # demo page
```
