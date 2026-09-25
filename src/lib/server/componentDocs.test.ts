/**
 * Server-side docs rendering + the slim highlight.js build.
 *
 * The structural "gold standard" checks live in `src/lib/componentDocs.test.ts`;
 * this file pins the behaviour that moved server-side: rendering, H1
 * stripping, caching, and the route → doc lookup used by the root layout.
 */

import { describe, it, expect } from 'vitest';
import { getComponentDocsForRoute, getDocsHtmlForPath, getDocsRawForPath } from './componentDocs';
import { renderMarkdown } from '$lib/utils/markdown';

const SPEED_DIAL_DOC = 'src/lib/components/SpeedDial.md';

describe('getDocsHtmlForPath', () => {
	it('renders a known doc to HTML with the leading H1 stripped', () => {
		const html = getDocsHtmlForPath(SPEED_DIAL_DOC);
		expect(html).toBeDefined();
		expect(html).not.toMatch(/^<h1/);
		expect(html).toContain('<h2');
	});

	it('accepts a leading slash on the path', () => {
		expect(getDocsHtmlForPath(`/${SPEED_DIAL_DOC}`)).toBe(getDocsHtmlForPath(SPEED_DIAL_DOC));
	});

	it('returns the same cached string on repeat lookups', () => {
		const first = getDocsHtmlForPath(SPEED_DIAL_DOC);
		const second = getDocsHtmlForPath(SPEED_DIAL_DOC);
		expect(second).toBe(first);
	});

	it('returns undefined for unknown or empty paths', () => {
		expect(getDocsHtmlForPath('src/lib/components/__nope__.md')).toBeUndefined();
		expect(getDocsHtmlForPath('')).toBeUndefined();
		expect(getDocsRawForPath('')).toBeUndefined();
	});
});

describe('renderMarkdown code fences (highlight.js core subset)', () => {
	it.each([
		['svelte', '<script lang="ts">\n\tlet count = $state(0);\n</script>\n<button>{count}</button>'],
		['typescript', 'const x: number = 1;'],
		['ts', 'export type A = string;'],
		['javascript', 'function f() { return 1; }'],
		['css', '.a { color: red; }'],
		['bash', 'export NAME="demo" # set it\necho $NAME'],
		['json', '{ "a": 1 }'],
		['html', '<div class="a"></div>'],
		['sql', 'SELECT * FROM cards;']
	])('highlights ```%s fences', (lang, code) => {
		const html = renderMarkdown('```' + lang + '\n' + code + '\n```');
		expect(html).toContain(`class="language-${lang}"`);
		expect(html).toContain('hljs-');
	});

	it('leaves ```text fences unhighlighted but escaped', () => {
		const html = renderMarkdown('```text\n<b>not bold</b>\n```');
		expect(html).toContain('&lt;b&gt;');
		expect(html).not.toContain('hljs-');
	});
});

describe('getComponentDocsForRoute', () => {
	it('returns the rendered doc for a catalog route', () => {
		const docs = getComponentDocsForRoute('/speeddial');
		expect(docs?.path).toBe(SPEED_DIAL_DOC);
		expect(docs?.html).toBe(getDocsHtmlForPath(SPEED_DIAL_DOC));
	});

	it('returns null for non-component routes', () => {
		expect(getComponentDocsForRoute('/')).toBeNull();
		expect(getComponentDocsForRoute('/auth/sign-in')).toBeNull();
		expect(getComponentDocsForRoute('/navbar/sandbox')).toBeNull();
		expect(getComponentDocsForRoute(null)).toBeNull();
	});
});
