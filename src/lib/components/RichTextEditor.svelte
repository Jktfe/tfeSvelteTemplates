<!--
  ===========================================================
  RICH TEXT EDITOR
  ===========================================================
  WHAT — A contenteditable rich-text editor with a formatting toolbar that
         outputs sanitised HTML on every edit.
  FEATURES
    - Toolbar: bold, italic, underline, H2, bullet list, ordered list, link, clear
    - Toolbar buttons reflect the live active state of the caret/selection
    - Inline allowlist sanitiser strips scripts, styles, event handlers and
      dangerous tags; keeps b/i/u/strong/em/a[href]/h2/ul/ol/li/p/br
    - Bindable `value` (sanitised HTML) plus an `onChange` callback
    - Placeholder shown when empty
  ACCESSIBILITY
    - role="toolbar" with arrow-key roving focus between buttons
    - Each button has aria-label and aria-pressed reflecting active state
    - Editable region is role="textbox" aria-multiline with an aria-label
    - Visible :focus-visible ring; honours prefers-reduced-motion
  DEPENDENCIES — Zero external dependencies (pure Svelte 5 + scoped CSS + inline SVG).
  USAGE
    <script lang="ts">
      let html = $state('<p>Hello <strong>world</strong></p>');
    </script>
    <RichTextEditor bind:value={html} onChange={(h) => console.log(h)} />
  PROPS
    | Prop        | Type                    | Default              | Description                              |
    | value       | string (bindable)       | ''                   | Sanitised HTML content                   |
    | placeholder | string                  | 'Start writing…'     | Shown when the editor is empty           |
    | onChange    | (html: string) => void  | undefined            | Fires after each sanitised edit          |
    | ariaLabel   | string                  | 'Rich text editor'   | Accessible name for the editable region  |
    | disabled    | boolean                 | false                | Disables editing and the toolbar         |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** Sanitised HTML content. Bindable. */
		value?: string;
		/** Placeholder text shown when the editor is empty. */
		placeholder?: string;
		/** Called with the sanitised HTML after each edit. */
		onChange?: (html: string) => void;
		/** Accessible name for the editable region. */
		ariaLabel?: string;
		/** Disables editing and greys out the toolbar. */
		disabled?: boolean;
	}

	let {
		value = $bindable(''),
		placeholder = 'Start writing…',
		onChange,
		ariaLabel = 'Rich text editor',
		disabled = false
	}: Props = $props();

	// The editable element and a reference to the toolbar for roving focus.
	let editor: HTMLDivElement | null = $state(null);
	let toolbarEl: HTMLDivElement | null = $state(null);

	// Tracks whether the editor currently has no meaningful content, so we
	// can show the placeholder. contenteditable leaves a stray <br> behind.
	let isEmpty = $state(true);

	// Active-state map for the toolbar buttons, refreshed on selection change.
	let active = $state<Record<string, boolean>>({
		bold: false,
		italic: false,
		underline: false,
		h2: false,
		ul: false,
		ol: false
	});

	// ---------------------------------------------------------------
	// Inline allowlist sanitiser
	// ---------------------------------------------------------------
	// We keep this inline (rather than importing sanitize-html) so the
	// component stays copy-paste portable with zero dependencies. It walks
	// the parsed DOM, drops any tag that is not allow-listed, strips every
	// attribute except href on anchors, and rejects dangerous URL schemes.
	const ALLOWED_TAGS = new Set([
		'B', 'I', 'U', 'STRONG', 'EM', 'A', 'H2', 'UL', 'OL', 'LI', 'P', 'BR'
	]);

	function isSafeHref(href: string): boolean {
		const trimmed = href.trim().toLowerCase();
		// Block javascript:, data:, vbscript: and similar script-bearing schemes.
		// Allow http(s), mailto, tel, and relative/anchor links.
		if (/^(https?:|mailto:|tel:)/.test(trimmed)) return true;
		if (/^[a-z][a-z0-9+.-]*:/.test(trimmed)) return false; // any other scheme
		return true; // relative paths, #anchors, ./foo
	}

	function sanitiseNode(node: Node, out: Node, doc: Document): void {
		node.childNodes.forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE) {
				out.appendChild(doc.createTextNode(child.textContent ?? ''));
				return;
			}
			if (child.nodeType !== Node.ELEMENT_NODE) return; // drop comments etc.

			const el = child as Element;
			const tag = el.tagName;

			if (!ALLOWED_TAGS.has(tag)) {
				// Tag not allowed: discard the element but keep its (sanitised)
				// children, so unwrapping a <div>/<span> doesn't lose text.
				sanitiseNode(el, out, doc);
				return;
			}

			const clean = doc.createElement(tag.toLowerCase());

			if (tag === 'A') {
				const href = el.getAttribute('href') ?? '';
				if (isSafeHref(href)) {
					clean.setAttribute('href', href);
					clean.setAttribute('rel', 'noopener noreferrer');
					clean.setAttribute('target', '_blank');
				}
			}
			// All other attributes (style, on*, class, id…) are intentionally dropped.

			sanitiseNode(el, clean, doc);
			out.appendChild(clean);
		});
	}

	function sanitise(dirty: string): string {
		// Parse in a detached document so nothing executes during parsing.
		const doc = document.implementation.createHTMLDocument('');
		doc.body.innerHTML = dirty;
		const result = doc.createElement('div');
		sanitiseNode(doc.body, result, doc);
		return result.innerHTML;
	}

	// ---------------------------------------------------------------
	// Reading active formatting state for the toolbar
	// ---------------------------------------------------------------
	function refreshActive(): void {
		if (typeof document === 'undefined' || disabled) return;
		// queryCommandState is deprecated alongside execCommand but remains the
		// only cross-browser way to read inline formatting state for a caret.
		try {
			active = {
				bold: document.queryCommandState('bold'),
				italic: document.queryCommandState('italic'),
				underline: document.queryCommandState('underline'),
				h2: isWithin('H2'),
				ul: isWithin('UL'),
				ol: isWithin('OL')
			};
		} catch {
			// Some environments throw if there is no active selection — ignore.
		}
	}

	function isWithin(tag: string): boolean {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0 || !editor) return false;
		let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
		while (node && node !== editor) {
			if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === tag) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	}

	// ---------------------------------------------------------------
	// Applying formatting
	// ---------------------------------------------------------------
	function exec(command: string, arg?: string): void {
		if (disabled || !editor) return;
		editor.focus();
		// execCommand is deprecated but is still implemented in every browser
		// and remains the simplest way to drive contenteditable formatting.
		// There is no standard replacement; the alternative is a bespoke
		// Range/Selection engine, which is out of scope for a portable template.
		document.execCommand(command, false, arg);
		commit();
		refreshActive();
	}

	function toggleBlock(tag: 'h2'): void {
		if (disabled || !editor) return;
		editor.focus();
		// Toggle between an H2 heading and a normal paragraph.
		document.execCommand('formatBlock', false, active.h2 ? 'p' : tag);
		commit();
		refreshActive();
	}

	function addLink(): void {
		if (disabled || !editor) return;
		const url = window.prompt('Link URL');
		if (url === null) return; // cancelled
		const trimmed = url.trim();
		if (trimmed === '') {
			document.execCommand('unlink');
		} else if (isSafeHref(trimmed)) {
			editor.focus();
			document.execCommand('createLink', false, trimmed);
		}
		commit();
		refreshActive();
	}

	function clearAll(): void {
		if (disabled || !editor) return;
		// contenteditable requires direct innerHTML control — Svelte does not own the editable region.
		// eslint-disable-next-line svelte/no-dom-manipulating
		editor.innerHTML = '';
		commit();
		editor.focus();
		refreshActive();
	}

	// ---------------------------------------------------------------
	// Reading the editor out: sanitise, dedupe, emit
	// ---------------------------------------------------------------
	function commit(): void {
		if (!editor) return;
		const cleaned = sanitise(editor.innerHTML);
		// Treat a lone <br> or empty paragraph as "empty" for the placeholder.
		const stripped = cleaned.replace(/<br\s*\/?>|<p>\s*<\/p>|\s/gi, '');
		isEmpty = stripped === '';
		if (cleaned !== value) {
			value = cleaned;
			onChange?.(cleaned);
		}
	}

	function handleInput(): void {
		commit();
		refreshActive();
	}

	// Keep the DOM in sync when `value` is set from outside (e.g. a reset
	// button), but never clobber what the user is actively typing.
	$effect(() => {
		if (editor && editor.innerHTML !== value && document.activeElement !== editor) {
			const cleaned = sanitise(value);
			// eslint-disable-next-line svelte/no-dom-manipulating
			editor.innerHTML = cleaned;
			if (cleaned !== value) value = cleaned;
			const stripped = cleaned.replace(/<br\s*\/?>|<p>\s*<\/p>|\s/gi, '');
			isEmpty = stripped === '';
		}
	});

	// ---------------------------------------------------------------
	// Toolbar roving focus (arrow keys move between buttons)
	// ---------------------------------------------------------------
	function handleToolbarKeydown(event: KeyboardEvent): void {
		if (!toolbarEl) return;
		const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
		if (!keys.includes(event.key)) return;
		const buttons = Array.from(
			toolbarEl.querySelectorAll<HTMLButtonElement>('button:not([disabled])')
		);
		const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
		if (current === -1) return;
		event.preventDefault();
		let next = current;
		if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
		else if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = buttons.length - 1;
		buttons[next]?.focus();
	}

	const tools = [
		{ id: 'bold', label: 'Bold', cmd: () => exec('bold') },
		{ id: 'italic', label: 'Italic', cmd: () => exec('italic') },
		{ id: 'underline', label: 'Underline', cmd: () => exec('underline') },
		{ id: 'h2', label: 'Heading', cmd: () => toggleBlock('h2') },
		{ id: 'ul', label: 'Bullet list', cmd: () => exec('insertUnorderedList') },
		{ id: 'ol', label: 'Numbered list', cmd: () => exec('insertOrderedList') },
		{ id: 'link', label: 'Insert link', cmd: addLink },
		{ id: 'clear', label: 'Clear formatting', cmd: clearAll }
	];
</script>

<div class="rte" class:rte-disabled={disabled}>
	<div
		class="rte-toolbar"
		role="toolbar"
		aria-label="Text formatting"
		tabindex="-1"
		bind:this={toolbarEl}
		onkeydown={handleToolbarKeydown}
	>
		{#each tools as tool, i (tool.id)}
			<button
				type="button"
				class="rte-btn"
				class:is-active={active[tool.id]}
				aria-label={tool.label}
				aria-pressed={tool.id in active ? (active[tool.id] ? 'true' : 'false') : undefined}
				tabindex={i === 0 ? 0 : -1}
				{disabled}
				onmousedown={(e) => e.preventDefault()}
				onclick={tool.cmd}
			>
				{#if tool.id === 'bold'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
				{:else if tool.id === 'italic'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="14" y1="4" x2="19" y2="4" /><line x1="5" y1="20" x2="10" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
				{:else if tool.id === 'underline'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="21" x2="20" y2="21" /></svg>
				{:else if tool.id === 'h2'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><text x="2" y="18" font-size="16" font-weight="700" fill="currentColor" stroke="none">H2</text></svg>
				{:else if tool.id === 'ul'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4" cy="6" r="1.6" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.6" fill="currentColor" stroke="none" /><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /></svg>
				{:else if tool.id === 'ol'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><text x="1" y="8" font-size="7" fill="currentColor" stroke="none">1.</text><text x="1" y="15" font-size="7" fill="currentColor" stroke="none">2.</text><text x="1" y="22" font-size="7" fill="currentColor" stroke="none">3.</text><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /></svg>
				{:else if tool.id === 'link'}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5" /></svg>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7V4h16v3" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="16" y1="10" x2="21" y2="15" /><line x1="21" y1="10" x2="16" y2="15" /></svg>
				{/if}
			</button>
		{/each}
	</div>

	<div class="rte-surface">
		<div
			class="rte-editor"
			bind:this={editor}
			contenteditable={!disabled}
			role="textbox"
			aria-multiline="true"
			aria-label={ariaLabel}
			tabindex={disabled ? -1 : 0}
			oninput={handleInput}
			onkeyup={refreshActive}
			onmouseup={refreshActive}
			onfocus={refreshActive}
		></div>
		{#if isEmpty}
			<p class="rte-placeholder" aria-hidden="true">{placeholder}</p>
		{/if}
	</div>
</div>

<style>
	.rte {
		/* Light defaults — overridden by the dark-scheme block below. */
		--rte-bg: #ffffff;
		--rte-fg: #1a1a1a;
		--rte-muted: #8a8f98;
		--rte-border: #d9dce1;
		--rte-toolbar-bg: #f6f7f9;
		--rte-btn-hover: #e8eaed;
		--rte-btn-active-bg: #2563eb;
		--rte-btn-active-fg: #ffffff;
		--rte-accent: #2563eb;
		--rte-link: #2563eb;

		border: 1px solid var(--rte-border);
		border-radius: 0.625rem;
		background: var(--rte-bg);
		color: var(--rte-fg);
		overflow: hidden;
		font-family: inherit;
	}

	.rte-disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.rte-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0.4rem;
		background: var(--rte-toolbar-bg);
		border-bottom: 1px solid var(--rte-border);
	}

	.rte-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 0.4rem;
		background: transparent;
		color: var(--rte-fg);
		cursor: pointer;
		transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
	}

	.rte-btn:hover {
		background: var(--rte-btn-hover);
	}

	.rte-btn.is-active {
		background: var(--rte-btn-active-bg);
		color: var(--rte-btn-active-fg);
		border-color: var(--rte-btn-active-bg);
	}

	.rte-btn:focus-visible {
		outline: 2px solid var(--rte-accent);
		outline-offset: 2px;
	}

	.rte-btn svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.rte-surface {
		position: relative;
	}

	.rte-editor {
		min-height: 9rem;
		padding: 0.75rem 0.9rem;
		outline: none;
		line-height: 1.55;
		overflow-wrap: break-word;
	}

	.rte-editor:focus-visible {
		outline: 2px solid var(--rte-accent);
		outline-offset: -2px;
		border-radius: 0.3rem;
	}

	.rte-placeholder {
		position: absolute;
		inset: 0.75rem 0.9rem auto;
		margin: 0;
		color: var(--rte-muted);
		pointer-events: none;
		user-select: none;
	}

	/* Editable content styling — scoped via :global because contenteditable
	   nodes are created at runtime and not seen by Svelte's static analyser. */
	.rte-editor :global(h2) {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0.4rem 0;
	}

	.rte-editor :global(p) {
		margin: 0 0 0.5rem;
	}

	.rte-editor :global(ul),
	.rte-editor :global(ol) {
		margin: 0 0 0.5rem;
		padding-left: 1.5rem;
	}

	.rte-editor :global(a) {
		color: var(--rte-link);
		text-decoration: underline;
	}

	@media (prefers-color-scheme: dark) {
		.rte {
			--rte-bg: #15171c;
			--rte-fg: #e7e9ee;
			--rte-muted: #6b7280;
			--rte-border: #2c313a;
			--rte-toolbar-bg: #1c1f26;
			--rte-btn-hover: #2a2f38;
			--rte-btn-active-bg: #3b82f6;
			--rte-btn-active-fg: #ffffff;
			--rte-accent: #60a5fa;
			--rte-link: #93c5fd;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rte-btn {
			transition: none;
		}
	}
</style>
