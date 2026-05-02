# CodeBlock — Technical Logic Explainer

## What Does It Do? (Plain English)

CodeBlock renders a string of source code with token-coloured syntax highlighting, optional line numbers, optional highlighted line ranges, a header bar with title or filename, and a copy-to-clipboard button. Five visual variants (`plain`, `lined`, `titled`, `diff`, `terminal`), three sizes, six languages, light/dark themes — but built on a tiny in-house tokenizer (`$lib/tokenize`, ~5 KB) instead of a 200 KB highlighter dependency.

Think of it as the lightweight, copy-paste-portable middle ground between a `<pre><code>` and dragging Shiki/Prism into your bundle.

## How It Works (Pseudo-Code)

```
state:
  copyState     = 'idle' | 'copied' | 'failed'
  showCopyButton  = supportsClipboardAPI()  &&  copyable

derive (pure helpers, all exported):
  resolvedVariant   = pickVariant(variant)        // safe fallback
  resolvedSize      = pickSize(size)              // safe fallback
  detectedLanguage  = language ?? detectLanguage(code)
  tokens            = tokenize(code, detectedLanguage)
  lineCount         = countLines(code)
  highlightedLines  = parseLineRange(highlight)   // Set<number>
  showHeader        = !!(title || fileName)
  showLineNumbers   = lineNumbers ?? variantDefault[variant]

events:
  on copy click:
    if !supportsClipboardAPI(): return
    success = await copyToClipboard(code)
    copyState = success ? 'copied' : 'failed'
    setTimeout(() => copyState = 'idle', isReducedMotion ? 0 : 1500)

render flow:
  for each line in tokens.split-on-newlines:
    if showLineNumbers:
      render <span class="gutter">{formatLineNumber(n, lineCount)}</span>
    render line with token spans:
      for each token in line:
        <span class="tok-{token.type}">{escapeHtml(token.value)}</span>
    if highlightedLines.has(n): apply .highlight to the row
```

The component is a thin shell — every interesting bit (tokenizing, language detection, line-range parsing, clipboard probe, reduced-motion probe) is a pure exported helper, individually unit-testable.

## The Core Concept: In-House Tokenizer

The signature trade-off here is "ship a small tokenizer, accept it can't handle every language perfectly" vs "ship Shiki, accept the bundle hit". CodeBlock chose the small tokenizer for three reasons.

**One — most demos don't need perfect.** A docs site, a marketing landing, a UI kit demo — these need TS/JS/Svelte/JSON/bash recognisable, not C++ template-metaprogramming-correct.

**Two — the output format is identical.** `tokenize(code, language)` returns `Token[]` (`{ type: 'keyword' | 'string' | 'comment' | ...; value: string }`). The component walks that array and emits `<span class="tok-{type}">{escapeHtml(value)}</span>`. Replacing the tokenizer with Shiki later is a one-import change.

**Three — XSS hygiene is owned.** Token values are run through `escapeHtml` before being inserted via `{@html}`. The component never inserts user code as raw HTML — even though the input is "code", treating it as untrusted bytes is the safe default.

```
  code = "function add(a: number, b: number) { return a + b; }"

  tokenize(code, 'ts') →
    [
      { type: 'keyword',     value: 'function' },
      { type: 'whitespace',  value: ' ' },
      { type: 'identifier',  value: 'add' },
      { type: 'punctuation', value: '(' },
      { type: 'identifier',  value: 'a' },
      { type: 'punctuation', value: ':' },
      ...
    ]

  emit:
    <span class="tok-keyword">function</span>
    <span> </span>
    <span class="tok-identifier">add</span>
    <span class="tok-punctuation">(</span>
    ...
```

`detectLanguage(code)` runs heuristics (shebangs, JSX/TSX braces, `<script lang="ts">`, `import` syntax) when `language` isn't passed, so a consumer can drop a code string in without knowing which dialect it is.

## XSS Protection

Code is user-supplied bytes. Each token's `value` field passes through `escapeHtml` before `{@html}` insertion:

```js
escapeHtml('<script>alert(1)</script>')
  // → '&lt;script&gt;alert(1)&lt;/script&gt;'
```

The `{@html}` insertion is then safe because:

1. The tokenizer produces only `{ type, value }` shapes — no HTML payload.
2. `value` is escape-encoded.
3. The component owns the wrapping `<span class="tok-...">` and never trusts a token to carry markup.

If the tokenizer is replaced (e.g. with Shiki, which produces HTML directly), the swap point is the only place where the trust boundary moves — but the comment in the source flags this explicitly: *"XSS-safe because we own every byte we insert."*

## Performance

- One linear tokenizer pass per render. Output is cached via `$derived` — re-renders that don't change `code` or `language` reuse the token array.
- Suitable for snippets up to a few thousand lines of code. Past that, consider streaming or virtual scrolling — but the tokenizer cost is dominated by the `<span>` flood at that scale, not the lex.
- `parseLineRange` is forgiving: whitespace tolerant, reversed ranges normalised, non-numeric tokens dropped — single linear pass over the comma-separated string.
- Copy button is gated on `supportsClipboardAPI()` (feature-detected once at mount); on browsers without it, the button doesn't render, so users never click a dead control.
- Reduced-motion users get instant copy feedback (no fade timeout) instead of a 1500ms transient — `aria-live="polite"` still announces the result.

## CSS Animation Strategy

CodeBlock has very little animation. The copy-button feedback is a brief opacity fade on the "Copied!" / "Failed" status text — gated by `prefers-reduced-motion`, which makes it instant. The line-highlight ranges are static background colours with no entrance animation. The terminal variant has no animations whatsoever, by design — it's meant to feel like a frozen screenshot of a real shell.

## State Flow Diagram

```
  [mounted]
        │
        │ derive: tokens, lineCount, highlightedLines, showCopyButton
        ▼
  [rendering]   syntax-highlighted, gutter optional, header optional
        │
        │ user clicks copy
        ▼
  [copying]     await navigator.clipboard.writeText(code)
        │
        ├─ success ──▶ [copied]   aria-live polite: "Copied"
        │                  │
        │                  │ 1500ms timeout (or 0 if reduced-motion)
        │                  ▼
        │              [idle]
        │
        └─ failure ──▶ [failed]   aria-live polite: "Copy failed"
                           │
                           │ 1500ms timeout
                           ▼
                       [idle]

  Browser without Clipboard API:
        copy button never renders. User copies via OS-level select-all.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | Source text to render. |
| `language` | `Language \| string` | auto-detected | Language hint for the tokenizer. |
| `variant` | `'plain' \| 'lined' \| 'titled' \| 'diff' \| 'terminal'` | `'plain'` | Visual variant — `lined` adds gutter, `titled` adds header, `diff` colours `+`/`-` rows, `terminal` swaps to a shell-like skin. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Type scale and padding. |
| `title` | `string` | `undefined` | Header label (forces header to render). |
| `fileName` | `string` | `undefined` | Header label, monospaced (forces header to render). |
| `lineNumbers` | `boolean` | variant default | Override the variant's gutter default. |
| `highlight` | `string` | `undefined` | Comma-separated 1-based line ranges (`"1,3-5,8"`). |
| `wrap` | `boolean` | `false` | Soft-wrap long lines instead of horizontal scroll. |
| `copyable` | `boolean` | `true` | Show the copy button when the Clipboard API is supported. |
| `theme` | `'light' \| 'dark'` | `'dark'` | Colour palette. `terminal` variant ignores this. |
| `aria-label` | `string` | `'Code'` | Region label for screen readers. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `code` is empty string | `countLines` returns `1` (an empty line); gutter shows `1`, no tokens emitted. |
| `code` ends with trailing newline | `countLines` strips one trailing empty line; the gutter doesn't show a phantom blank row. |
| `code` contains CRLF or CR line endings | Normalised to `\n` for line counting and rendering. |
| `language` is unrecognised | Tokenizer falls back to `'plain'` — code renders escaped but uncoloured. |
| `highlight = "5-3"` (reversed range) | `parseLineRange` swaps `lo`/`hi` so it works as `3-5`. |
| `highlight = "abc, 2, 99-"` | Non-numeric tokens dropped; `2` is added; `99-` is dropped (incomplete range). |
| User has `prefers-reduced-motion: reduce` | Copy feedback is instant — no fade timeout. |
| Browser without `navigator.clipboard.writeText` | `supportsClipboardAPI()` returns false; copy button doesn't render. |
| `code` contains `<script>...</script>` literal | `escapeHtml` encodes it; renders as literal text, never executes. |
| Line counts past 99 | `formatLineNumber` pads to the width of the largest number; gutter aligns under tabular-nums. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, module-script exports.
- **`$lib/tokenize`** — in-house tokenizer (~5 KB). Provides `tokenize`, `detectLanguage`, `escapeHtml`, `Language`, `Token` types.
- **`navigator.clipboard`** (native) — feature-detected; copy button hidden when missing.
- Zero external dependencies otherwise — no Shiki, no Prism, no Highlight.js.

## File Structure

```
src/lib/components/CodeBlock.svelte               # implementation
src/lib/components/CodeBlock.md                   # this file (rendered inside ComponentPageShell)
src/lib/components/CodeBlock.test.ts              # vitest unit tests for the pure helpers
src/lib/components/CodeBlockTestHarness.test.svelte  # rendering harness for tokenizer integration
src/lib/tokenize.ts                               # in-house tokenizer + language detection
src/routes/codeblock/+page.svelte                 # demo page
```
