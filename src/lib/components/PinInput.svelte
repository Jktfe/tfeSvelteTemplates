<!--
  ============================================================
  PinInput — Segmented OTP / verification code entry
  ============================================================

  WHAT IT DOES
  An N-cell input for entering one-time codes (OTP, MFA, PIN
  verification). Each cell holds a single character, typing
  auto-advances to the next cell, and Backspace at an empty cell
  jumps back to the previous one. Pasting a full code distributes
  the characters across every cell in one go. Optional masking
  hides the value visually without losing it.

  FEATURES
  - Configurable length (default 4, common: 4 / 6 / 8)
  - Auto-advance on input, Backspace-back on empty
  - Paste a whole code → cells fill automatically
  - Numeric or alphanumeric mode (sets inputmode + pattern)
  - Optional `mask` prop renders bullet •  (real value preserved)
  - Three sizes (sm / md / lg)
  - Two-way `bind:value` (joined string of length N)
  - `onComplete(value)` callback fires when all cells filled
  - Disabled state
  - Zero dependencies, fully copy-paste portable

  ACCESSIBILITY
  - Each cell is a native <input> — full keyboard + AT support
  - aria-label on each cell ("Digit 1 of 6" etc.)
  - `inputmode=numeric` on numeric mode → mobile shows digit pad
  - `autocomplete=one-time-code` lets iOS / Android suggest the
    SMS-delivered code automatically
  - Disabled state honoured at the input level (not just CSS)

  USAGE
  Default 4-cell OTP:
      <PinInput bind:value={code} onComplete={(v) => verify(v)} />

  6-digit MFA:
      <PinInput length={6} bind:value={code} />

  Masked PIN:
      <PinInput length={4} mask bind:value={pin} />

  Alphanumeric (e.g. invite code):
      <PinInput length={6} type="alphanumeric" bind:value={code} />

  PROPS
  | Prop       | Type                          | Default     | Description |
  |------------|-------------------------------|-------------|-------------|
  | value      | string                        | ''          | Current joined value (bindable) |
  | length     | number                        | 4           | Number of cells |
  | type       | 'numeric' \| 'alphanumeric'   | 'numeric'   | Allowed character class |
  | mask       | boolean                       | false       | Render bullet instead of character |
  | size       | 'sm' \| 'md' \| 'lg'          | 'md'        | Cell size |
  | disabled   | boolean                       | false       | Block all input + focus |
  | autoFocus  | boolean                       | false       | Focus first cell on mount |
  | onComplete | (value: string) => void       | undefined   | Fires once all cells filled |
  | ariaLabel  | string                        | 'Verification code' | Forwarded to wrapper for SR |
  | class      | string                        | ''          | Extra classes on wrapper |
  ============================================================
-->

<script lang="ts">
	import { untrack } from 'svelte';

	export type PinInputSize = 'sm' | 'md' | 'lg';
	export type PinInputType = 'numeric' | 'alphanumeric';

	interface Props {
		value?: string;
		length?: number;
		type?: PinInputType;
		mask?: boolean;
		size?: PinInputSize;
		disabled?: boolean;
		autoFocus?: boolean;
		onComplete?: (value: string) => void;
		ariaLabel?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		length = 4,
		type = 'numeric',
		mask = false,
		size = 'md',
		disabled = false,
		autoFocus = false,
		onComplete,
		ariaLabel = 'Verification code',
		class: extraClass = ''
	}: Props = $props();

	// Internal cell state. We keep cells as the source of truth for
	// what the user actually typed (even when masked, since masking
	// is handled at the DOM level via type="password").
	// Note: `length` and `value` are captured for the initial array
	// shape only — the $effect below keeps cells in sync if either
	// prop changes after mount.
	// svelte-ignore state_referenced_locally
	let cells = $state<string[]>(Array.from({ length }, (_, i) => value[i] ?? ''));
	let inputs = $state<HTMLInputElement[]>([]);

	// Keep cells in sync if `value` changes externally (e.g. parent
	// programmatically resets the field). We `untrack` the cells read
	// so this effect ONLY re-runs when `value` (or `length`) changes —
	// otherwise typing into a cell would trigger this effect to clobber
	// cells back to the stale `value`.
	$effect(() => {
		const incoming = value ?? '';
		untrack(() => {
			const current = cells.join('');
			if (incoming !== current) {
				cells = Array.from({ length }, (_, i) => incoming[i] ?? '');
			}
		});
	});

	// Keep cells array length in sync if `length` prop changes after mount.
	$effect(() => {
		const len = length;
		untrack(() => {
			if (cells.length !== len) {
				cells = Array.from({ length: len }, (_, i) => cells[i] ?? '');
			}
		});
	});

	// Whenever cells change, project the joined view back to `value`.
	// Fire `onComplete` once at the moment the field becomes full.
	let lastCompleteFired = $state('');
	$effect(() => {
		const joined = cells.join('');
		untrack(() => {
			if (joined !== value) value = joined;
			if (joined.length === length && cells.every((c) => c !== '')) {
				if (joined !== lastCompleteFired) {
					lastCompleteFired = joined;
					onComplete?.(joined);
				}
			} else if (lastCompleteFired !== '') {
				lastCompleteFired = '';
			}
		});
	});

	// Auto-focus first cell on mount if requested.
	$effect(() => {
		if (autoFocus && inputs[0]) {
			inputs[0].focus();
		}
	});

	// Char filter — what the cell will accept.
	function isAllowedChar(ch: string): boolean {
		if (ch.length !== 1) return false;
		if (type === 'numeric') return /[0-9]/.test(ch);
		return /[a-zA-Z0-9]/.test(ch);
	}

	function focusCell(i: number) {
		const el = inputs[i];
		if (el) {
			el.focus();
			// Place caret at end so subsequent typing replaces.
			try {
				el.select();
			} catch {
				/* some browsers throw on hidden inputs — safe to ignore */
			}
		}
	}

	function handleInput(i: number) {
		// `bind:value` just updated cells[i] for us. Validate + auto-advance.
		const ch = cells[i];
		if (ch === '') return; // user cleared the cell — no auto-advance
		// Take the LAST char in case the bound value somehow has more than one
		// (paste handler is the proper place for multi-char, but be defensive).
		const last = ch[ch.length - 1];
		if (!isAllowedChar(last)) {
			cells[i] = ''; // reject — drop the character
			return;
		}
		cells[i] = last; // normalize to single char
		if (i < length - 1) {
			focusCell(i + 1);
		}
	}

	function handleKeydown(i: number, e: KeyboardEvent) {
		const key = e.key;
		if (key === 'Backspace') {
			if (cells[i] === '' && i > 0) {
				// Cell already empty — jump back and clear previous.
				e.preventDefault();
				cells[i - 1] = '';
				focusCell(i - 1);
			}
			// If current cell has content, the default behaviour clears it.
		} else if (key === 'ArrowLeft' && i > 0) {
			e.preventDefault();
			focusCell(i - 1);
		} else if (key === 'ArrowRight' && i < length - 1) {
			e.preventDefault();
			focusCell(i + 1);
		} else if (key === 'Home') {
			e.preventDefault();
			focusCell(0);
		} else if (key === 'End') {
			e.preventDefault();
			focusCell(length - 1);
		}
	}

	function handlePaste(i: number, e: ClipboardEvent) {
		e.preventDefault();
		const pasted = e.clipboardData?.getData('text') ?? '';
		// Filter to allowed chars only, then take up to (length - i) chars
		// starting at the focused cell.
		const filtered = Array.from(pasted).filter(isAllowedChar);
		if (filtered.length === 0) return;
		const next = [...cells];
		let cursor = i;
		for (const ch of filtered) {
			if (cursor >= length) break;
			next[cursor] = ch;
			cursor += 1;
		}
		cells = next;
		// Focus next empty cell, or the last cell if everything filled.
		const nextEmpty = next.findIndex((c, idx) => idx >= i && c === '');
		focusCell(nextEmpty === -1 ? length - 1 : nextEmpty);
	}

	function handleFocus(i: number) {
		// Convenience: select cell content so typing replaces.
		const el = inputs[i];
		if (el) {
			try {
				el.select();
			} catch {
				/* noop */
			}
		}
	}

	const inputMode = $derived(type === 'numeric' ? 'numeric' : 'text');
	const pattern = $derived(type === 'numeric' ? '[0-9]*' : '[a-zA-Z0-9]*');
</script>

<div
	class="pin-input pin-input-{size} {extraClass}"
	role="group"
	aria-label={ariaLabel}
>
	{#each cells as cell, i (i)}
		<input
			bind:this={inputs[i]}
			bind:value={cells[i]}
			class="pin-cell"
			class:pin-cell-filled={cell !== ''}
			class:pin-cell-disabled={disabled}
			type={mask ? 'password' : 'text'}
			inputmode={inputMode}
			{pattern}
			maxlength="1"
			autocomplete={i === 0 ? 'one-time-code' : 'off'}
			{disabled}
			aria-label="Character {i + 1} of {length}"
			oninput={() => handleInput(i)}
			onkeydown={(e) => handleKeydown(i, e)}
			onpaste={(e) => handlePaste(i, e)}
			onfocus={() => handleFocus(i)}
		/>
	{/each}
</div>

<style>
	.pin-input {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
	}

	.pin-cell {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-weight: 600;
		text-align: center;
		color: #111827;
		background: #ffffff;
		border: 2px solid #d1d5db;
		border-radius: 0.5rem;
		caret-color: #3b82f6;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease,
			background 120ms ease;
		padding: 0;
		appearance: none;
	}

	.pin-cell:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
	}

	.pin-cell-filled {
		border-color: #6b7280;
		background: #f9fafb;
	}

	.pin-cell-disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
		border-color: #e5e7eb;
	}

	.pin-input-sm .pin-cell {
		width: 2rem;
		height: 2.25rem;
		font-size: 1rem;
		border-radius: 0.375rem;
	}

	.pin-input-md .pin-cell {
		width: 2.75rem;
		height: 3.25rem;
		font-size: 1.5rem;
	}

	.pin-input-lg .pin-cell {
		width: 3.5rem;
		height: 4rem;
		font-size: 2rem;
		border-radius: 0.625rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.pin-cell {
			transition: none;
		}
	}
</style>
