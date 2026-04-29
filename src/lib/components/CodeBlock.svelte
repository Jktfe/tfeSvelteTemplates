<!--
  ============================================================
  CodeBlock
  ============================================================

  🎯 WHAT IT DOES
  Renders a string of source code with token-coloured syntax
  highlighting, optional line numbers, a header bar, copy
  button, and a few visual variants — all from a tiny in-house
  tokenizer (~5KB) instead of a 200KB highlighter library.

  ✨ FEATURES
  • Five variants: plain, lined, titled, diff, terminal
  • Three sizes: sm, md, lg
  • Six languages: ts, js, svelte, json, bash, plain
  • Optional line-number gutter and per-line highlight ranges
  • Copy-to-clipboard button (auto-gated on browser support)
  • Light + dark themes; terminal ignores theme by design
  • Soft-wrap toggle; preserves CRLF/CR/LF input
  • SSR-safe — every browser-only call is feature-detected
  • Respects prefers-reduced-motion for the copy feedback

  ♿ ACCESSIBILITY
  • Wrapper exposes role="region" with aria-label
  • Copy button is a real <button> with status announced via
    aria-live (polite)
  • Line numbers use aria-hidden so screen readers read code only
  • prefers-reduced-motion → instant copy feedback (no fade)

  📦 DEPENDENCIES
  • Internal: $lib/tokenize (zero external deps)

  ⚡ PERFORMANCE
  • One linear tokenizer pass per render; output cached via
    $derived. Suitable for snippets up to a few thousand LOC.
  • Token spans are emitted via {@html} after escapeHtml on
    each value — XSS-safe because we own every byte we insert.

  📋 PROPS
  | Prop          | Type                                    | Default     | Description                                  |
  |---------------|-----------------------------------------|-------------|----------------------------------------------|
  | `code`        | `string`                                | required    | Source text to render                        |
  | `language`    | `Language` (or any string hint)         | auto        | Override the heuristic detector              |
  | `variant`     | `'plain'\|'lined'\|'titled'\|'diff'\|'terminal'` | `'plain'`   | Visual layout                                |
  | `size`        | `'sm'\|'md'\|'lg'`                      | `'md'`      | Type scale and padding                       |
  | `title`       | `string`                                | `undefined` | Header label (any variant; forces header)    |
  | `fileName`    | `string`                                | `undefined` | Header label, monospaced (forces header)     |
  | `lineNumbers` | `boolean`                               | auto        | Override default for current variant         |
  | `highlight`   | `string` (e.g. "1,3-5,8")               | `undefined` | Comma-separated 1-based ranges               |
  | `wrap`        | `boolean`                               | `false`     | Soft-wrap long lines instead of scrolling    |
  | `copyable`    | `boolean`                               | `true`      | Show the copy button when supported          |
  | `theme`       | `'light'\|'dark'`                       | `'dark'`    | Colour palette (terminal ignores)            |
  | `aria-label`  | `string`                                | `'Code'`    | Region label for screen readers              |

  ============================================================
-->
<script lang="ts" module>
	import { escapeHtml } from '$lib/tokenize';

	export const VALID_VARIANTS = ['plain', 'lined', 'titled', 'diff', 'terminal'] as const;
	export type CodeBlockVariant = (typeof VALID_VARIANTS)[number];

	export const VALID_SIZES = ['sm', 'md', 'lg'] as const;
	export type CodeBlockSize = (typeof VALID_SIZES)[number];

	export function isValidVariant(v: unknown): v is CodeBlockVariant {
		return typeof v === 'string' && (VALID_VARIANTS as readonly string[]).includes(v);
	}
	export function pickVariant(v: unknown): CodeBlockVariant {
		return isValidVariant(v) ? v : 'plain';
	}
	export function isValidSize(s: unknown): s is CodeBlockSize {
		return typeof s === 'string' && (VALID_SIZES as readonly string[]).includes(s);
	}
	export function pickSize(s: unknown): CodeBlockSize {
		return isValidSize(s) ? s : 'md';
	}

	/**
	 * Parses a line-range string like "1,3-5,8" into a Set of 1-based
	 * line numbers. Forgiving by design — whitespace and reversed
	 * ranges (e.g. "5-3") are normalised; non-numeric tokens dropped.
	 */
	export function parseLineRange(spec: string | undefined | null): Set<number> {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- pure helper; result is consumed inside $derived which provides the reactive boundary, no mutation after return
		const out = new Set<number>();
		if (typeof spec !== 'string') return out;
		for (const part of spec.split(',')) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			if (trimmed.includes('-')) {
				const [aRaw, bRaw] = trimmed.split('-');
				const a = Number(aRaw.trim());
				const b = Number(bRaw.trim());
				if (Number.isFinite(a) && Number.isFinite(b) && a >= 1 && b >= 1) {
					const lo = Math.min(a, b);
					const hi = Math.max(a, b);
					for (let i = lo; i <= hi; i++) out.add(i);
				}
			} else {
				const n = Number(trimmed);
				if (Number.isFinite(n) && n >= 1) out.add(n);
			}
		}
		return out;
	}

	/**
	 * Pads a 1-based line number so all numbers in the gutter share
	 * width. (3, 99) → ' 3'. Uses regular space — visual alignment
	 * is handled by tabular-num font-feature in CSS.
	 */
	export function formatLineNumber(n: number, total: number): string {
		const width = String(Math.max(1, total)).length;
		return String(n).padStart(width, ' ');
	}

	/**
	 * Counts source lines after normalising CRLF / CR / LF. A
	 * trailing newline doesn't add a phantom empty line. An empty
	 * string is one (empty) line.
	 */
	export function countLines(code: string): number {
		if (code === '') return 1;
		const normalised = code.replace(/\r\n?/g, '\n');
		const parts = normalised.split('\n');
		if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
		return parts.length;
	}

	/**
	 * Feature-detects the async Clipboard API. SSR-safe.
	 * We don't show the copy button when this is false.
	 */
	export function supportsClipboardAPI(): boolean {
		return (
			typeof navigator !== 'undefined' &&
			typeof navigator.clipboard !== 'undefined' &&
			typeof navigator.clipboard.writeText === 'function'
		);
	}

	/**
	 * Writes text to the system clipboard. Returns true on success,
	 * false on any failure. Never throws — copy is non-critical UX
	 * and shouldn't break the surrounding app.
	 */
	export async function copyToClipboard(text: string): Promise<boolean> {
		if (!supportsClipboardAPI()) return false;
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * SSR-safe matchMedia probe for the reduced-motion preference.
	 * Returns false on the server (no window) or when matchMedia
	 * throws (some legacy browsers).
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import { tokenize, detectLanguage, type Language, type Token } from '$lib/tokenize';

	interface Props {
		code: string;
		language?: Language | string;
		variant?: CodeBlockVariant | string;
		size?: CodeBlockSize | string;
		title?: string;
		fileName?: string;
		lineNumbers?: boolean;
		highlight?: string;
		wrap?: boolean;
		copyable?: boolean;
		theme?: 'light' | 'dark';
		'aria-label'?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props -- `aria-label` is consumed via the `ariaLabel` rename below and applied to <div role="region" aria-label={ariaLabel}> in the template; lint rule misses dashed→camelCase renames
	let {
		code,
		language,
		variant: variantProp = 'plain',
		size: sizeProp = 'md',
		title,
		fileName,
		lineNumbers,
		highlight,
		wrap = false,
		copyable = true,
		theme = 'dark',
		'aria-label': ariaLabel = 'Code'
	}: Props = $props();

	let variant = $derived(pickVariant(variantProp));
	let size = $derived(pickSize(sizeProp));
	let lang = $derived<Language>(detectLanguage(code, language));
	let showLineNumbers = $derived(
		lineNumbers ?? (variant === 'lined' || variant === 'diff')
	);
	let highlightSet = $derived(parseLineRange(highlight ?? null));
	let lines = $derived(splitLines(code));
	let totalLines = $derived(lines.length);
	let showHeader = $derived(
		variant === 'titled' || variant === 'terminal' || !!title || !!fileName
	);
	let canCopy = $state(false);
	let copyState = $state<'idle' | 'success' | 'error'>('idle');
	let copyTimer: ReturnType<typeof setTimeout> | null = null;
	let showCopy = $derived(copyable && canCopy);

	// We render each line as a sandboxed HTML string. Every token
	// value runs through escapeHtml first, so {@html} is XSS-safe.
	// Lines are joined with literal newlines so the <pre><code> block
	// preserves whitespace exactly as in the source.
	let renderedHtml = $derived.by(() => {
		const out: string[] = [];
		for (let i = 0; i < lines.length; i++) {
			out.push(renderLine(lines[i], i + 1, totalLines, lang, variant, showLineNumbers));
		}
		return out.join('\n');
	});

	$effect(() => {
		canCopy = supportsClipboardAPI();
		return () => {
			if (copyTimer) clearTimeout(copyTimer);
		};
	});

	async function handleCopy() {
		const ok = await copyToClipboard(code);
		copyState = ok ? 'success' : 'error';
		if (copyTimer) clearTimeout(copyTimer);
		const delay = isReducedMotion() ? 1200 : 1800;
		copyTimer = setTimeout(() => {
			copyState = 'idle';
		}, delay);
	}

	function splitLines(text: string): string[] {
		if (text === '') return [''];
		const normalised = text.replace(/\r\n?/g, '\n');
		const parts = normalised.split('\n');
		if (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
		return parts;
	}

	function diffMarker(line: string, variant: CodeBlockVariant): { marker: string; rest: string } {
		if (variant !== 'diff') return { marker: '', rest: line };
		const first = line[0];
		if (first === '+' || first === '-' || first === ' ') {
			return { marker: first, rest: line.slice(1) };
		}
		return { marker: '', rest: line };
	}

	function renderLine(
		raw: string,
		lineNo: number,
		total: number,
		language: Language,
		variant: CodeBlockVariant,
		gutter: boolean
	): string {
		const { marker, rest } = diffMarker(raw, variant);
		const tokens: Token[] = tokenize(rest, language);
		const isHighlighted = highlightSet.has(lineNo);
		const diffClass = marker === '+' ? ' diff-add' : marker === '-' ? ' diff-del' : '';

		let html = `<span class="line${isHighlighted ? ' highlighted' : ''}${diffClass}" data-line="${lineNo}">`;

		if (gutter) {
			html += `<span class="gutter" aria-hidden="true">${escapeHtml(formatLineNumber(lineNo, total))}</span>`;
		}

		if (variant === 'diff') {
			const visibleMark = marker || ' ';
			html += `<span class="diff-mark" aria-hidden="true">${escapeHtml(visibleMark)}</span>`;
		} else if (variant === 'terminal') {
			html += `<span class="prompt" aria-hidden="true">$&nbsp;</span>`;
		}

		html += '<span class="content">';
		if (tokens.length === 0) {
			html += '\u200B'; // zero-width so the empty line stays selectable
		} else {
			for (const t of tokens) {
				html += `<span class="t-${t.kind}">${escapeHtml(t.value)}</span>`;
			}
		}
		html += '</span></span>';

		return html;
	}
</script>

<div
	class="codeblock variant-{variant} size-{size} theme-{theme}"
	class:wrap
	role="region"
	aria-label={ariaLabel}
>
	{#if showHeader}
		<div class="header">
			{#if variant === 'terminal' && !fileName && !title}
				<span class="terminal-dots" aria-hidden="true">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</span>
			{/if}
			{#if fileName}
				<span class="file-name">{fileName}</span>
			{/if}
			{#if title}
				<span class="title">{title}</span>
			{/if}
			<span class="lang-tag" aria-hidden="true">{lang}</span>
			{#if showCopy}
				<button class="copy-btn" type="button" onclick={handleCopy} aria-live="polite">
					{#if copyState === 'success'}
						<span aria-hidden="true">✓</span> Copied
					{:else if copyState === 'error'}
						<span aria-hidden="true">!</span> Failed
					{:else}
						Copy
					{/if}
				</button>
			{/if}
		</div>
	{:else if showCopy}
		<button
			class="copy-btn floating"
			type="button"
			onclick={handleCopy}
			aria-live="polite"
			aria-label="Copy code"
		>
			{#if copyState === 'success'}
				✓
			{:else if copyState === 'error'}
				!
			{:else}
				⧉
			{/if}
		</button>
	{/if}

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- every token value is run through escapeHtml() before injection; only structural <span> wrappers are unescaped, and they come from this component, never from `code` -->
	<pre class="body" data-lang={lang}><code>{@html renderedHtml}</code></pre>
</div>

<style>
	.codeblock {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Code', 'Source Code Pro',
			Consolas, monospace;
		font-feature-settings: 'tnum' 1;
		line-height: 1.55;
		color: var(--cb-fg);
		background: var(--cb-bg);
		--cb-fg: #d4d4d4;
		--cb-bg: #1e1e1e;
		--cb-bg-header: #2d2d2d;
		--cb-fg-muted: #858585;
		--cb-border: #3c3c3c;
		--cb-highlight: rgba(255, 255, 255, 0.06);
		--cb-diff-add: rgba(46, 160, 67, 0.18);
		--cb-diff-del: rgba(248, 81, 73, 0.18);
		--cb-keyword: #c586c0;
		--cb-string: #ce9178;
		--cb-comment: #6a9955;
		--cb-number: #b5cea8;
		--cb-punct: #d4d4d4;
		--cb-type: #4ec9b0;
		--cb-regex: #d16969;
		--cb-tag: #569cd6;
		--cb-attr: #9cdcfe;
	}

	.codeblock.theme-light {
		--cb-fg: #2d2d2d;
		--cb-bg: #f8f8f8;
		--cb-bg-header: #efefef;
		--cb-fg-muted: #6f6f6f;
		--cb-border: #e0e0e0;
		--cb-highlight: rgba(255, 215, 0, 0.18);
		--cb-diff-add: rgba(46, 160, 67, 0.14);
		--cb-diff-del: rgba(248, 81, 73, 0.14);
		--cb-keyword: #af00db;
		--cb-string: #a31515;
		--cb-comment: #008000;
		--cb-number: #098658;
		--cb-punct: #393a34;
		--cb-type: #267f99;
		--cb-regex: #d16969;
		--cb-tag: #800000;
		--cb-attr: #c5252e;
	}

	.codeblock.variant-terminal {
		--cb-fg: #b6f5b6;
		--cb-bg: #0a0f0a;
		--cb-bg-header: #131a13;
		--cb-fg-muted: #6c8a6c;
		--cb-border: #1d2a1d;
		--cb-highlight: rgba(180, 255, 180, 0.06);
		--cb-keyword: #f5c97a;
		--cb-string: #c5d97a;
		--cb-comment: #6c8a6c;
		--cb-number: #d4f59a;
		--cb-punct: #b6f5b6;
		--cb-type: #f5a87a;
		--cb-tag: #b6f5b6;
		--cb-attr: #b6f5b6;
	}

	.codeblock.size-sm {
		font-size: 12px;
	}
	.codeblock.size-md {
		font-size: 14px;
	}
	.codeblock.size-lg {
		font-size: 16px;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.55em 0.9em;
		background: var(--cb-bg-header);
		border-bottom: 1px solid var(--cb-border);
		font-size: 0.85em;
		color: var(--cb-fg-muted);
	}

	.file-name,
	.title {
		flex: 0 1 auto;
		color: var(--cb-fg);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.file-name {
		font-family: inherit;
	}
	.title {
		font-family:
			ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.lang-tag {
		margin-left: auto;
		padding: 0.1em 0.5em;
		border-radius: 999px;
		background: var(--cb-bg);
		color: var(--cb-fg-muted);
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.copy-btn {
		appearance: none;
		border: 1px solid var(--cb-border);
		background: var(--cb-bg);
		color: var(--cb-fg-muted);
		padding: 0.3em 0.7em;
		border-radius: 6px;
		font: inherit;
		font-size: 0.8em;
		cursor: pointer;
		transition: color 120ms ease, border-color 120ms ease;
	}
	.copy-btn:hover {
		color: var(--cb-fg);
		border-color: var(--cb-fg-muted);
	}
	.copy-btn:focus-visible {
		outline: 2px solid var(--cb-attr);
		outline-offset: 2px;
	}
	.copy-btn.floating {
		position: absolute;
		top: 0.6em;
		right: 0.6em;
		padding: 0.25em 0.55em;
		opacity: 0;
		transition: opacity 150ms ease;
	}
	.codeblock:hover .copy-btn.floating,
	.copy-btn.floating:focus-visible {
		opacity: 1;
	}

	.terminal-dots {
		display: inline-flex;
		gap: 0.35em;
	}
	.terminal-dots .dot {
		width: 0.7em;
		height: 0.7em;
		border-radius: 50%;
		background: #555;
	}
	.terminal-dots .dot:nth-child(1) {
		background: #ff5f57;
	}
	.terminal-dots .dot:nth-child(2) {
		background: #ffbd2e;
	}
	.terminal-dots .dot:nth-child(3) {
		background: #27c93f;
	}

	.body {
		margin: 0;
		padding: 0.9em 1em;
		overflow-x: auto;
		white-space: pre;
		tab-size: 2;
	}
	.codeblock.size-sm .body {
		padding: 0.6em 0.8em;
	}
	.codeblock.size-lg .body {
		padding: 1.1em 1.2em;
	}
	.codeblock.wrap .body {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.body code {
		display: block;
		font: inherit;
		color: inherit;
		background: transparent;
	}

	/* Each line is its own row so we can highlight the full width */
	:global(.codeblock .line) {
		display: block;
		padding: 0 0.4em;
		margin: 0 -1em;
		padding-left: 1em;
		padding-right: 1em;
	}
	:global(.codeblock .line.highlighted) {
		background: var(--cb-highlight);
	}
	:global(.codeblock .line.diff-add) {
		background: var(--cb-diff-add);
	}
	:global(.codeblock .line.diff-del) {
		background: var(--cb-diff-del);
	}

	:global(.codeblock .gutter) {
		display: inline-block;
		min-width: 2.5em;
		padding-right: 1em;
		color: var(--cb-fg-muted);
		text-align: right;
		user-select: none;
	}
	:global(.codeblock .diff-mark) {
		display: inline-block;
		width: 1.2em;
		color: var(--cb-fg-muted);
		text-align: center;
		user-select: none;
	}
	:global(.codeblock .line.diff-add .diff-mark) {
		color: #2ea043;
	}
	:global(.codeblock .line.diff-del .diff-mark) {
		color: #f85149;
	}
	:global(.codeblock .prompt) {
		color: var(--cb-keyword);
		user-select: none;
	}

	:global(.codeblock .t-keyword) {
		color: var(--cb-keyword);
	}
	:global(.codeblock .t-string) {
		color: var(--cb-string);
	}
	:global(.codeblock .t-comment) {
		color: var(--cb-comment);
		font-style: italic;
	}
	:global(.codeblock .t-number) {
		color: var(--cb-number);
	}
	:global(.codeblock .t-punct) {
		color: var(--cb-punct);
	}
	:global(.codeblock .t-type) {
		color: var(--cb-type);
	}
	:global(.codeblock .t-regex) {
		color: var(--cb-regex);
	}
	:global(.codeblock .t-tag) {
		color: var(--cb-tag);
	}
	:global(.codeblock .t-attr) {
		color: var(--cb-attr);
	}
	:global(.codeblock .t-plain) {
		color: inherit;
	}

	@media (prefers-reduced-motion: reduce) {
		.copy-btn,
		.copy-btn.floating {
			transition: none;
		}
	}
</style>
