/*
 * Divider Tests
 *
 * Covers:
 *   ✓ Plain horizontal renders as native <hr>
 *   ✓ With label renders as div role="separator"
 *   ✓ Label text appears in DOM
 *   ✓ Vertical orientation sets aria-orientation
 *   ✓ Applies thickness class (thin/medium/thick)
 *   ✓ Applies line-style class (solid/dashed/dotted)
 *   ✓ Custom colour via inline CSS variable
 *   ✓ Label position class applied
 *   ✓ Wrapper class prop forwarded
 *   ✓ Decorative variant gets aria-hidden
 *
 * Run:
 *   bun run test -- Divider
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Divider from './Divider.svelte';

describe('Divider', () => {
	it('plain horizontal renders as native <hr>', () => {
		const { container } = render(Divider);
		expect(container.querySelector('hr')).toBeTruthy();
	});

	it('with label renders as div role="separator"', () => {
		const { container } = render(Divider, { props: { label: 'OR' } });
		expect(container.querySelector('hr')).toBeFalsy();
		const sep = container.querySelector('[role="separator"]');
		expect(sep).toBeTruthy();
		expect(sep?.tagName).toBe('DIV');
	});

	it('label text appears in DOM', () => {
		const { getByText } = render(Divider, { props: { label: 'Recently active' } });
		expect(getByText('Recently active')).toBeTruthy();
	});

	it('vertical orientation sets aria-orientation="vertical"', () => {
		const { container } = render(Divider, { props: { orientation: 'vertical' } });
		const sep = container.querySelector('[role="separator"]');
		expect(sep?.getAttribute('aria-orientation')).toBe('vertical');
	});

	it('applies thickness class (thick)', () => {
		const { container } = render(Divider, { props: { thickness: 'thick' } });
		expect(container.querySelector('.divider-thick')).toBeTruthy();
	});

	it('applies line-style class (dashed)', () => {
		const { container } = render(Divider, { props: { lineStyle: 'dashed' } });
		expect(container.querySelector('.divider-dashed')).toBeTruthy();
	});

	it('custom colour set via inline CSS variable', () => {
		const { container } = render(Divider, { props: { colour: '#ff0000' } });
		const el = container.querySelector('.divider') as HTMLElement;
		expect(el.style.cssText).toContain('--divider-colour: #ff0000');
	});

	it('label position class applied', () => {
		const { container } = render(Divider, {
			props: { label: 'Sign in with', labelPosition: 'left' }
		});
		expect(container.querySelector('.divider-label-left')).toBeTruthy();
	});

	it('forwards wrapper class prop', () => {
		const { container } = render(Divider, { props: { class: 'my-extra' } });
		expect(container.querySelector('.my-extra')).toBeTruthy();
	});

	it('decorative variant gets aria-hidden=true', () => {
		const { container } = render(Divider, { props: { decorative: true } });
		const el = container.querySelector('.divider') as HTMLElement;
		expect(el.getAttribute('aria-hidden')).toBe('true');
	});

	it('vertical defaults to no role when decorative', () => {
		const { container } = render(Divider, {
			props: { orientation: 'vertical', decorative: true }
		});
		const el = container.querySelector('.divider-v') as HTMLElement;
		expect(el.getAttribute('aria-hidden')).toBe('true');
		expect(el.getAttribute('role')).toBeNull();
	});
});
