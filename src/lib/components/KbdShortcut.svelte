<!--
  ============================================================
  KbdShortcut — Keyboard key cap display
  ============================================================

  WHAT IT DOES
  Renders one or more keys as styled <kbd> caps so users can see at
  a glance which key combo triggers an action. Think the "⌘ K" hint
  next to the search field, or "Ctrl + Shift + P" in a command-bar
  tooltip.

  FEATURES
  - Single key ("Esc", "Tab") or combo array (["Cmd", "K"])
  - Auto-detects Mac vs Windows for Cmd/Ctrl/Alt symbol substitution
  - Override with `mac` prop when you want to force one platform
  - Three sizes (sm / md / lg)
  - Separator is "+" by default, but can be "→" for sequential combos
    (g → s style), or any string you like
  - Native <kbd> semantic element (free a11y from the browser)
  - Pure CSS bevel — no images, no font icons
  - Honours prefers-color-scheme (dark flip via CSS custom properties)
  - Zero dependencies

  ACCESSIBILITY
  - Each key uses a semantic <kbd>, the standard for keyboard input
  - The whole combo is wrapped in a single <kbd> so screen readers
    announce it as a single shortcut
  - Optional aria-label (default is the combo joined by " plus ")
  - Separator characters (+, →) are aria-hidden so SR doesn't read
    them literally

  USAGE
  Single key:
      <KbdShortcut keys="Esc" />

  Mac-style combo (⌘ K rendered on Mac, Ctrl + K on Windows):
      <KbdShortcut keys={['Cmd', 'K']} />

  Force Windows look on every platform:
      <KbdShortcut keys={['Cmd', 'Shift', 'P']} mac={false} />

  Sequential combo (press g, then s):
      <KbdShortcut keys={['G', 'S']} separator=" → " />

  THEMING
  Seven CSS custom properties on .kbd, light defaults inline, flipped
  automatically under @media (prefers-color-scheme: dark). All seven
  are chrome (no brand variants on a kbd cap) so the whole set flips
  together — no Pattern #67 split needed.
  - --kbd-fg            text colour       (light: #374151 / dark: #d1d5db)
  - --kbd-bg-top        bevel top         (light: #ffffff / dark: #1f2937)
  - --kbd-bg-bottom     bevel bottom      (light: #f3f4f6 / dark: #111827)
  - --kbd-border        cap outline       (light: #d1d5db / dark: #4b5563)
  - --kbd-shadow-inner  inset depth-line  (light: #d1d5db / dark: #4b5563)
  - --kbd-shadow-drop   outer drop-shadow (light: rgba(0,0,0,0.05) / dark: rgba(0,0,0,0.4))
  - --kbd-sep-color     separator colour  (light: #9ca3af / dark: #6b7280)
  Override the chrome tokens by targeting .kbd directly with at least
  2-class specificity — required to overcome the (0,2,0) specificity
  of the component's scoped internal styles. Svelte appends a hash
  class to every selector, so the component's own .kbd.svelte-HASH
  rule declares the default directly on the .kbd element. An ancestor
  :root or body rule sets a value that descendants would inherit, but
  that inherited value is shadowed by the component's own declaration
  on the same element — declared values always win over inherited
  values on the element where they're declared, regardless of the
  ancestor rule's specificity. The override therefore needs to declare
  on the same element with ≥(0,2,0) specificity. See docs/THEMING.md
  for the full mechanism. The doubled-class trick is the cheapest
  unconditional override:
      body .kbd.kbd { --kbd-bg-top: #fef3c7; --kbd-bg-bottom: #fde68a; }

  PROPS
  | Prop      | Type                  | Default | Description |
  |-----------|-----------------------|---------|-------------|
  | keys      | string \| string[]    | required| Key or combo to display |
  | mac       | boolean \| undefined  | auto    | Force Mac (true) or Windows (false) symbols |
  | size      | 'sm' \| 'md' \| 'lg'  | 'md'    | Cap size and font scale |
  | separator | string                | '+'     | Joiner between keys; ignored if `keys` is a string |
  | ariaLabel | string                | auto    | Override the SR-announced label |
  | class     | string                | ''      | Extra classes on the wrapper |
  ============================================================
-->

<script lang="ts">
	export type KbdShortcutSize = 'sm' | 'md' | 'lg';

	interface Props {
		keys: string | string[];
		mac?: boolean;
		size?: KbdShortcutSize;
		separator?: string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		keys,
		mac,
		size = 'md',
		separator = '+',
		ariaLabel,
		class: extraClass = ''
	}: Props = $props();

	// Auto-detect Mac vs Windows when the consumer doesn't pass `mac`.
	// We default to Mac on the server (where navigator is undefined) so
	// SSR'd content matches the most common laptop locale; the client
	// hydration step then corrects if needed via the same logic.
	const isMac = $derived.by(() => {
		if (typeof mac === 'boolean') return mac;
		if (typeof navigator === 'undefined') return true;
		return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
	});

	// Normalise to an array so the template only handles one shape
	const keyList = $derived(Array.isArray(keys) ? keys : [keys]);

	// Map well-known modifier names to platform-correct glyphs.
	// We keep the source-of-truth lookup table inside the component so
	// callers don't need to know the mac/win difference.
	function symbolFor(key: string, onMac: boolean): string {
		const k = key.trim().toLowerCase();
		if (onMac) {
			switch (k) {
				case 'cmd':
				case 'command':
				case 'meta':
					return '⌘';
				case 'ctrl':
				case 'control':
					return '⌃';
				case 'alt':
				case 'option':
				case 'opt':
					return '⌥';
				case 'shift':
					return '⇧';
				case 'enter':
				case 'return':
					return '⏎';
				case 'esc':
				case 'escape':
					return 'esc';
				case 'tab':
					return '⇥';
				case 'backspace':
				case 'delete':
					return '⌫';
				case 'space':
					return '␣';
				case 'up':
					return '↑';
				case 'down':
					return '↓';
				case 'left':
					return '←';
				case 'right':
					return '→';
				default:
					return key;
			}
		}
		// Windows / Linux glyphs — favour readable text over unicode
		switch (k) {
			case 'cmd':
			case 'command':
			case 'meta':
				return 'Win';
			case 'ctrl':
			case 'control':
				return 'Ctrl';
			case 'alt':
			case 'option':
			case 'opt':
				return 'Alt';
			case 'shift':
				return 'Shift';
			case 'enter':
			case 'return':
				return 'Enter';
			case 'esc':
			case 'escape':
				return 'Esc';
			case 'tab':
				return 'Tab';
			case 'backspace':
				return 'Backspace';
			case 'delete':
				return 'Del';
			case 'space':
				return 'Space';
			case 'up':
				return '↑';
			case 'down':
				return '↓';
			case 'left':
				return '←';
			case 'right':
				return '→';
			default:
				return key;
		}
	}

	const renderedKeys = $derived(keyList.map((k) => symbolFor(k, isMac)));

	// SR label: "Cmd plus K" reads better than "⌘ + K" — always spell out.
	const computedAriaLabel = $derived(ariaLabel ?? keyList.join(' plus '));
</script>

<kbd
	class="kbd kbd-{size} {extraClass}"
	aria-label={computedAriaLabel}
>
	{#each renderedKeys as symbol, i (i)}
		{#if i > 0}
			<span class="kbd-sep" aria-hidden="true">{separator}</span>
		{/if}
		<span class="kbd-key">{symbol}</span>
	{/each}
</kbd>

<style>
	.kbd {
		/*
		 * Theming tokens — light defaults here, dark flip in the media
		 * block at the bottom of this stylesheet. All seven are chrome
		 * (a kbd cap has no brand-tinted variants — bg/fg/border/shadow
		 * all read fine on either scheme), so the whole set flips
		 * together. To retheme, target .kbd with ≥2-class specificity
		 * — required to overcome this rule's (0,2,0) scoped specificity.
		 * An ancestor :root or body rule sets a value that descendants
		 * would inherit, but that inherited value is shadowed by this
		 * rule's own declaration on the .kbd element — declared values
		 * always win over inherited values on the element where they're
		 * declared. See docs/THEMING.md for the full mechanism.
		 */
		--kbd-fg: #374151;
		--kbd-bg-top: #ffffff;
		--kbd-bg-bottom: #f3f4f6;
		--kbd-border: #d1d5db;
		--kbd-shadow-inner: #d1d5db;
		--kbd-shadow-drop: rgba(0, 0, 0, 0.05);
		--kbd-sep-color: #9ca3af;

		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: inherit;
		font-style: normal;
		line-height: 1;
		vertical-align: middle;
		white-space: nowrap;
	}

	.kbd-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.15rem 0.45rem;
		min-width: 1.5em;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-weight: 600;
		color: var(--kbd-fg);
		background: linear-gradient(180deg, var(--kbd-bg-top) 0%, var(--kbd-bg-bottom) 100%);
		border: 1px solid var(--kbd-border);
		border-radius: 0.3rem;
		box-shadow:
			inset 0 -1px 0 var(--kbd-shadow-inner),
			0 1px 2px var(--kbd-shadow-drop);
	}

	.kbd-sm {
		font-size: 0.75rem;
	}

	.kbd-sm .kbd-key {
		padding: 0.1rem 0.35rem;
		min-width: 1.25em;
		border-radius: 0.25rem;
	}

	.kbd-md {
		font-size: 0.875rem;
	}

	.kbd-lg {
		font-size: 1rem;
	}

	.kbd-lg .kbd-key {
		padding: 0.25rem 0.6rem;
		min-width: 1.75em;
		border-radius: 0.35rem;
	}

	.kbd-sep {
		font-size: 0.85em;
		color: var(--kbd-sep-color);
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-weight: 400;
	}

	/*
	 * Dark mode — flip all seven chrome tokens so the cap reads on dark
	 * surfaces. There are no brand variants on a kbd cap (Pattern #67
	 * doesn't split), so the whole token set flips together. Consumer
	 * overrides that reach ≥2-class specificity (e.g. body .kbd.kbd) still
	 * win in dark mode — they clear the component's scoped (0,2,0) baseline
	 * and cascade after this block. See docs/THEMING.md for the full
	 * arithmetic.
	 */
	@media (prefers-color-scheme: dark) {
		.kbd {
			--kbd-fg: #d1d5db;
			--kbd-bg-top: #1f2937;
			--kbd-bg-bottom: #111827;
			--kbd-border: #4b5563;
			--kbd-shadow-inner: #4b5563;
			--kbd-shadow-drop: rgba(0, 0, 0, 0.4);
			--kbd-sep-color: #6b7280;
		}
	}
</style>
