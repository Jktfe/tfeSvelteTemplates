/**
 * ============================================================
 * ReadingTOC Tests
 * ============================================================
 *
 * Pure-helper unit tests — no IntersectionObserver, no render.
 * Every helper exported from the module-script is verified
 * against:
 *   ✓ Happy path
 *   ✓ Edge cases (empty, invalid, nested, non-monotonic levels)
 *   ✓ Tree round-trip (build → flatten → equal)
 *
 * The component-render contract is covered by the test harness
 * file (compile-only confirmation of all three variants).
 * ============================================================
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
	VALID_VARIANTS,
	VALID_SIZES,
	isValidVariant,
	pickVariant,
	isValidSize,
	pickSize,
	slugify,
	buildHeadingTree,
	flattenTree,
	resolveActiveHeading,
	extractHeadings,
	isReducedMotion,
	type Heading,
	type ResolverEntry
} from './ReadingTOC.svelte';

describe('ReadingTOC — VALID_VARIANTS', () => {
	it('contains the three documented variants in the documented order', () => {
		expect(VALID_VARIANTS).toEqual(['rail', 'top', 'drawer']);
	});

	it('has length 3', () => {
		expect(VALID_VARIANTS.length).toBe(3);
	});
});

describe('ReadingTOC — VALID_SIZES', () => {
	it('contains the three documented sizes', () => {
		expect(VALID_SIZES).toEqual(['sm', 'md', 'lg']);
	});

	it('has length 3', () => {
		expect(VALID_SIZES.length).toBe(3);
	});
});

describe('ReadingTOC — isValidVariant', () => {
	it('accepts each declared variant', () => {
		for (const v of VALID_VARIANTS) {
			expect(isValidVariant(v)).toBe(true);
		}
	});

	it('rejects unknown strings', () => {
		expect(isValidVariant('sidebar')).toBe(false);
		expect(isValidVariant('')).toBe(false);
		expect(isValidVariant('RAIL')).toBe(false); // case-sensitive
	});

	it('rejects non-string inputs', () => {
		expect(isValidVariant(undefined)).toBe(false);
		expect(isValidVariant(null)).toBe(false);
		expect(isValidVariant(0)).toBe(false);
		expect(isValidVariant({})).toBe(false);
		expect(isValidVariant([])).toBe(false);
	});
});

describe('ReadingTOC — pickVariant', () => {
	it('returns the input when valid', () => {
		expect(pickVariant('rail')).toBe('rail');
		expect(pickVariant('top')).toBe('top');
		expect(pickVariant('drawer')).toBe('drawer');
	});

	it("falls back to 'rail' for unknown values", () => {
		expect(pickVariant('pinned')).toBe('rail');
		expect(pickVariant('')).toBe('rail');
		expect(pickVariant(undefined)).toBe('rail');
		expect(pickVariant(null)).toBe('rail');
		expect(pickVariant(123)).toBe('rail');
	});
});

describe('ReadingTOC — isValidSize', () => {
	it('accepts each declared size', () => {
		for (const s of VALID_SIZES) {
			expect(isValidSize(s)).toBe(true);
		}
	});

	it('rejects unknown sizes', () => {
		expect(isValidSize('xl')).toBe(false);
		expect(isValidSize('SM')).toBe(false);
		expect(isValidSize('xs')).toBe(false);
	});

	it('rejects non-string inputs', () => {
		expect(isValidSize(undefined)).toBe(false);
		expect(isValidSize(null)).toBe(false);
		expect(isValidSize(0)).toBe(false);
	});
});

describe('ReadingTOC — pickSize', () => {
	it('returns the input when valid', () => {
		expect(pickSize('sm')).toBe('sm');
		expect(pickSize('md')).toBe('md');
		expect(pickSize('lg')).toBe('lg');
	});

	it("falls back to 'md' for unknown values", () => {
		expect(pickSize('xl')).toBe('md');
		expect(pickSize('')).toBe('md');
		expect(pickSize(undefined)).toBe('md');
		expect(pickSize(42)).toBe('md');
	});
});

describe('ReadingTOC — slugify', () => {
	it('converts simple ASCII text to a hyphenated slug', () => {
		expect(slugify('Hello World')).toBe('hello-world');
		expect(slugify('Introduction')).toBe('introduction');
	});

	it('lowercases all characters', () => {
		expect(slugify('CamelCaseHeading')).toBe('camelcaseheading');
		expect(slugify('UPPER CASE')).toBe('upper-case');
	});

	it('strips diacritics via NFKD normalisation', () => {
		expect(slugify('Café')).toBe('cafe');
		expect(slugify('Über')).toBe('uber');
		expect(slugify('Naïve résumé')).toBe('naive-resume');
	});

	it('removes punctuation', () => {
		expect(slugify("What's Up?")).toBe('whats-up');
		expect(slugify('Hello, World!')).toBe('hello-world');
		expect(slugify('A.B.C')).toBe('abc');
	});

	it('collapses runs of whitespace into a single hyphen', () => {
		expect(slugify('multiple   spaces')).toBe('multiple-spaces');
		expect(slugify('tab\tseparated')).toBe('tab-separated');
	});

	it('trims leading and trailing whitespace', () => {
		expect(slugify('  padded  ')).toBe('padded');
	});

	it('collapses repeated hyphens', () => {
		expect(slugify('a---b')).toBe('a-b');
	});

	it('strips em-dashes (treated as non-alphanumeric)', () => {
		expect(slugify('hello — world')).toBe('hello-world');
	});

	it('returns empty string for empty input', () => {
		expect(slugify('')).toBe('');
	});

	it('returns empty string for non-string input', () => {
		// @ts-expect-error — testing runtime guard
		expect(slugify(undefined)).toBe('');
		// @ts-expect-error — testing runtime guard
		expect(slugify(null)).toBe('');
		// @ts-expect-error — testing runtime guard
		expect(slugify(42)).toBe('');
	});

	it('preserves digits', () => {
		expect(slugify('Step 1')).toBe('step-1');
		expect(slugify('Section 2.5')).toBe('section-25');
	});
});

describe('ReadingTOC — buildHeadingTree', () => {
	const h = (id: string, level: number, text = id): Heading => ({ id, text, level });

	it('returns empty array for empty input', () => {
		expect(buildHeadingTree([])).toEqual([]);
	});

	it('handles a single heading', () => {
		const tree = buildHeadingTree([h('a', 2)]);
		expect(tree.length).toBe(1);
		expect(tree[0].id).toBe('a');
		expect(tree[0].children).toEqual([]);
	});

	it('keeps siblings at the root', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 2)]);
		expect(tree.length).toBe(2);
		expect(tree.map((n) => n.id)).toEqual(['a', 'b']);
		expect(tree[0].children).toEqual([]);
		expect(tree[1].children).toEqual([]);
	});

	it('nests an h3 under the preceding h2', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 3)]);
		expect(tree.length).toBe(1);
		expect(tree[0].children.length).toBe(1);
		expect(tree[0].children[0].id).toBe('b');
	});

	it('handles three-deep nesting (h2 → h3 → h4)', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 3), h('c', 4)]);
		expect(tree.length).toBe(1);
		expect(tree[0].children[0].children[0].id).toBe('c');
	});

	it('returns to higher level on h2 after h3', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 3), h('c', 2)]);
		expect(tree.map((n) => n.id)).toEqual(['a', 'c']);
		expect(tree[0].children.map((n) => n.id)).toEqual(['b']);
		expect(tree[1].children).toEqual([]);
	});

	it('handles non-monotonic skip (h2 → h4 with no h3)', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 4)]);
		expect(tree.length).toBe(1);
		expect(tree[0].children.map((n) => n.id)).toEqual(['b']);
	});

	it('places a lone h3 at the root if no preceding h2', () => {
		const tree = buildHeadingTree([h('a', 3)]);
		expect(tree.length).toBe(1);
		expect(tree[0].id).toBe('a');
	});

	it('treats h3 → h2 as siblings (h2 is at root, h3 stays at root)', () => {
		const tree = buildHeadingTree([h('a', 3), h('b', 2)]);
		expect(tree.map((n) => n.id)).toEqual(['a', 'b']);
	});

	it('preserves text fields', () => {
		const tree = buildHeadingTree([h('a', 2, 'Alpha'), h('b', 3, 'Beta')]);
		expect(tree[0].text).toBe('Alpha');
		expect(tree[0].children[0].text).toBe('Beta');
	});
});

describe('ReadingTOC — flattenTree', () => {
	const h = (id: string, level: number): Heading => ({ id, text: id, level });

	it('flattens an empty tree to []', () => {
		expect(flattenTree([])).toEqual([]);
	});

	it('round-trips a flat list', () => {
		const flat = [h('a', 2), h('b', 2), h('c', 2)];
		expect(flattenTree(buildHeadingTree(flat))).toEqual(flat);
	});

	it('round-trips a nested list (h2 → h3 → h4 → h2)', () => {
		const flat = [h('a', 2), h('b', 3), h('c', 4), h('d', 2)];
		expect(flattenTree(buildHeadingTree(flat))).toEqual(flat);
	});

	it('walks depth-first, preserving document order', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 3), h('c', 3), h('d', 2)]);
		expect(flattenTree(tree).map((n) => n.id)).toEqual(['a', 'b', 'c', 'd']);
	});

	it('strips children from output (returns Heading not HeadingNode)', () => {
		const tree = buildHeadingTree([h('a', 2), h('b', 3)]);
		const flat = flattenTree(tree);
		expect(flat[0]).not.toHaveProperty('children');
		expect(flat[0]).toEqual({ id: 'a', text: 'a', level: 2 });
	});
});

describe('ReadingTOC — resolveActiveHeading', () => {
	const entry = (
		id: string,
		ratio: number,
		intersecting: boolean,
		top: number
	): ResolverEntry => ({
		id,
		intersectionRatio: ratio,
		isIntersecting: intersecting,
		top
	});

	it('returns null for empty list with no fallback', () => {
		expect(resolveActiveHeading([])).toBe(null);
	});

	it('returns the fallback when entries is empty', () => {
		expect(resolveActiveHeading([], 'fallback-id')).toBe('fallback-id');
	});

	it('returns fallback for non-array input', () => {
		// @ts-expect-error — testing runtime guard
		expect(resolveActiveHeading(null, 'fb')).toBe('fb');
		// @ts-expect-error — testing runtime guard
		expect(resolveActiveHeading(undefined, 'fb')).toBe('fb');
	});

	it('picks the only intersecting entry', () => {
		expect(resolveActiveHeading([entry('a', 0.5, true, 100)])).toBe('a');
	});

	it('picks the highest-ratio entry when several intersect', () => {
		const result = resolveActiveHeading([
			entry('a', 0.2, true, 50),
			entry('b', 0.8, true, 200),
			entry('c', 0.5, true, 300)
		]);
		expect(result).toBe('b');
	});

	it('tiebreaks equal ratios by document order (smallest top first)', () => {
		const result = resolveActiveHeading([
			entry('later', 0.5, true, 400),
			entry('earlier', 0.5, true, 100)
		]);
		expect(result).toBe('earlier');
	});

	it('picks the most recently passed when nothing intersects', () => {
		// largest (closest to 0) of the negative tops
		const result = resolveActiveHeading([
			entry('a', 0, false, -300),
			entry('b', 0, false, -50),
			entry('c', 0, false, -150)
		]);
		expect(result).toBe('b');
	});

	it('falls back when nothing intersects and nothing has been passed', () => {
		const result = resolveActiveHeading(
			[entry('a', 0, false, 300), entry('b', 0, false, 800)],
			'previous'
		);
		expect(result).toBe('previous');
	});

	it('prefers an intersecting entry over a passed one', () => {
		const result = resolveActiveHeading([
			entry('passed', 0, false, -100),
			entry('current', 0.3, true, 200)
		]);
		expect(result).toBe('current');
	});

	it('skips null entries inside the array gracefully', () => {
		// resolver guards each entry with `e && e.isIntersecting` etc.
		const result = resolveActiveHeading([
			// @ts-expect-error — testing runtime guard
			null,
			entry('a', 0.5, true, 100)
		]);
		expect(result).toBe('a');
	});
});

describe('ReadingTOC — extractHeadings', () => {
	type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
	type Spec = { tag: Tag; id?: string; text: string };

	function makeContainer(specs: Spec[]): HTMLElement {
		const div = document.createElement('div');
		for (const s of specs) {
			const el = document.createElement(s.tag);
			if (s.id !== undefined) el.id = s.id;
			el.textContent = s.text;
			div.appendChild(el);
		}
		return div;
	}

	it('returns [] for null container', () => {
		// @ts-expect-error — testing runtime guard
		expect(extractHeadings(null)).toEqual([]);
	});

	it('returns [] for an empty container', () => {
		expect(extractHeadings(makeContainer([]))).toEqual([]);
	});

	it('returns [] when the container has no headings of the requested levels', () => {
		expect(extractHeadings(makeContainer([{ tag: 'p', text: 'no heading' }]))).toEqual([]);
	});

	it('extracts h2 headings with their existing IDs', () => {
		const c = makeContainer([
			{ tag: 'h2', id: 'a', text: 'Alpha' },
			{ tag: 'h2', id: 'b', text: 'Beta' }
		]);
		expect(extractHeadings(c)).toEqual([
			{ id: 'a', text: 'Alpha', level: 2 },
			{ id: 'b', text: 'Beta', level: 2 }
		]);
	});

	it('auto-assigns slugified IDs to headings without one', () => {
		const c = makeContainer([{ tag: 'h2', text: 'Hello World' }]);
		const result = extractHeadings(c);
		expect(result).toEqual([{ id: 'hello-world', text: 'Hello World', level: 2 }]);
		// confirms the DOM was mutated so anchor links can target it
		expect(c.querySelector('h2')?.id).toBe('hello-world');
	});

	it('deduplicates auto-assigned IDs with a counter', () => {
		const c = makeContainer([
			{ tag: 'h2', text: 'Same' },
			{ tag: 'h2', text: 'Same' },
			{ tag: 'h2', text: 'Same' }
		]);
		const ids = extractHeadings(c).map((row) => row.id);
		expect(ids).toEqual(['same', 'same-1', 'same-2']);
	});

	it('extracts only the requested levels', () => {
		const c = makeContainer([
			{ tag: 'h1', id: 'a', text: 'A' },
			{ tag: 'h2', id: 'b', text: 'B' },
			{ tag: 'h3', id: 'c', text: 'C' }
		]);
		const result = extractHeadings(c, [2, 3]);
		expect(result.map((row) => row.id)).toEqual(['b', 'c']);
	});

	it('skips headings whose text content is whitespace-only', () => {
		const c = makeContainer([
			{ tag: 'h2', id: 'x', text: '   ' },
			{ tag: 'h2', id: 'y', text: 'Real' }
		]);
		const result = extractHeadings(c);
		expect(result.map((row) => row.id)).toEqual(['y']);
	});

	it('returns [] when every requested level is out of range', () => {
		const c = makeContainer([{ tag: 'h2', id: 'a', text: 'A' }]);
		expect(extractHeadings(c, [0, 7, 8])).toEqual([]);
	});

	it('uses default levels [2, 3, 4] when omitted', () => {
		const c = makeContainer([
			{ tag: 'h1', id: 'x', text: 'X' },
			{ tag: 'h2', id: 'a', text: 'A' },
			{ tag: 'h3', id: 'b', text: 'B' },
			{ tag: 'h4', id: 'c', text: 'C' },
			{ tag: 'h5', id: 'y', text: 'Y' }
		]);
		const ids = extractHeadings(c).map((row) => row.id);
		expect(ids).toEqual(['a', 'b', 'c']);
	});

	it('falls back to "heading-{i}" when slugify yields an empty string', () => {
		const c = makeContainer([{ tag: 'h2', text: '!!!' }]);
		// "!!!" → all chars stripped → empty slug → falls back to heading-0
		const result = extractHeadings(c);
		expect(result[0].id).toBe('heading-0');
	});

	it('preserves document order across mixed levels', () => {
		const c = makeContainer([
			{ tag: 'h2', id: 'intro', text: 'Intro' },
			{ tag: 'h3', id: 'setup', text: 'Setup' },
			{ tag: 'h2', id: 'usage', text: 'Usage' }
		]);
		const ids = extractHeadings(c).map((row) => row.id);
		expect(ids).toEqual(['intro', 'setup', 'usage']);
	});
});

describe('ReadingTOC — isReducedMotion', () => {
	const original = window.matchMedia;

	afterEach(() => {
		// restore between every test (some tests overwrite to a mock)
		window.matchMedia = original;
	});

	it('returns a boolean without throwing (jsdom default)', () => {
		// helper must not throw whether or not matchMedia is implemented
		const result = isReducedMotion();
		expect(typeof result).toBe('boolean');
	});

	it('returns true when matchMedia indicates reduced motion', () => {
		window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(true);
	});

	it('returns false when matchMedia indicates no preference', () => {
		window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});

	it('returns false when matchMedia throws', () => {
		window.matchMedia = vi.fn().mockImplementation(() => {
			throw new Error('CSP-blocked');
		}) as typeof window.matchMedia;
		expect(isReducedMotion()).toBe(false);
	});
});
