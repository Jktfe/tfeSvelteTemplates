/**
 * ============================================================
 * GsapRevealSequence Tests
 * ============================================================
 *
 * Verifies module-level pure helpers (resolveRevealTargets +
 * revealOffset) and the host component renders the wrapper +
 * children with the gsap-reveal-sequence class.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import GsapRevealSequence, {
	resolveRevealTargets,
	revealOffset
} from './GsapRevealSequence.svelte';

function buildRoot(spec: { tag: string; attrs?: Record<string, string>; text?: string }[]): HTMLElement {
	const root = document.createElement('div');
	for (const s of spec) {
		const el = document.createElement(s.tag);
		if (s.attrs) for (const [k, v] of Object.entries(s.attrs)) el.setAttribute(k, v);
		if (s.text) el.textContent = s.text;
		root.appendChild(el);
	}
	return root;
}

describe('GsapRevealSequence module helpers', () => {
	it('resolveRevealTargets returns elements matching the selector first', () => {
		const root = buildRoot([
			{ tag: 'p', text: 'plain' },
			{ tag: 'div', attrs: { 'data-gsap-item': '' }, text: 'a' },
			{ tag: 'div', attrs: { 'data-gsap-item': '' }, text: 'b' }
		]);
		const targets = resolveRevealTargets(root, '[data-gsap-item]');
		expect(targets.length).toBe(2);
		expect(targets.every((t) => t.hasAttribute('data-gsap-item'))).toBe(true);
	});

	it('resolveRevealTargets falls back to direct children when selector matches nothing', () => {
		const root = buildRoot([
			{ tag: 'p', text: 'one' },
			{ tag: 'span', text: 'two' },
			{ tag: 'em', text: 'three' }
		]);
		const targets = resolveRevealTargets(root, '[data-gsap-item]');
		expect(targets.length).toBe(3);
		const tags = targets.map((t) => t.tagName.toLowerCase());
		expect(tags).toEqual(['p', 'span', 'em']);
	});

	it('revealOffset returns x-only translation when axis="x"', () => {
		expect(revealOffset('x', 40)).toEqual({ x: 40, y: 0 });
	});

	it('revealOffset returns y-only translation when axis="y"', () => {
		expect(revealOffset('y', 28)).toEqual({ x: 0, y: 28 });
	});

	it('revealOffset clamps NaN/Infinity distances to 0', () => {
		expect(revealOffset('y', NaN as unknown as number)).toEqual({ x: 0, y: 0 });
		expect(revealOffset('x', Infinity as unknown as number)).toEqual({ x: 0, y: 0 });
	});
});

describe('GsapRevealSequence component', () => {
	it('renders the wrapper with the gsap-reveal-sequence class', () => {
		const { container } = render(GsapRevealSequence, { props: {} });
		expect(container.querySelector('.gsap-reveal-sequence')).toBeTruthy();
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(GsapRevealSequence, {
			props: { class: 'extra-reveal' }
		});
		expect(container.querySelector('.gsap-reveal-sequence.extra-reveal')).toBeTruthy();
	});
});
