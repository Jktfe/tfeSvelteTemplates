---
name: CodeBlock
category: Helpful UX
author: tfeclaude
status: shipped
---

# CodeBlock

Token-coloured source-code display with five visual variants, three sizes, and a copy button — backed by an in-house ~5 KB tokenizer instead of a 200 KB highlighter library.

## Purpose

Long-form documentation, blog posts, and developer-tool UIs need to render code clearly and accessibly. CodeBlock pairs with our other reading-flow components (ScrollProgressBar, ReadingTOC) and gives you:

- **Plain** — bare code, no chrome, drop-in
- **Lined** — code with a line-number gutter
- **Titled** — header bar with file name, language tag, and copy button
- **Diff** — `+`/`-`/space markers with row-level highlighting
- **Terminal** — terminal-style window with traffic-light dots and a `$` prompt

Six languages are recognised out of the box: `ts`, `js`, `svelte`, `json`, `bash`, `plain`. The detector is heuristic but accurate for typical snippets; pass `language="…"` to override.

## Quick start

```svelte
<script lang="ts">
  import CodeBlock from '$lib/components/CodeBlock.svelte';

  const snippet = `interface User { name: string }
const ada: User = { name: 'Ada' };`;
</script>

<!-- Default: plain variant, dark theme, language auto-detected -->
<CodeBlock code={snippet} />

<!-- Lined variant with light theme and highlighted lines -->
<CodeBlock code={snippet} variant="lined" theme="light" highlight="1,3" />

<!-- Titled variant with a file name and copy button -->
<CodeBlock code={snippet} variant="titled" fileName="user.ts" />

<!-- Terminal variant for shell snippets -->
<CodeBlock code="ls -la\necho hi" variant="terminal" />
```

## Props

| Prop          | Type                                              | Default     | Description                                  |
|---------------|---------------------------------------------------|-------------|----------------------------------------------|
| `code`        | `string`                                          | required    | Source text to render                        |
| `language`    | `'ts'\|'js'\|'svelte'\|'json'\|'bash'\|'plain'`   | auto        | Override the heuristic detector              |
| `variant`     | `'plain'\|'lined'\|'titled'\|'diff'\|'terminal'`  | `'plain'`   | Visual layout                                |
| `size`        | `'sm'\|'md'\|'lg'`                                | `'md'`      | Type scale and padding                       |
| `title`       | `string`                                          | `undefined` | Header label; forces header on plain variant |
| `fileName`    | `string`                                          | `undefined` | Header label, monospaced; forces header      |
| `lineNumbers` | `boolean`                                         | auto        | Override gutter visibility for the variant   |
| `highlight`   | `string` (e.g. `"1,3-5,8"`)                       | `undefined` | Comma-separated 1-based line ranges          |
| `wrap`        | `boolean`                                         | `false`     | Soft-wrap long lines instead of scrolling    |
| `copyable`    | `boolean`                                         | `true`      | Show the copy button when the API is present |
| `theme`       | `'light'\|'dark'`                                 | `'dark'`    | Colour palette (terminal ignores)            |
| `aria-label`  | `string`                                          | `'Code'`    | Region label for screen readers              |

## Variants

- **plain** — no chrome, no line numbers. Inline-friendly. A floating copy button appears on hover.
- **lined** — line-number gutter on the left. Best for tutorials and reference material.
- **titled** — header bar with optional `title` and `fileName`, language tag on the right, copy button. Looks like a code-editor tab.
- **diff** — recognises `+`, `-`, and space prefix. Adds a marker column and tints whole-row backgrounds (green for adds, red for deletes). Auto-shows line numbers.
- **terminal** — dark green-on-black palette, traffic-light dots in the header, `$` prompt rendered before each line. Theme prop is ignored — the look is fixed.

## Helper exports

The module-script exposes pure helpers for testing and downstream use:

| Export                  | Purpose                                                                |
|-------------------------|------------------------------------------------------------------------|
| `VALID_VARIANTS`        | Read-only list of accepted variant names                               |
| `VALID_SIZES`           | Read-only list of accepted size names                                  |
| `isValidVariant(v)`     | Type-guard for variant strings                                         |
| `pickVariant(v)`        | Coerce to valid variant or fall back to `'plain'`                      |
| `isValidSize(s)`        | Type-guard for size strings                                            |
| `pickSize(s)`           | Coerce to valid size or fall back to `'md'`                            |
| `parseLineRange(spec)`  | `"1,3-5,8"` → `Set<number>`; tolerant of whitespace and reversed input |
| `formatLineNumber(n,t)` | Right-aligned padded string for the gutter                             |
| `countLines(code)`      | LF / CRLF / CR-aware line count, ignores a single trailing newline     |
| `supportsClipboardAPI()`| SSR-safe feature probe for `navigator.clipboard`                       |
| `copyToClipboard(text)` | Write to clipboard; returns `true`/`false`, never throws               |
| `isReducedMotion()`     | SSR-safe `prefers-reduced-motion: reduce` probe                        |

The tokenizer module (`$lib/tokenize`) also exports its own helpers: `tokenize(code, lang)`, `detectLanguage(code, hint?)`, `escapeHtml`, `mergeAdjacentPlain`, `SUPPORTED_LANGUAGES`, `isSupportedLanguage`.

## Accessibility

- Wrapper is a `<div role="region">` with a configurable `aria-label`
- Copy button is a real `<button>` with status announced via `aria-live="polite"`
- Line numbers and diff markers are `aria-hidden="true"` so screen readers read the code only
- `prefers-reduced-motion: reduce` shortens the copy-state feedback window and removes hover transitions on the copy button

## Performance

- Single linear tokenizer pass per render, output cached via `$derived`
- Each line rendered into an HTML string via `escapeHtml(token.value)` then injected with `{@html}` — XSS-safe because every byte is escaped
- No external library, no syntax-tree parsing, no async work
- Suitable for snippets up to a few thousand LOC

## Distinct from

- **ScrollProgressBar** — passive viewport position, not code-aware
- **ReadingTOC** — section navigation, not code rendering
- **External highlighters (Prism, Shiki, Highlight.js)** — those bundle a full grammar engine and 100+ languages. CodeBlock trades coverage for size: six languages, ~5 KB tokenizer, zero deps.

## Recipes

### File explorer style

```svelte
<CodeBlock
  code={fileContents}
  variant="titled"
  fileName="src/App.svelte"
  lineNumbers
  highlight="12-18"
/>
```

### Diff with copy disabled

```svelte
<CodeBlock code={patch} variant="diff" copyable={false} />
```

### Mobile-friendly soft-wrap

```svelte
<CodeBlock code={longLineSnippet} wrap variant="lined" />
```

### Light-theme blog post

```svelte
<CodeBlock code={snippet} variant="titled" theme="light" title="Example" />
```

## Browser support

The component works in every modern browser. `navigator.clipboard` is feature-detected — when absent (older browsers, insecure contexts), the copy button is hidden so users never see a feature that wouldn't work.
