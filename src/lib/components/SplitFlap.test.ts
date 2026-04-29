/**
 * ============================================================
 * SplitFlap Tests
 * ============================================================
 *
 * Two layers:
 *  1. Pure helpers (pickCharset, nextCharIndex, frameDelay,
 *     buildTickSequence, isReducedMotion) — exported from the
 *     module-script. Pure I/O, deterministic.
 *  2. Component render — confirms one cell per character, the
 *     wrapper has an aria-live region announcing the value, and
 *     the resolved charset is published as a data attribute.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import SplitFlap, {
	buildTickSequence,
	frameDelay,
	isReducedMotion,
	nextCharIndex,
	pickCharset
} from './SplitFlap.svelte';

afterEach(() => {
	cleanup();
});

describe('SplitFlap helpers — pickCharset', () => {
	it('returns the digits charset for "digits"', () => {
		const c = pickCharset('digits');
		expect(c.name).toBe('digits');
		expect(c.chars).toBe('0123456789');
	});

	it('returns the alpha charset including a leading space (the "blank" flap)', () => {
		const c = pickCharset('alpha');
		expect(c.name).toBe('alpha');
		expect(c.chars.startsWith(' ')).toBe(true);
		expect(c.chars).toContain('Z');
		expect(c.chars).not.toMatch(/[0-9]/);
	});

	it('returns the solari charset with punctuation extras', () => {
		const c = pickCharset('solari');
		expect(c.name).toBe('solari');
		expect(c.chars).toContain('.');
		expect(c.chars).toContain(':');
		expect(c.chars).toContain('-');
	});

	it('falls back to alnum for unknown names (never throws)', () => {
		const c = pickCharset('hieroglyph');
		expect(c.name).toBe('alnum');
		expect(c.chars).toContain('A');
		expect(c.chars).toContain('9');
	});

	it('falls back to alnum for an empty string', () => {
		expect(pickCharset('').name).toBe('alnum');
	});
});

describe('SplitFlap helpers — nextCharIndex', () => {
	it('returns the same index when current already equals target', () => {
		expect(nextCharIndex(3, 3, 10)).toBe(3);
	});

	it('forward direction always steps +1 (mod length)', () => {
		expect(nextCharIndex(0, 5, 10, 'forward')).toBe(1);
		expect(nextCharIndex(9, 0, 10, 'forward')).toBe(0);
	});

	it('shortest direction picks +1 when forward distance is smaller', () => {
		// 0 → 2: forward = 2 ticks, backward = 8 ticks → step forward
		expect(nextCharIndex(0, 2, 10, 'shortest')).toBe(1);
	});

	it('shortest direction picks -1 when backward distance is smaller', () => {
		// 0 → 8: forward = 8 ticks, backward = 2 ticks → step backward (wraps to 9)
		expect(nextCharIndex(0, 8, 10, 'shortest')).toBe(9);
	});

	it('normalises out-of-range or negative indices', () => {
		expect(nextCharIndex(-1, 0, 10, 'forward')).toBe(0); // -1 → 9 → +1 → 0
		expect(nextCharIndex(11, 5, 10, 'forward')).toBe(2); // 11 → 1 → +1 → 2
	});

	it('returns 0 when length is non-positive (never crashes)', () => {
		expect(nextCharIndex(0, 0, 0)).toBe(0);
		expect(nextCharIndex(0, 0, -3)).toBe(0);
	});
});

describe('SplitFlap helpers — frameDelay', () => {
	it('scales linearly with index × stagger', () => {
		expect(frameDelay(0, 60)).toBe(0);
		expect(frameDelay(1, 60)).toBe(60);
		expect(frameDelay(4, 60)).toBe(240);
	});

	it('multiplies by intensity to slow or speed the cascade', () => {
		expect(frameDelay(2, 60, 2)).toBe(240);
		expect(frameDelay(2, 60, 0.5)).toBe(60);
	});

	it('clamps negative intensity to 0 so the cascade never runs in reverse', () => {
		expect(frameDelay(3, 60, -1)).toBe(0);
	});

	it('clamps negative stagger to 0', () => {
		expect(frameDelay(3, -10)).toBe(0);
	});
});

describe('SplitFlap helpers — buildTickSequence', () => {
	it('returns an empty sequence when from already equals to', () => {
		expect(buildTickSequence('A', 'A', ' ABC')).toEqual([]);
	});

	it('returns [to] when either glyph is outside the charset', () => {
		// '?' is not in the digits charset
		expect(buildTickSequence('1', '?', '0123456789')).toEqual(['?']);
		expect(buildTickSequence('?', '5', '0123456789')).toEqual(['5']);
	});

	it('lists every glyph stepped through, ending on the target', () => {
		// charset 0123456789, from 1 to 4, forward → ['2','3','4']
		const seq = buildTickSequence('1', '4', '0123456789', 'forward');
		expect(seq).toEqual(['2', '3', '4']);
	});

	it('wraps around the charset when forward direction crosses the end', () => {
		// from 8 to 1, forward → ['9','0','1']
		const seq = buildTickSequence('8', '1', '0123456789', 'forward');
		expect(seq).toEqual(['9', '0', '1']);
	});

	it('honours the shortest-direction preference when set', () => {
		// 0 → 8: shortest is backward (2 steps) → ['9','8']
		const seq = buildTickSequence('0', '8', '0123456789', 'shortest');
		expect(seq).toEqual(['9', '8']);
	});

	it('hard-caps the sequence at one full charset traversal', () => {
		const seq = buildTickSequence('A', 'Z', ' ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'forward');
		expect(seq.length).toBeLessThanOrEqual(' ABCDEFGHIJKLMNOPQRSTUVWXYZ'.length);
		expect(seq[seq.length - 1]).toBe('Z');
	});
});

describe('SplitFlap helpers — isReducedMotion', () => {
	it('returns a boolean in any environment (jsdom or non-DOM)', () => {
		expect(typeof isReducedMotion()).toBe('boolean');
	});
});

describe('SplitFlap component', () => {
	it('renders one .sf-cell per character of the value', () => {
		const { container } = render(SplitFlap, { props: { value: 'HELLO' } });
		expect(container.querySelectorAll('.sf-cell')).toHaveLength(5);
	});

	it('uppercases the value (the charset contract is upper-only)', () => {
		const { container } = render(SplitFlap, { props: { value: 'abc' } });
		const cells = container.querySelectorAll('.sf-cell');
		const chars = Array.from(cells).map((c) => c.getAttribute('data-char'));
		expect(chars).toEqual(['A', 'B', 'C']);
	});

	it('publishes the resolved charset name as a data attribute', () => {
		const { container } = render(SplitFlap, {
			props: { value: '12:34', charset: 'solari' }
		});
		const root = container.querySelector('.sf-root');
		expect(root?.getAttribute('data-charset')).toBe('solari');
	});

	it('falls back to alnum when an unknown charset is requested', () => {
		// @ts-expect-error — deliberately passing an unknown name to assert fallback
		const { container } = render(SplitFlap, { props: { value: 'OK', charset: 'mystery' } });
		expect(container.querySelector('.sf-root')?.getAttribute('data-charset')).toBe('alnum');
	});

	it('marks the wrapper as an aria-live polite region with the full value as label', () => {
		const { container } = render(SplitFlap, { props: { value: 'DEPART' } });
		const root = container.querySelector('.sf-root');
		expect(root?.getAttribute('aria-live')).toBe('polite');
		expect(root?.getAttribute('aria-label')).toBe('DEPART');
	});

	it('appends user-supplied class names to the wrapper', () => {
		const { container } = render(SplitFlap, {
			props: { value: 'A', class: 'hero accent' }
		});
		const root = container.querySelector('.sf-root');
		expect(root?.classList.contains('hero')).toBe(true);
		expect(root?.classList.contains('accent')).toBe(true);
	});

	it('exposes the flip duration as a CSS custom property on each cell', () => {
		const { container } = render(SplitFlap, {
			props: { value: 'AB', flipDuration: 500 }
		});
		const cells = container.querySelectorAll('.sf-cell');
		for (const cell of cells) {
			const style = cell.getAttribute('style') ?? '';
			expect(style).toContain('--sf-duration');
			expect(style).toContain('500ms');
		}
	});

	it('applies the size class so the surrounding type scale can drive layout', () => {
		const { container } = render(SplitFlap, { props: { value: 'A', size: 'lg' } });
		expect(container.querySelector('.sf-root')?.classList.contains('sf-size-lg')).toBe(true);
	});
});
