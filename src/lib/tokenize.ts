/**
 * ============================================================
 * tokenize — tiny syntax tokenizer for CodeBlock
 * ============================================================
 *
 * 🎯 WHAT IT DOES
 * Splits a string of source code into typed tokens (keyword,
 * string, number, comment, etc.) so a code-display component
 * can paint each token a different colour without pulling in
 * a 200KB highlighter library.
 *
 * ✨ FEATURES
 * • Six languages: ts, js, svelte, json, bash, plain
 * • First-match-wins ordered rules (no AST, no lookahead)
 * • Identifier-set lookup decides keyword vs type
 * • Heuristic detectLanguage with hint passthrough
 * • Adjacent-plain token merging keeps the stream tidy
 * • escapeHtml re-exported so the consumer doesn't have to
 *   import from two places
 *
 * ⚡ PERFORMANCE
 * • Linear scan, single pass per language
 * • No regex backtracking in hot loops
 * • Suitable for code blocks up to a few thousand LOC
 *
 * 📦 DEPENDENCIES
 * • Internal: ./htmlUtils (escapeHtml)
 *
 * ============================================================
 */

import { escapeHtml } from './htmlUtils';

// Re-export so CodeBlock only needs one import
export { escapeHtml };
// All-caps alias for callers who prefer escapeHTML naming
export const escapeHTML = escapeHtml;

// ============================================================
// Public types
// ============================================================

/**
 * Every classifiable atom we emit. Anything we can't classify
 * falls back to 'plain', which the renderer leaves unstyled.
 */
export type TokenKind =
	| 'keyword'
	| 'string'
	| 'comment'
	| 'number'
	| 'punct'
	| 'type'
	| 'regex'
	| 'tag'
	| 'attr'
	| 'plain';

export interface Token {
	kind: TokenKind;
	value: string;
}

export const SUPPORTED_LANGUAGES = ['ts', 'js', 'svelte', 'json', 'bash', 'plain'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Type-guard for narrowing user input to a Language.
 * Accepts unknown so we can pass anything in safely.
 */
export function isSupportedLanguage(s: unknown): s is Language {
	return typeof s === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(s);
}

// ============================================================
// Identifier sets — these decide keyword vs type vs plain
// ============================================================

const TS_KEYWORDS = new Set([
	'let', 'const', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
	'switch', 'case', 'break', 'continue', 'class', 'extends', 'implements', 'new',
	'this', 'super', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'import',
	'export', 'from', 'default', 'as', 'in', 'of', 'typeof', 'instanceof', 'delete',
	'void', 'yield', 'static', 'public', 'private', 'protected', 'readonly', 'abstract',
	'get', 'set', 'keyof', 'infer', 'satisfies', 'is', 'module', 'require',
	'interface', 'type', 'enum', 'namespace', 'declare'
]);

const TS_TYPES = new Set([
	'string', 'number', 'boolean', 'object', 'undefined', 'null', 'never', 'any',
	'unknown', 'true', 'false', 'Array', 'Promise', 'Record', 'Set', 'Map', 'Date',
	'Math', 'JSON', 'Object', 'Error', 'RegExp', 'Partial', 'Required', 'Readonly',
	'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'ReturnType', 'Parameters',
	'Awaited'
]);

const BASH_KEYWORDS = new Set([
	'if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while', 'until',
	'case', 'esac', 'function', 'return', 'in', 'select', 'time', 'break',
	'continue', 'exit', 'export', 'local', 'readonly', 'declare', 'typeset',
	'set', 'unset', 'source', 'echo', 'printf', 'read', 'test', 'true', 'false'
]);

const JSON_LITERALS = new Set(['true', 'false', 'null']);

// ============================================================
// Public API
// ============================================================

/**
 * Pick a language for a snippet. If the caller gave a valid hint
 * we trust them. Otherwise we use lightweight heuristics — these
 * are intentionally cheap, not perfect.
 */
export function detectLanguage(code: string, hint?: unknown): Language {
	if (isSupportedLanguage(hint)) return hint;

	const sample = code.trimStart().slice(0, 400);
	if (sample === '') return 'plain';

	// JSON looks like {"..." or ["..."
	if (/^[{[]/.test(sample) && /["]/.test(sample) && !/\bfunction\b|=>/.test(sample)) {
		return 'json';
	}

	// Bash markers — shebang, $-vars, common shell keywords at line start
	if (/^#!\/.*\b(bash|sh|zsh)\b/.test(sample)) return 'bash';
	if (/(^|\n)\s*(echo|export|cd|ls|mkdir|rm|cat|grep|sed|awk|chmod|sudo)\s/.test(sample)) {
		return 'bash';
	}

	// Svelte — tag-like opener or directive
	if (/<script\b|<style\b|\{#each\b|\{#if\b|\{@html\b|\{@const\b/.test(sample)) {
		return 'svelte';
	}
	if (/^<[a-zA-Z]/.test(sample)) return 'svelte';

	// TypeScript signals
	if (/\binterface\s+\w/.test(sample)) return 'ts';
	if (/:\s*(string|number|boolean|void|any|unknown|never)\b/.test(sample)) return 'ts';
	if (/\btype\s+\w+\s*=/.test(sample)) return 'ts';
	if (/\bas\s+const\b/.test(sample)) return 'ts';

	// Anything else with JS-ish syntax
	if (/\b(const|let|var|function|=>|return|import|export)\b/.test(sample)) return 'js';

	return 'plain';
}

/**
 * Main dispatcher. Returns a flat token stream — the renderer
 * walks it once and emits one <span> per token. Adjacent plain
 * tokens are merged so we don't fragment whitespace.
 */
export function tokenize(code: string, lang: Language): Token[] {
	if (code === '') return [];
	switch (lang) {
		case 'plain': return tokenizePlain(code);
		case 'json': return tokenizeJSON(code);
		case 'bash': return tokenizeBash(code);
		case 'js': return tokenizeJS(code);
		case 'ts': return tokenizeTS(code);
		case 'svelte': return tokenizeSvelte(code);
		default: return tokenizePlain(code);
	}
}

/**
 * Collapses consecutive plain tokens into one. Keeps the token
 * stream short and means whitespace doesn't get split into a
 * dozen single-char tokens.
 */
export function mergeAdjacentPlain(tokens: Token[]): Token[] {
	const out: Token[] = [];
	for (const t of tokens) {
		const last = out[out.length - 1];
		if (last && last.kind === 'plain' && t.kind === 'plain') {
			last.value += t.value;
		} else {
			out.push({ ...t });
		}
	}
	return out;
}

// ============================================================
// Per-language tokenizers
// ============================================================

function tokenizePlain(code: string): Token[] {
	return code === '' ? [] : [{ kind: 'plain', value: code }];
}

/**
 * JSON is strict — no comments, only double-quote strings,
 * three literal words (true/false/null). Anything weird falls
 * through to 'plain' so the input never crashes the tokenizer.
 */
function tokenizeJSON(code: string): Token[] {
	const tokens: Token[] = [];
	const n = code.length;
	let i = 0;

	while (i < n) {
		const ch = code[i];

		if (ch === '"') {
			const j = scanString(code, i, '"');
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (isDigit(ch) || (ch === '-' && isDigit(code[i + 1]))) {
			const j = scanNumber(code, i);
			tokens.push({ kind: 'number', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (isAlpha(ch)) {
			const j = scanIdent(code, i);
			const word = code.slice(i, j);
			tokens.push({
				kind: JSON_LITERALS.has(word) ? 'keyword' : 'plain',
				value: word
			});
			i = j;
			continue;
		}

		if (/[{}[\],:]/.test(ch)) {
			tokens.push({ kind: 'punct', value: ch });
			i++;
			continue;
		}

		tokens.push({ kind: 'plain', value: ch });
		i++;
	}

	return mergeAdjacentPlain(tokens);
}

/**
 * Bash — single-line comments with #, single and double quoted
 * strings (we don't try to interpolate $vars inside double-quotes
 * for M1), $variables and ${variables}, basic keywords.
 */
function tokenizeBash(code: string): Token[] {
	const tokens: Token[] = [];
	const n = code.length;
	let i = 0;

	while (i < n) {
		const ch = code[i];

		// # comments — but only if it's a real comment, not part of an identifier
		if (ch === '#' && (i === 0 || /\s/.test(code[i - 1]))) {
			const j = scanToEndOfLine(code, i);
			tokens.push({ kind: 'comment', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (ch === '"') {
			const j = scanString(code, i, '"');
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (ch === "'") {
			const j = scanString(code, i, "'");
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		// $VAR or ${VAR}
		if (ch === '$') {
			if (code[i + 1] === '{') {
				let j = i + 2;
				while (j < n && code[j] !== '}') j++;
				if (j < n) j++;
				tokens.push({ kind: 'type', value: code.slice(i, j) });
				i = j;
				continue;
			}
			if (isAlpha(code[i + 1]) || code[i + 1] === '_') {
				let j = i + 1;
				while (j < n && (isAlphaNum(code[j]) || code[j] === '_')) j++;
				tokens.push({ kind: 'type', value: code.slice(i, j) });
				i = j;
				continue;
			}
		}

		if (isDigit(ch)) {
			const j = scanNumber(code, i);
			tokens.push({ kind: 'number', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (isAlpha(ch) || ch === '_') {
			const j = scanIdent(code, i);
			const word = code.slice(i, j);
			tokens.push({
				kind: BASH_KEYWORDS.has(word) ? 'keyword' : 'plain',
				value: word
			});
			i = j;
			continue;
		}

		if (/[{}()[\];,|&<>=!]/.test(ch)) {
			tokens.push({ kind: 'punct', value: ch });
			i++;
			continue;
		}

		tokens.push({ kind: 'plain', value: ch });
		i++;
	}

	return mergeAdjacentPlain(tokens);
}

/**
 * JavaScript — line comments, block comments, three string types
 * (template / double / single), numbers, identifiers (with keyword
 * lookup), basic punctuation. We deliberately don't try to parse
 * regex literals in M1 — `/` is always punct.
 */
function tokenizeJS(code: string): Token[] {
	return tokenizeJSCommon(code, false);
}

function tokenizeTS(code: string): Token[] {
	return tokenizeJSCommon(code, true);
}

function tokenizeJSCommon(code: string, isTS: boolean): Token[] {
	const tokens: Token[] = [];
	const n = code.length;
	let i = 0;

	while (i < n) {
		const ch = code[i];

		// Line comment
		if (ch === '/' && code[i + 1] === '/') {
			const j = scanToEndOfLine(code, i);
			tokens.push({ kind: 'comment', value: code.slice(i, j) });
			i = j;
			continue;
		}

		// Block comment
		if (ch === '/' && code[i + 1] === '*') {
			let j = i + 2;
			while (j < n - 1 && !(code[j] === '*' && code[j + 1] === '/')) j++;
			j = Math.min(j + 2, n);
			tokens.push({ kind: 'comment', value: code.slice(i, j) });
			i = j;
			continue;
		}

		// Template string — we tokenize the whole thing (including ${...})
		// as one string in M1; CodeBlock M2 can split out interpolations.
		if (ch === '`') {
			const j = scanTemplate(code, i);
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (ch === '"') {
			const j = scanString(code, i, '"');
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (ch === "'") {
			const j = scanString(code, i, "'");
			tokens.push({ kind: 'string', value: code.slice(i, j) });
			i = j;
			continue;
		}

		// Number — including hex / binary / octal / floats / bigints
		if (isDigit(ch) || (ch === '.' && isDigit(code[i + 1]))) {
			const j = scanNumber(code, i);
			tokens.push({ kind: 'number', value: code.slice(i, j) });
			i = j;
			continue;
		}

		if (isAlpha(ch) || ch === '_' || ch === '$') {
			const j = scanIdent(code, i);
			const word = code.slice(i, j);
			let kind: TokenKind = 'plain';
			if (TS_KEYWORDS.has(word)) {
				kind = 'keyword';
			} else if (isTS && TS_TYPES.has(word)) {
				kind = 'type';
			} else if (!isTS && (word === 'true' || word === 'false' || word === 'null' || word === 'undefined')) {
				kind = 'type';
			}
			tokens.push({ kind, value: word });
			i = j;
			continue;
		}

		if (/[{}()[\];,.<>+\-*/%=!&|^~?:]/.test(ch)) {
			tokens.push({ kind: 'punct', value: ch });
			i++;
			continue;
		}

		tokens.push({ kind: 'plain', value: ch });
		i++;
	}

	return mergeAdjacentPlain(tokens);
}

/**
 * Svelte — a hybrid scan. When we see a tag opener we emit
 * tag/attr tokens; inside `{...}` we recurse into the JS
 * tokenizer; HTML comments become 'comment'. Plain text falls
 * through to the plain bucket. M1 doesn't try to parse <script>
 * blocks specially — the JS tokenizer handles that content well
 * enough on its own.
 */
function tokenizeSvelte(code: string): Token[] {
	const tokens: Token[] = [];
	const n = code.length;
	let i = 0;

	while (i < n) {
		const ch = code[i];

		// HTML comment
		if (ch === '<' && code.slice(i, i + 4) === '<!--') {
			let j = i + 4;
			while (j < n - 2 && !(code[j] === '-' && code[j + 1] === '-' && code[j + 2] === '>')) j++;
			j = Math.min(j + 3, n);
			tokens.push({ kind: 'comment', value: code.slice(i, j) });
			i = j;
			continue;
		}

		// Tag — <name or </name
		if (ch === '<' && (isAlpha(code[i + 1]) || code[i + 1] === '/')) {
			const isClose = code[i + 1] === '/';
			tokens.push({ kind: 'punct', value: isClose ? '</' : '<' });
			i += isClose ? 2 : 1;
			const nameStart = i;
			while (i < n && (isAlphaNum(code[i]) || code[i] === '-' || code[i] === ':')) i++;
			if (i > nameStart) {
				tokens.push({ kind: 'tag', value: code.slice(nameStart, i) });
			}

			// Inside the tag, until > or />
			while (i < n && code[i] !== '>') {
				if (/\s/.test(code[i])) {
					const ws = scanWhile(code, i, (c) => /\s/.test(c));
					tokens.push({ kind: 'plain', value: code.slice(i, ws) });
					i = ws;
					continue;
				}

				if (code[i] === '/' && code[i + 1] === '>') {
					break;
				}

				// Attribute name — supports : and -
				if (isAlpha(code[i]) || code[i] === '_' || code[i] === ':') {
					const attrStart = i;
					while (i < n && (isAlphaNum(code[i]) || code[i] === '-' || code[i] === ':' || code[i] === '_')) i++;
					tokens.push({ kind: 'attr', value: code.slice(attrStart, i) });

					if (code[i] === '=') {
						tokens.push({ kind: 'punct', value: '=' });
						i++;
						if (code[i] === '"' || code[i] === "'") {
							const quote = code[i];
							const j = scanString(code, i, quote);
							tokens.push({ kind: 'string', value: code.slice(i, j) });
							i = j;
						} else if (code[i] === '{') {
							i = consumeMustache(code, i, tokens);
						}
					}
					continue;
				}

				tokens.push({ kind: 'plain', value: code[i] });
				i++;
			}

			if (code[i] === '/' && code[i + 1] === '>') {
				tokens.push({ kind: 'punct', value: '/>' });
				i += 2;
			} else if (code[i] === '>') {
				tokens.push({ kind: 'punct', value: '>' });
				i++;
			}
			continue;
		}

		// Mustache block
		if (ch === '{') {
			i = consumeMustache(code, i, tokens);
			continue;
		}

		// Plain text — until next interesting character
		const j = scanWhile(code, i, (c) => c !== '<' && c !== '{');
		if (j > i) {
			tokens.push({ kind: 'plain', value: code.slice(i, j) });
			i = j;
			continue;
		}

		tokens.push({ kind: 'plain', value: ch });
		i++;
	}

	return mergeAdjacentPlain(tokens);
}

// ============================================================
// Shared scanners — pure helpers, exported for tests
// ============================================================

function isAlpha(ch: string | undefined): boolean {
	return ch !== undefined && /[a-zA-Z]/.test(ch);
}

function isDigit(ch: string | undefined): boolean {
	return ch !== undefined && /[0-9]/.test(ch);
}

function isAlphaNum(ch: string | undefined): boolean {
	return ch !== undefined && /[a-zA-Z0-9]/.test(ch);
}

function scanWhile(code: string, start: number, pred: (c: string) => boolean): number {
	let j = start;
	while (j < code.length && pred(code[j])) j++;
	return j;
}

function scanToEndOfLine(code: string, start: number): number {
	let j = start;
	while (j < code.length && code[j] !== '\n') j++;
	return j;
}

function scanIdent(code: string, start: number): number {
	let j = start;
	while (j < code.length && (isAlphaNum(code[j]) || code[j] === '_' || code[j] === '$')) j++;
	return j;
}

/**
 * Scans a quoted string starting at code[start]. Handles backslash
 * escapes and stops at an unescaped matching quote OR end of line
 * (so a runaway quote doesn't eat the rest of the file).
 */
function scanString(code: string, start: number, quote: string): number {
	const n = code.length;
	let j = start + 1;
	while (j < n) {
		if (code[j] === '\\') {
			j += 2;
			continue;
		}
		if (code[j] === quote) {
			return j + 1;
		}
		if (code[j] === '\n' && quote !== '`') {
			return j;
		}
		j++;
	}
	return j;
}

/**
 * Template strings can span lines and contain ${...}. We don't
 * recurse into the expression in M1 — the whole template is one
 * string token. M2 can split it.
 */
function scanTemplate(code: string, start: number): number {
	const n = code.length;
	let j = start + 1;
	while (j < n) {
		if (code[j] === '\\') {
			j += 2;
			continue;
		}
		if (code[j] === '`') return j + 1;
		if (code[j] === '$' && code[j + 1] === '{') {
			let depth = 1;
			j += 2;
			while (j < n && depth > 0) {
				if (code[j] === '{') depth++;
				else if (code[j] === '}') depth--;
				if (depth > 0) j++;
			}
			if (j < n) j++;
			continue;
		}
		j++;
	}
	return j;
}

/**
 * Numbers — hex (0x), binary (0b), octal (0o), decimals with
 * optional exponent, optional bigint suffix. We're permissive:
 * weird-looking input still terminates cleanly.
 */
function scanNumber(code: string, start: number): number {
	const n = code.length;
	let j = start;

	if (code[j] === '-' || code[j] === '+') j++;

	if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
		j += 2;
		while (j < n && /[0-9a-fA-F_]/.test(code[j])) j++;
	} else if (code[j] === '0' && (code[j + 1] === 'b' || code[j + 1] === 'B')) {
		j += 2;
		while (j < n && /[01_]/.test(code[j])) j++;
	} else if (code[j] === '0' && (code[j + 1] === 'o' || code[j + 1] === 'O')) {
		j += 2;
		while (j < n && /[0-7_]/.test(code[j])) j++;
	} else {
		while (j < n && /[0-9_]/.test(code[j])) j++;
		if (code[j] === '.') {
			j++;
			while (j < n && /[0-9_]/.test(code[j])) j++;
		}
		if (code[j] === 'e' || code[j] === 'E') {
			j++;
			if (code[j] === '+' || code[j] === '-') j++;
			while (j < n && /[0-9_]/.test(code[j])) j++;
		}
	}

	if (code[j] === 'n') j++;
	return j;
}

/**
 * Consumes a `{...}` block from start. Recognises Svelte block
 * markers (#if, /each, :else, @html, @const, @debug) and emits
 * them as keywords; the rest of the body runs through tokenizeJS.
 * Returns the index just past the closing `}`.
 */
function consumeMustache(code: string, start: number, tokens: Token[]): number {
	const n = code.length;
	tokens.push({ kind: 'punct', value: '{' });
	let i = start + 1;

	// Block markers like {#each ... } or {/if} or {:else} or {@html ...}
	if (i < n && (code[i] === '#' || code[i] === '/' || code[i] === ':' || code[i] === '@')) {
		const markerStart = i;
		i++;
		while (i < n && isAlpha(code[i])) i++;
		const marker = code.slice(markerStart, i);
		if (marker.length > 1) {
			tokens.push({ kind: 'keyword', value: marker });
		}
	}

	// Find matching close brace
	let depth = 1;
	const exprStart = i;
	while (i < n && depth > 0) {
		if (code[i] === '\\') {
			i += 2;
			continue;
		}
		if (code[i] === '"' || code[i] === "'") {
			i = scanString(code, i, code[i]);
			continue;
		}
		if (code[i] === '`') {
			i = scanTemplate(code, i);
			continue;
		}
		if (code[i] === '{') depth++;
		else if (code[i] === '}') depth--;
		if (depth > 0) i++;
	}

	if (i > exprStart) {
		const inner = code.slice(exprStart, i);
		const innerTokens = tokenizeJS(inner);
		tokens.push(...innerTokens);
	}

	if (i < n && code[i] === '}') {
		tokens.push({ kind: 'punct', value: '}' });
		i++;
	}

	return i;
}
