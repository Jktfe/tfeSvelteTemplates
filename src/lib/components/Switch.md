# Switch — Technical Logic Explainer

## What Does It Do? (Plain English)

An iOS-style boolean toggle for binary state — notifications on/off, dark mode, public/private, feature flag enabled. The thumb slides between two positions, the track changes colour, and the new value is committed immediately. Unlike a checkbox, a switch *implies* the change takes effect right away — no Save button between the toggle and reality.

Think of it as a light switch on the wall: you flip it, the light is on. There's no "do you really want to turn the light on?" confirmation step. If your change needs a confirmation, you want a checkbox + Save button instead.

## How It Works (Pseudo-Code)

```
state:
  checked  = bindable boolean
  inputId  = stable id for label association (auto-generated if not provided)

events:
  on click track (or Space / Enter — it's a real <button>):
    if disabled: return
    checked = !checked
    fire onChange(checked)

  derive thumb transform:
    if checked: translateX(track-width − thumb-width − padding)
    else:       translateX(0)
```

That's the whole logic. The interactivity is one boolean and one click handler. Everything else — the slide, the colour change, the focus ring — is CSS reacting to `class:switch-on={checked}`.

## The Core Concept: Why a `<button role="switch">` Beats a Hidden Checkbox

A common mistake when building a custom toggle is to wrap a hidden `<input type="checkbox">` and style around it. That works visually but undermines accessibility:

- Screen readers announce checkboxes as "*Notifications, checkbox, checked*" — the wrong noun. A switch implies *immediate effect*; a checkbox implies *staged decision*.
- The mental model differs: users (and AT) treat checkboxes as "I'll commit later"; switches as "this is the state right now".

Using a native `<button>` with `role="switch"` and `aria-checked` is the correct ARIA pattern from the WAI-ARIA spec:

```
<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={…}
>
```

You get every keyboard handler for free. `<button>` already maps Space and Enter to `click`, so there's no `keydown` shim. AT announces "*Notifications, switch, on*" — the correct noun. The native `disabled` attribute flows through, blocking interaction at the platform level rather than just visually.

The trade-off: `<button role="switch">` is not a form-submitting input. If you need the value to flow through `<form>`-based submission, pair the switch with a hidden `<input type="hidden" name="…" value={checked}>`. For most modern apps that submit JSON via fetch, this is irrelevant.

## CSS Animation Strategy

The slide is a single `transform: translateX(...)` on the thumb. Transforms ride the GPU compositor, so the animation never thrashes layout — the track and surrounding text don't reflow as the thumb moves.

```css
.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.switch-md.switch-wrapper .switch-on .switch-thumb {
  transform: translateX(20px);
}
```

The translate distance is hand-calculated per size: `track-width − thumb-width − 4px (2px padding each side)`. For the `md` size: `44 − 20 − 4 = 20px`. For `lg`: `56 − 28 − 4 = 24px`. These are inline in the stylesheet rather than computed, because they never change at runtime — the size is fixed by the prop.

The `cubic-bezier(0.4, 0, 0.2, 1)` is Material's "standard" curve — a balanced ease that feels natural without being either too fast or too slow. The 200 ms duration is the spec-recommended toggle-state-change time; shorter feels like a pop, longer feels rubbery.

Reduced-motion gets a hard kill switch:

```css
@media (prefers-reduced-motion: reduce) {
  .switch-track,
  .switch-thumb {
    transition: none;
  }
}
```

The thumb still teleports to the new position — important for clarity — but without the slide.

## State Flow Diagram

```
              ┌──────────────────┐
              │     OFF          │
              │  checked=false   │
              │  thumb at left   │
              │  track grey      │
              └────────┬─────────┘
                       │
       click / Space / Enter (if !disabled)
                       │
                       ▼
              ┌──────────────────┐
              │     ON           │
              │  checked=true    │
              │  thumb at right  │
              │  track tinted    │  ← variant: blue / green / red
              │  onChange(true)  │
              └────────┬─────────┘
                       │
       click / Space / Enter
                       │
                       ▼
                  back to OFF

  disabled=true: clicks ignored, opacity 0.5, cursor not-allowed
  prefers-reduced-motion: thumb teleports instead of slides
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Current state. Use `bind:checked` for two-way sync. |
| `label` | `string` | `''` | Visible label text. Click flips the switch (clickable via `<label for>`). |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Side of the track to render the label on. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Track + thumb size (32×18, 44×24, 56×32 in px). |
| `variant` | `'default' \| 'success' \| 'danger'` | `'default'` | On-state track colour: blue / green / red. |
| `disabled` | `boolean` | `false` | Sets the real `disabled` attribute, not just `aria-disabled`. |
| `id` | `string` | auto | `id` on the button (used by the label `for` attribute). |
| `ariaLabel` | `string` | — | `aria-label` for switches without a visible label. Defaults to `'Toggle'` when no label is provided. |
| `onChange` | `(checked: boolean) => void` | — | Fires after each toggle with the new value. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User has `prefers-reduced-motion: reduce` | The 200 ms slide transition is removed; the thumb teleports to the new position. State change is still instant. |
| `disabled` set after a click but before the parent has handled `onChange` | The click already fired before `disabled` was set; `checked` flips. Subsequent clicks are blocked. |
| Multiple Switches on one page sharing no `id` | Each gets an auto-generated id (`switch-${random}`) so labels never accidentally cross-link. |
| `label` is empty and `ariaLabel` is omitted | The button gets `aria-label="Toggle"` so AT users hear something meaningful instead of "switch, on" with no name. |
| `label` is set but the user clicks the *label*, not the track | The `<label for>` association forwards the click to the button. Same effect as clicking the track. |
| User Tabs to the switch and presses Space | Native `<button>` behaviour: Space triggers a click. No keyboard shim needed. |
| `bind:checked` but parent passes a non-boolean (truthy/falsy value) | Svelte coerces; the visual state follows truthiness. To avoid surprises, type the parent state as `boolean` explicitly. |
| Switch is rendered server-side | No DOM access; the auto-generated id is computed in `$derived` and stable across SSR + hydration as long as the `id` prop is unset (Math.random differs but Svelte handles hydration mismatch gracefully here). |

## Dependencies

- **Svelte 5.x** — `$bindable`, `$derived`, `$props`. The whole component is one click handler and a derived id.
- Zero external dependencies. Native `<button>`, `<label>`, scoped CSS.

## File Structure

```
src/lib/components/Switch.svelte    # implementation
src/lib/components/Switch.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Switch.test.ts   # vitest unit tests
src/routes/switch/+page.svelte      # demo page
```
