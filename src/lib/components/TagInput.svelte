<!--
  ===========================================================
  TAG INPUT
  ===========================================================
  WHAT — A token / chip input: type to add tags, Backspace to remove the last one,
         paste a comma- or newline-separated list to add many at once, with dedupe and a max count.

  FEATURES
    - Enter or comma commits the current text as a chip
    - Backspace on an empty input removes the last chip (one press to arm, second to delete)
    - Paste splits on commas and newlines, then dedupes against existing chips
    - Case-insensitive dedupe (optional), max count cap, and a validate(tag) hook to reject input
    - Bindable value: string[] flows both ways
    - Each chip carries a remove button labelled "Remove <tag>"

  ACCESSIBILITY
    - The chip list is a role="list"; each chip is role="listitem"
    - The wrapper is role="group" with an aria-label so screen readers announce the control
    - Remove buttons have descriptive aria-labels; full keyboard operation throughout
    - Visible :focus-visible ring; honours prefers-reduced-motion (chip entrance animation removed)
    - aria-live region announces rejections (duplicate / invalid / limit reached)

  DEPENDENCIES — Zero external dependencies. Pure Svelte 5 runes + scoped CSS + inline SVG.

  USAGE
    <script lang="ts">
      let tags = $state<string[]>(['design', 'svelte']);
    </script>
    <TagInput bind:value={tags} placeholder="Add a tag…" max={8} />

  PROPS
    | Prop            | Type                         | Default          | Description                                   |
    |-----------------|------------------------------|------------------|-----------------------------------------------|
    | value           | string[] (bindable)          | []               | The committed tags                            |
    | placeholder     | string                       | 'Add a tag…'     | Placeholder for the text input                |
    | max             | number                       | Infinity         | Maximum number of tags allowed                |
    | caseSensitive   | boolean                      | false            | Treat differently-cased tags as distinct      |
    | disabled        | boolean                      | false            | Disable the whole control                     |
    | ariaLabel       | string                       | 'Tags'           | Accessible name for the group                  |
    | validate        | (tag: string) => boolean     | () => true       | Return false to reject a candidate tag        |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** The committed tags. Bindable, flows both ways. */
		value?: string[];
		/** Placeholder for the text input. */
		placeholder?: string;
		/** Maximum number of tags allowed. */
		max?: number;
		/** Treat differently-cased tags as distinct when deduping. */
		caseSensitive?: boolean;
		/** Disable the whole control. */
		disabled?: boolean;
		/** Accessible name for the group. */
		ariaLabel?: string;
		/** Return false to reject a candidate tag (e.g. regex/length checks). */
		validate?: (tag: string) => boolean;
	}

	let {
		value = $bindable([]),
		placeholder = 'Add a tag…',
		max = Infinity,
		caseSensitive = false,
		disabled = false,
		ariaLabel = 'Tags',
		validate = () => true
	}: Props = $props();

	// The live text the user is typing before it becomes a chip.
	let draft = $state('');
	// When the input is empty, the first Backspace "arms" deletion of the last chip;
	// a second Backspace removes it. This guards against accidental loss while typing fast.
	let armedForDelete = $state(false);
	// Short-lived message announced politely when input is rejected.
	let notice = $state('');

	let inputEl = $state<HTMLInputElement | null>(null);

	const atCapacity = $derived(value.length >= max);

	/** Normalise a tag for comparison — trims, and lowercases unless caseSensitive. */
	function key(tag: string): string {
		const trimmed = tag.trim();
		return caseSensitive ? trimmed : trimmed.toLowerCase();
	}

	/** True if the tag already exists (by the dedupe key). */
	function exists(tag: string): boolean {
		const k = key(tag);
		return value.some((t) => key(t) === k);
	}

	/** Try to add one tag. Returns a reason string when rejected, or '' on success. */
	function tryAdd(raw: string): string {
		const tag = raw.trim();
		if (!tag) return '';
		if (value.length >= max) return `Limit of ${max} tags reached`;
		if (exists(tag)) return `"${tag}" is already added`;
		if (!validate(tag)) return `"${tag}" is not allowed`;
		value = [...value, tag];
		return '';
	}

	/** Commit the current draft (Enter / comma / blur). */
	function commitDraft() {
		const reason = tryAdd(draft);
		if (reason) {
			notice = reason;
		} else {
			draft = '';
			notice = '';
		}
	}

	/** Add many candidates from a pasted string, splitting on commas and newlines. */
	function addMany(text: string) {
		const parts = text
			.split(/[\n,]+/)
			.map((p) => p.trim())
			.filter(Boolean);
		let lastReason = '';
		for (const part of parts) {
			const reason = tryAdd(part);
			if (reason) lastReason = reason;
		}
		notice = lastReason;
	}

	function removeAt(index: number) {
		value = value.filter((_, i) => i !== index);
		notice = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			commitDraft();
			armedForDelete = false;
			return;
		}

		if (event.key === 'Backspace' && draft === '' && value.length > 0) {
			if (armedForDelete) {
				removeAt(value.length - 1);
				armedForDelete = false;
			} else {
				// First press arms; the chip highlights so the user sees what's next.
				armedForDelete = true;
			}
			event.preventDefault();
			return;
		}

		// Any other key cancels the armed state.
		armedForDelete = false;
	}

	function handlePaste(event: ClipboardEvent) {
		if (disabled) return;
		const text = event.clipboardData?.getData('text') ?? '';
		// Only intercept multi-value pastes; single values fall through to normal typing.
		if (/[\n,]/.test(text)) {
			event.preventDefault();
			addMany(text);
			draft = '';
		}
	}

	/** Clicking anywhere in the field focuses the text input for a natural feel. */
	function focusInput() {
		if (!disabled) inputEl?.focus();
	}
</script>

<div
	class="tag-input"
	class:tag-input--disabled={disabled}
	role="group"
	aria-label={ariaLabel}
	aria-disabled={disabled}
>
	<ul class="tag-input__list" role="list">
		{#each value as tag, index (key(tag) + index)}
			<li class="tag-input__chip" class:is-armed={armedForDelete && index === value.length - 1} role="listitem">
				<span class="tag-input__chip-label">{tag}</span>
				<button
					type="button"
					class="tag-input__remove"
					aria-label={`Remove ${tag}`}
					{disabled}
					onclick={() => {
						removeAt(index);
						focusInput();
					}}
				>
					<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
						<path
							d="M3.5 3.5l9 9M12.5 3.5l-9 9"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							fill="none"
						/>
					</svg>
				</button>
			</li>
		{/each}

		<li class="tag-input__field" role="presentation">
			<input
				bind:this={inputEl}
				bind:value={draft}
				class="tag-input__text"
				type="text"
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				placeholder={atCapacity ? '' : placeholder}
				disabled={disabled || atCapacity}
				aria-label={ariaLabel ? `${ariaLabel}, add new` : 'Add new tag'}
				onkeydown={handleKeydown}
				onpaste={handlePaste}
				onblur={commitDraft}
			/>
		</li>
	</ul>

	{#if atCapacity && !disabled}
		<p class="tag-input__hint">Maximum of {max} reached.</p>
	{/if}

	<!-- Polite, visually hidden announcer for rejections. -->
	<p class="tag-input__sr" role="status" aria-live="polite">{notice}</p>
</div>

<style>
	.tag-input {
		/* Light defaults — the dark block below flips chrome tokens. */
		--ti-bg: #ffffff;
		--ti-border: #d4d4d8;
		--ti-border-focus: #6366f1;
		--ti-ring: rgba(99, 102, 241, 0.35);
		--ti-text: #1f2937;
		--ti-placeholder: #9ca3af;
		--ti-chip-bg: #eef2ff;
		--ti-chip-text: #3730a3;
		--ti-chip-border: #c7d2fe;
		--ti-chip-armed-bg: #fee2e2;
		--ti-chip-armed-text: #991b1b;
		--ti-chip-armed-border: #fca5a5;
		--ti-hint: #6b7280;

		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		width: 100%;
		max-width: 100%;
		font-family: inherit;
		color: var(--ti-text);
	}

	.tag-input__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		padding: 0.4rem 0.5rem;
		list-style: none;
		background: var(--ti-bg);
		border: 1px solid var(--ti-border);
		border-radius: 0.6rem;
		cursor: text;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	/* Mirror the input's focus onto the whole field so it reads as one control. */
	.tag-input__list:focus-within {
		border-color: var(--ti-border-focus);
		box-shadow: 0 0 0 3px var(--ti-ring);
	}

	.tag-input__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.3rem 0.2rem 0.6rem;
		background: var(--ti-chip-bg);
		color: var(--ti-chip-text);
		border: 1px solid var(--ti-chip-border);
		border-radius: 999px;
		font-size: 0.85rem;
		line-height: 1.3;
		max-width: 100%;
		animation: chip-in 0.16s ease;
	}

	.tag-input__chip.is-armed {
		background: var(--ti-chip-armed-bg);
		color: var(--ti-chip-armed-text);
		border-color: var(--ti-chip-armed-border);
	}

	.tag-input__chip-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 14rem;
	}

	.tag-input__remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.15rem;
		height: 1.15rem;
		padding: 0;
		color: inherit;
		background: transparent;
		border: none;
		border-radius: 999px;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.12s ease, background-color 0.12s ease;
	}

	.tag-input__remove:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.08);
	}

	.tag-input__remove:focus-visible {
		outline: 2px solid var(--ti-border-focus);
		outline-offset: 1px;
		opacity: 1;
	}

	.tag-input__field {
		flex: 1 1 6rem;
		min-width: 6rem;
	}

	.tag-input__text {
		width: 100%;
		min-width: 4rem;
		padding: 0.25rem 0.2rem;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ti-text);
		background: transparent;
		border: none;
		outline: none;
	}

	.tag-input__text::placeholder {
		color: var(--ti-placeholder);
	}

	.tag-input__text:disabled {
		cursor: not-allowed;
	}

	.tag-input--disabled .tag-input__list {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tag-input__hint {
		margin: 0;
		font-size: 0.78rem;
		color: var(--ti-hint);
	}

	/* Visually hidden but available to assistive tech. */
	.tag-input__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	@keyframes chip-in {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tag-input__list,
		.tag-input__remove {
			transition: none;
		}
		.tag-input__chip {
			animation: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.tag-input {
			--ti-bg: #18181b;
			--ti-border: #3f3f46;
			--ti-border-focus: #818cf8;
			--ti-ring: rgba(129, 140, 248, 0.35);
			--ti-text: #e4e4e7;
			--ti-placeholder: #71717a;
			--ti-chip-bg: #312e81;
			--ti-chip-text: #c7d2fe;
			--ti-chip-border: #4338ca;
			--ti-chip-armed-bg: #450a0a;
			--ti-chip-armed-text: #fca5a5;
			--ti-chip-armed-border: #7f1d1d;
			--ti-hint: #a1a1aa;
		}

		.tag-input__remove:hover {
			background: rgba(255, 255, 255, 0.12);
		}
	}
</style>
