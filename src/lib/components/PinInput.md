---
title: PinInput
description: Segmented N-cell input for one-time codes (OTP, MFA, PIN). Auto-advance on type, Backspace-back on empty, paste a full code to distribute across cells. Optional native masking via type="password".
category: Form Building
author: AntClaude
---

# PinInput

A row of single-character inputs for entering verification codes — OTP from SMS, MFA from an authenticator app, a PIN, or an invite code. Each cell holds one character, focus auto-advances as the user types, and Backspace at an empty cell jumps back to the previous one. Pasting a full code distributes the characters across every cell in a single action.

## Key Features

- Configurable length (default 4; 6 is common for OTP, 8 for some PINs)
- Auto-advance on input, Backspace-back on empty cell
- Paste a complete code → cells fill left-to-right
- Numeric mode (mobile keypad via `inputmode=numeric`) or alphanumeric
- Optional `mask` prop renders cells as `<input type="password">` so the browser draws bullets natively while the value is preserved
- Three sizes (`sm` / `md` / `lg`)
- Two-way `bind:value` exposes the joined string
- `onComplete(value)` callback fires once when every cell is filled
- `autocomplete="one-time-code"` on the first cell so iOS/Android suggest the SMS-delivered code
- Disabled state honoured at the input level
- Zero dependencies, fully copy-paste portable

## Usage

```svelte
<script lang="ts">
  import PinInput from '$lib/components/PinInput.svelte';

  let code = $state('');

  async function verify(value: string) {
    const result = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ code: value })
    });
    // ...
  }
</script>

<!-- 4-digit OTP -->
<PinInput bind:value={code} onComplete={verify} />

<!-- 6-digit MFA -->
<PinInput length={6} bind:value={code} onComplete={verify} />

<!-- Masked 4-digit PIN -->
<PinInput length={4} mask bind:value={pin} />

<!-- Alphanumeric invite code -->
<PinInput length={6} type="alphanumeric" bind:value={code} />
```

## Props

| Prop         | Type                            | Default              | Description |
|--------------|---------------------------------|----------------------|-------------|
| `value`      | `string`                        | `''`                 | Current joined value (bindable). |
| `length`     | `number`                        | `4`                  | Number of cells. |
| `type`       | `'numeric' \| 'alphanumeric'`   | `'numeric'`          | Allowed character class. Numeric also sets `inputmode=numeric`. |
| `mask`       | `boolean`                       | `false`              | Render cells as password inputs (bullet glyph). Underlying value preserved. |
| `size`       | `'sm' \| 'md' \| 'lg'`          | `'md'`               | Cell footprint and font size. |
| `disabled`   | `boolean`                       | `false`              | Block all input + focus. |
| `autoFocus`  | `boolean`                       | `false`              | Focus the first cell on mount. |
| `onComplete` | `(value: string) => void`       | `undefined`          | Fires once when every cell is filled. |
| `ariaLabel`  | `string`                        | `'Verification code'`| Forwarded to the wrapper `role="group"`. |
| `class`      | `string`                        | `''`                 | Extra classes on the wrapper. |

## Keyboard

| Key                    | Action |
|------------------------|--------|
| Any allowed character  | Write to current cell, focus next cell. |
| Backspace (cell empty) | Clear and focus previous cell. |
| Backspace (cell full)  | Clear current cell, stay focused. |
| ArrowLeft / ArrowRight | Move focus between cells. |
| Home / End             | Jump to first / last cell. |
| Cmd/Ctrl + V           | Paste a full code, distributed across cells. |

## When to use

- SMS one-time codes (the classic 4–6 digit OTP)
- Authenticator app MFA codes
- PIN verification (use `mask` for security)
- Invite / referral codes (alphanumeric)
- Any short fixed-length code where segmentation gives visual reassurance

## When not to use

- Variable-length text → use `TextField` / `Input`
- Long codes (>10 chars) → use a single text input, the segmented model becomes hostile
- Free-form text entry → use `Textarea` / `TextField`
- Single-character input → use a single `<input maxlength=1>` instead

## Accessibility notes

- Each cell is a native `<input>` with its own `aria-label` ("Character 1 of 6", etc.) so screen readers can announce position within the code.
- The wrapper has `role="group"` and a configurable `aria-label` (default `"Verification code"`) so AT can describe the field as a whole.
- `inputmode="numeric"` on numeric mode prompts mobile devices to show the digit pad.
- `autocomplete="one-time-code"` on the first cell lets iOS / Android suggest the SMS-delivered code automatically.
- Masking uses `<input type="password">` so the browser handles the bullet glyph correctly across platforms (no font-fallback issues).
- Disabled state applied via the real `disabled` attribute, blocking focus + input at the platform level.
