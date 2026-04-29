/**
 * ============================================================
 * tokenize Tests
 * ============================================================
 *
 * 🎯 WHAT THESE COVER
 * Pure-helper tests for the tokenizer module. We exercise:
 *   ✓ escapeHtml + escapeHTML alias
 *   ✓ SUPPORTED_LANGUAGES + isSupportedLanguage type-guard
 *   ✓ detectLanguage hint passthrough and heuristics
 *   ✓ tokenize() per-language coverage
 *   ✓ mergeAdjacentPlain + edge cases (empty input, only-comment,
 *     only-string, runaway quotes)
 *
 * 💡 TIP: Run `bun run test:ui` for a visual interface.
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import {
	escapeHtml,
	escapeHTML,
	SUPPORTED_LANGUAGES,
	isSupportedLanguage,
	detectLanguage,
	tokenize,
	mergeAdjacentPlain,
	type Token
} from './tokenize';

// ============================================================
// escapeHtml / escapeHTML
// ============================================================

describe('escapeHtml', () => {
	it('escapes < and > characters', () => {
		expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
	});

	it('escapes ampersand', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
	});

	it('escapes both quote styles', () => {
		expect(escapeHtml(`"hello" 'world'`)).toBe('&quot;hello&quot; &#39;world&#39;');
	});

	it('returns empty string unchanged', () => {
		expect(escapeHtml('')).toBe('');
	});

	it('leaves non-special characters alone', () => {
		expect(escapeHtml('Hello, world!')).toBe('Hello, world!');
	});

	it('exposes escapeHTML as an alias of escapeHtml', () => {
		expect(escapeHTML).toBe(escapeHtml);
		expect(escapeHTML('<x>')).toBe('&lt;x&gt;');
	});
});

// ============================================================
// SUPPORTED_LANGUAGES + isSupportedLanguage
// ============================================================

describe('SUPPORTED_LANGUAGES', () => {
	it('lists exactly the six M1 languages', () => {
		expect([...SUPPORTED_LANGUAGES]).toEqual(['ts', 'js', 'svelte', 'json', 'bash', 'plain']);
	});
});

describe('isSupportedLanguage', () => {
	it('accepts each supported value', () => {
		for (const l of SUPPORTED_LANGUAGES) {
			expect(isSupportedLanguage(l)).toBe(true);
		}
	});

	it('rejects undefined', () => {
		expect(isSupportedLanguage(undefined)).toBe(false);
	});

	it('rejects non-string types', () => {
		expect(isSupportedLanguage(42)).toBe(false);
		expect(isSupportedLanguage(null)).toBe(false);
		expect(isSupportedLanguage({})).toBe(false);
	});

	it('rejects unknown strings', () => {
		expect(isSupportedLanguage('ruby')).toBe(false);
		expect(isSupportedLanguage('TS')).toBe(false); // case-sensitive
	});
});

// ============================================================
// detectLanguage
// ============================================================

describe('detectLanguage', () => {
	it('passes through a valid hint', () => {
		expect(detectLanguage('whatever', 'bash')).toBe('bash');
	});

	it('ignores an invalid hint and falls back to heuristics', () => {
		expect(detectLanguage('{"a":1}', 'invalid')).toBe('json');
	});

	it('detects JSON from leading brace + quote', () => {
		expect(detectLanguage('{"name": "world"}')).toBe('json');
	});

	it('detects JSON from leading bracket', () => {
		expect(detectLanguage('["a", "b"]')).toBe('json');
	});

	it('detects bash from shebang', () => {
		expect(detectLanguage('#!/bin/bash\nls -la')).toBe('bash');
	});

	it('detects bash from common shell command at line start', () => {
		expect(detectLanguage('echo "hello"\nexport FOO=1')).toBe('bash');
	});

	it('detects svelte from <script> opener', () => {
		expect(detectLanguage('<script lang="ts">let x = 1;</script>')).toBe('svelte');
	});

	it('detects svelte from {#each block', () => {
		expect(detectLanguage('{#each items as item}\n<p>{item}</p>\n{/each}')).toBe('svelte');
	});

	it('detects svelte from a leading tag', () => {
		expect(detectLanguage('<Component foo={1} />')).toBe('svelte');
	});

	it('detects ts from interface declaration', () => {
		expect(detectLanguage('interface User { name: string }')).toBe('ts');
	});

	it('detects ts from type annotation', () => {
		expect(detectLanguage('function add(a: number, b: number) { return a + b }')).toBe('ts');
	});

	it('detects js from generic JS markers', () => {
		expect(detectLanguage('const greet = () => console.log("hi")')).toBe('js');
	});

	it('returns plain for empty input', () => {
		expect(detectLanguage('')).toBe('plain');
		expect(detectLanguage('   \n  ')).toBe('plain');
	});

	it('returns plain for unrecognised content', () => {
		expect(detectLanguage('Just some prose with no code markers.')).toBe('plain');
	});
});

// ============================================================
// tokenize — dispatcher behaviour
// ============================================================

describe('tokenize dispatcher', () => {
	it('returns empty array for empty input', () => {
		expect(tokenize('', 'ts')).toEqual([]);
	});

	it('routes plain language to a single plain token', () => {
		const out = tokenize('hello world', 'plain');
		expect(out).toEqual([{ kind: 'plain', value: 'hello world' }]);
	});

	it('rebuilds the original source when token values are concatenated', () => {
		const code = 'const x: number = 42;';
		const tokens = tokenize(code, 'ts');
		expect(tokens.map((t) => t.value).join('')).toBe(code);
	});
});

// ============================================================
// tokenize — JSON
// ============================================================

describe('tokenize JSON', () => {
	it('classifies strings, numbers, literals and punct', () => {
		const tokens = tokenize('{"a": 1, "b": true, "c": null}', 'json');
		const kinds = tokens.map((t) => t.kind);
		expect(kinds).toContain('string');
		expect(kinds).toContain('number');
		expect(kinds).toContain('keyword'); // true / null
		expect(kinds).toContain('punct');
	});

	it('marks true/false/null as keyword tokens', () => {
		const tokens = tokenize('true false null', 'json');
		const literalTokens = tokens.filter((t) => t.kind === 'keyword');
		expect(literalTokens.map((t) => t.value)).toEqual(['true', 'false', 'null']);
	});

	it('handles negative numbers', () => {
		const tokens = tokenize('-3.14', 'json');
		const num = tokens.find((t) => t.kind === 'number');
		expect(num?.value).toBe('-3.14');
	});

	it('preserves an empty array', () => {
		const tokens = tokenize('[]', 'json');
		expect(tokens).toHaveLength(2);
		expect(tokens.every((t) => t.kind === 'punct')).toBe(true);
	});
});

// ============================================================
// tokenize — Bash
// ============================================================

describe('tokenize Bash', () => {
	it('marks # comment lines as comment tokens', () => {
		const tokens = tokenize('# hello\nls', 'bash');
		const comment = tokens.find((t) => t.kind === 'comment');
		expect(comment?.value).toBe('# hello');
	});

	it('marks $VAR as type token', () => {
		const tokens = tokenize('echo $HOME', 'bash');
		const dollar = tokens.find((t) => t.value === '$HOME');
		expect(dollar?.kind).toBe('type');
	});

	it('marks ${VAR} as type token', () => {
		const tokens = tokenize('echo ${PATH}', 'bash');
		const dollar = tokens.find((t) => t.value === '${PATH}');
		expect(dollar?.kind).toBe('type');
	});

	it('classifies common control keywords', () => {
		const tokens = tokenize('if [ -z "$x" ]; then echo empty; fi', 'bash');
		const keywords = tokens.filter((t) => t.kind === 'keyword').map((t) => t.value);
		expect(keywords).toContain('if');
		expect(keywords).toContain('then');
		expect(keywords).toContain('echo');
		expect(keywords).toContain('fi');
	});

	it('handles quoted strings', () => {
		const tokens = tokenize(`echo "hello world"`, 'bash');
		const str = tokens.find((t) => t.kind === 'string');
		expect(str?.value).toBe('"hello world"');
	});
});

// ============================================================
// tokenize — JavaScript
// ============================================================

describe('tokenize JavaScript', () => {
	it('classifies a line comment', () => {
		const tokens = tokenize('// hello\nlet x = 1;', 'js');
		const comment = tokens.find((t) => t.kind === 'comment');
		expect(comment?.value).toBe('// hello');
	});

	it('classifies a block comment', () => {
		const tokens = tokenize('/* multi\nline */', 'js');
		expect(tokens).toHaveLength(1);
		expect(tokens[0]).toEqual({ kind: 'comment', value: '/* multi\nline */' });
	});

	it('classifies template strings as a single string token', () => {
		const tokens = tokenize('`hello ${name}!`', 'js');
		const str = tokens.find((t) => t.kind === 'string');
		expect(str?.value).toBe('`hello ${name}!`');
	});

	it('classifies double and single quoted strings', () => {
		const tokens = tokenize(`"a" + 'b'`, 'js');
		const strings = tokens.filter((t) => t.kind === 'string').map((t) => t.value);
		expect(strings).toEqual(['"a"', "'b'"]);
	});

	it('classifies hex / binary / float / bigint numbers', () => {
		const tokens = tokenize('0xFF 0b101 3.14 42n', 'js');
		const numbers = tokens.filter((t) => t.kind === 'number').map((t) => t.value);
		expect(numbers).toEqual(['0xFF', '0b101', '3.14', '42n']);
	});

	it('classifies const / function / return as keywords', () => {
		const tokens = tokenize('function add(a){return a;}', 'js');
		const keywords = tokens.filter((t) => t.kind === 'keyword').map((t) => t.value);
		expect(keywords).toEqual(['function', 'return']);
	});

	it('classifies true/false/null/undefined as type', () => {
		const tokens = tokenize('true false null undefined', 'js');
		const types = tokens.filter((t) => t.kind === 'type').map((t) => t.value);
		expect(types).toEqual(['true', 'false', 'null', 'undefined']);
	});

	it('handles a runaway double-quoted string without crashing', () => {
		// no closing quote — must still terminate, not loop forever
		const tokens = tokenize('"unterminated', 'js');
		expect(tokens.length).toBeGreaterThan(0);
		expect(tokens[0].kind).toBe('string');
	});
});

// ============================================================
// tokenize — TypeScript
// ============================================================

describe('tokenize TypeScript', () => {
	it('marks built-in types as type tokens', () => {
		const tokens = tokenize('let x: number = 1; let y: string = "a";', 'ts');
		const types = tokens.filter((t) => t.kind === 'type').map((t) => t.value);
		expect(types).toContain('number');
		expect(types).toContain('string');
	});

	it('marks interface as keyword and Type names as type', () => {
		const tokens = tokenize('interface Foo { bar: Promise<string> }', 'ts');
		const keywords = tokens.filter((t) => t.kind === 'keyword').map((t) => t.value);
		const types = tokens.filter((t) => t.kind === 'type').map((t) => t.value);
		expect(keywords).toContain('interface');
		expect(types).toContain('Promise');
		expect(types).toContain('string');
	});

	it('handles generic angle brackets as punct', () => {
		const tokens = tokenize('Array<number>', 'ts');
		const punct = tokens.filter((t) => t.kind === 'punct').map((t) => t.value);
		expect(punct).toContain('<');
		expect(punct).toContain('>');
	});

	it('classifies satisfies / keyof / infer as keywords', () => {
		const tokens = tokenize('type X = keyof Y; const z = a satisfies B;', 'ts');
		const keywords = tokens.filter((t) => t.kind === 'keyword').map((t) => t.value);
		expect(keywords).toContain('keyof');
		expect(keywords).toContain('satisfies');
	});
});

// ============================================================
// tokenize — Svelte
// ============================================================

describe('tokenize Svelte', () => {
	it('emits a tag token for the element name', () => {
		const tokens = tokenize('<div>hi</div>', 'svelte');
		const tags = tokens.filter((t) => t.kind === 'tag').map((t) => t.value);
		expect(tags).toEqual(['div', 'div']);
	});

	it('emits attr tokens for attribute names', () => {
		const tokens = tokenize('<button class="x" disabled>Go</button>', 'svelte');
		const attrs = tokens.filter((t) => t.kind === 'attr').map((t) => t.value);
		expect(attrs).toContain('class');
		expect(attrs).toContain('disabled');
	});

	it('treats {#each} block markers as keywords', () => {
		const tokens = tokenize('{#each items as item}{item}{/each}', 'svelte');
		const keywords = tokens.filter((t) => t.kind === 'keyword').map((t) => t.value);
		expect(keywords).toContain('#each');
		expect(keywords).toContain('/each');
	});

	it('recognises HTML comments', () => {
		const tokens = tokenize('<!-- hello world -->', 'svelte');
		const comment = tokens.find((t) => t.kind === 'comment');
		expect(comment?.value).toBe('<!-- hello world -->');
	});

	it('recurses into mustache expressions', () => {
		const tokens = tokenize('<p>{count + 1}</p>', 'svelte');
		const numbers = tokens.filter((t) => t.kind === 'number').map((t) => t.value);
		expect(numbers).toEqual(['1']);
	});

	it('handles self-closing tags', () => {
		const tokens = tokenize('<img src="a.png" />', 'svelte');
		const punct = tokens.filter((t) => t.kind === 'punct').map((t) => t.value);
		expect(punct).toContain('/>');
	});
});

// ============================================================
// mergeAdjacentPlain
// ============================================================

describe('mergeAdjacentPlain', () => {
	it('joins consecutive plain tokens into one', () => {
		const input: Token[] = [
			{ kind: 'plain', value: 'a' },
			{ kind: 'plain', value: 'b' },
			{ kind: 'plain', value: 'c' }
		];
		expect(mergeAdjacentPlain(input)).toEqual([{ kind: 'plain', value: 'abc' }]);
	});

	it('does not merge across non-plain kinds', () => {
		const input: Token[] = [
			{ kind: 'plain', value: 'a' },
			{ kind: 'keyword', value: 'b' },
			{ kind: 'plain', value: 'c' }
		];
		expect(mergeAdjacentPlain(input)).toHaveLength(3);
	});

	it('returns a fresh array (does not mutate input)', () => {
		const input: Token[] = [
			{ kind: 'plain', value: 'a' },
			{ kind: 'plain', value: 'b' }
		];
		const before = JSON.stringify(input);
		mergeAdjacentPlain(input);
		expect(JSON.stringify(input)).toBe(before);
	});

	it('handles an empty array', () => {
		expect(mergeAdjacentPlain([])).toEqual([]);
	});

	it('handles a single plain token unchanged', () => {
		expect(mergeAdjacentPlain([{ kind: 'plain', value: 'x' }])).toEqual([
			{ kind: 'plain', value: 'x' }
		]);
	});
});

// ============================================================
// Round-trip — tokens always reassemble to the original source
// ============================================================

describe('round-trip integrity', () => {
	const samples: Array<[string, string]> = [
		['ts', 'const x: number = 1;\nfunction add(a: number, b: number): number { return a + b; }'],
		['js', '// comment\nconst greet = (name) => `hello ${name}!`;'],
		['svelte', '<script lang="ts">let count = 0;</script>\n<button on:click={() => count++}>{count}</button>'],
		['json', '{"name": "Ada", "active": true, "score": 99.5, "tags": ["a", "b"]}'],
		['bash', '#!/bin/bash\nfor f in *.txt; do echo "$f"; done'],
		['plain', 'just some prose with no code markers']
	];

	for (const [lang, code] of samples) {
		it(`reassembles ${lang} input`, () => {
			const tokens = tokenize(code, lang as never);
			expect(tokens.map((t) => t.value).join('')).toBe(code);
		});
	}
});
