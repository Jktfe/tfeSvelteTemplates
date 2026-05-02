# PinInput — Technical Logic Explainer

## What Does It Do? (Plain English)

A row of single-character inputs for entering verification codes — the SMS one-time password, the authenticator app's six-digit MFA code, a four-digit PIN, an alphanumeric invite. Each cell holds one character, focus auto-advances as the user types, Backspace at an empty cell jumps back to the previous one, and pasting a full code distributes the characters across every cell in a single action.

Think of it as a row of typewriter keys with one carriage that quietly moves itself: the user never has to aim, just type. The cells are real `<input>` elements, so iOS and Android offer the SMS-delivered code via `autocomplete="one-time-code"` for free.

## How It Works (Pseudo-Code)

```
state:
  cells[]            = array of N strings, one per cell
  inputs[]           = bound DOM refs for focus management
  lastCompleteFired  = the value that last fired onComplete (dedupe guard)

derive value (joined string):
  whenever cells[] changes, value = cells.join('')
  if cells are all filled and value != lastCompleteFired:
    fire onComplete(value)
    lastCompleteFired = value

events:
  on input at cell i:
    take the last character typed
    if not allowed by `type` (numeric or alphanumeric): drop it, return
    cells[i] = single character
    if i < length - 1: focus cells[i + 1]

  on Backspace at cell i:
    if cells[i] is empty and i > 0:
      preventDefault
      cells[i - 1] = ''
      focus cells[i - 1]
    else: let the browser clear cells[i]

  on ArrowLeft / ArrowRight / Home / End:
    move focus, no value mutation

  on paste at cell i:
    preventDefault
    filtered = clipboard text, only allowed chars
    fill cells from i forwards, capped at length
    focus the first empty cell, or the last cell

  on prop value changes externally:
    if joined cells != incoming value:
      reshape cells from incoming, untracked so user keystrokes
      don't trigger this branch in a feedback loop
```

The two `$effect` blocks both wrap their reads in `untrack(...)`. Without that, typing into a cell would re-run the prop-sync effect, which would clobber `cells` back to the stale `value`, undoing the keystroke.

## The Core Concept: Cell-Backed Joined String

The naïve approach is to keep one string and split it on render. That breaks two ways:

1. **Per-cell focus.** With one string you have one input — the carriage doesn't visibly hop, and there's no obvious "you are here" cue between characters. Six segmented cells communicate the shape of the code at a glance.
2. **Paste handling.** Pasting "123456" into a single text input is fine; pasting it into a six-cell row needs to fan the characters out, validate each, and land focus on the right cell. That's a per-cell operation by definition.

So the source of truth is `cells[]` (the array), and `value` (the joined string) is the *projected view* exposed to consumers. The `$effect` keeps them in sync in both directions: cells → value on every keystroke, value → cells when the parent resets the field.

The `lastCompleteFired` guard is subtle but important. Once the cells are filled, `cells` no longer changes — but if the parent calls `onComplete` and triggers a re-render, the same `cells.join('')` would fire `onComplete` again. We dedupe by remembering the last value fired, and only fire again if the user clears a cell and refills it.

## Focus & Auto-Advance Behaviour

Auto-advance only happens **on a fresh, valid character**. Specifically:

```
if cells[i] === '': do nothing       (user cleared a cell — stay)
if last char isAllowed: advance      (valid input — move on)
otherwise: cells[i] = '' and stay    (rejected — user can retype)
```

The `select()` call on focus is the polish move — when the user lands on a filled cell, the existing character is selected, so typing replaces rather than concatenates. This matches OTP cell behaviour on iOS Settings and 1Password.

Backspace has two modes by deliberate design. If the cell has content, default behaviour clears it (one Backspace press = empty cell, focus stays). If it's already empty, we intercept and jump back, also clearing the previous cell. So holding Backspace walks the carriage back through the code, clearing as it goes — the same model as the native iOS PIN entry.

## XSS & Input Sanitization

The `isAllowedChar` filter is the security boundary. `numeric` mode allows `[0-9]` only; `alphanumeric` allows `[a-zA-Z0-9]`. Anything else (whitespace, emoji, control characters, an attacker-crafted paste) is rejected at the cell level and never reaches `value`.

This matters most for the paste path. A user pasting a styled OTP from an SMS preview ("Your code is 123 456") gets just `123456` — `Array.from(pasted).filter(isAllowedChar)` strips spaces and "Your code is" silently. Consumers downstream see only the eight allowed character classes; no need to re-sanitise on submit.

## State Flow Diagram

```
                ┌──────────────────────┐
                │   EMPTY              │
                │ cells = ['','','',...]│
                └──────────┬───────────┘
                           │ user types valid char in cell i
                           ▼
                ┌──────────────────────┐
                │   PARTIAL            │
                │ some cells filled    │◀──── Backspace at empty cell:
                │ focus auto-advances  │       clear previous, jump back
                └──────────┬───────────┘
                           │ last cell filled
                           ▼
                ┌──────────────────────┐
                │   COMPLETE           │
                │ cells.every(filled)  │
                │ → onComplete(value)  │
                │   fires once         │
                └──────────┬───────────┘
                           │ user clears any cell
                           ▼
                  back to PARTIAL

  paste at any state:
    preventDefault → filter → fill cells from cursor → focus next empty
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Joined value across all cells. Bindable via `bind:value`. |
| `length` | `number` | `4` | Number of cells. Common values: `4`, `6`, `8`. |
| `type` | `'numeric' \| 'alphanumeric'` | `'numeric'` | Allowed character class. Numeric also sets `inputmode=numeric` for the mobile digit pad. |
| `mask` | `boolean` | `false` | Render cells as `<input type="password">` so the browser draws bullets. Underlying value preserved. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cell footprint and font size. |
| `disabled` | `boolean` | `false` | Block input + focus at the platform level. |
| `autoFocus` | `boolean` | `false` | Focus the first cell on mount. |
| `onComplete` | `(value: string) => void` | `undefined` | Fires once when every cell is filled; deduped against the last-fired value. |
| `ariaLabel` | `string` | `'Verification code'` | Forwarded to the wrapper `role="group"`. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User pastes a 10-character code into a 6-cell field starting at cell 0 | First six characters fill cells 0–5; the rest are dropped. Focus lands on the last cell. |
| User pastes "abc 123" into a numeric PinInput | The space and letters are filtered out by `isAllowedChar`; cells fill with `1`, `2`, `3`. |
| User types into the last cell, completing the code | `onComplete` fires once. If the parent re-renders without changing `value`, it does not fire again. |
| Parent programmatically sets `value = ''` after a failed verification | `$effect` detects the prop ≠ joined cells, reshapes `cells` to all-empty in `untrack`, and the field clears. `lastCompleteFired` resets. |
| User holds Backspace on a fully-filled field | Each press clears the current cell and walks focus back; the field empties left-to-right. |
| `length` prop changes from 4 to 6 after mount | The second `$effect` extends `cells[]` to length 6, preserving the first four characters. |
| User has `prefers-reduced-motion: reduce` | The 120 ms border/box-shadow transition is removed; focus changes are instant. |
| Browser denies clipboard read on paste | The native paste path doesn't run; nothing breaks — the user can still type. |

## Dependencies

- **Svelte 5.x** — `$state`, `$bindable`, `$derived`, `$effect`, and `untrack`. The two-way `cells ↔ value` projection leans on `untrack` to break the feedback loop.
- Zero external dependencies. Pure native `<input>` elements, scoped CSS, no icon library, no clipboard library.

## File Structure

```
src/lib/components/PinInput.svelte    # implementation
src/lib/components/PinInput.md        # this file (rendered inside ComponentPageShell)
src/lib/components/PinInput.test.ts   # vitest unit tests
src/routes/pininput/+page.svelte      # demo page
```
