/**
 * ============================================================
 * AvatarStack Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders nothing visible for an empty list
 *   ✓ Renders up to `max` avatars
 *   ✓ Shows the "+N" overflow tile when people.length > max
 *   ✓ Hides the overflow tile when showOverflow=false
 *   ✓ Falls back to initials when no src is provided
 *   ✓ Renders an <img> when src is provided
 *   ✓ Derives initials from multi-word names
 *   ✓ Respects an explicit initials override
 *   ✓ Tooltip / aria-label fall back to name when no alt is given
 *
 * Run:
 *   bun run test -- AvatarStack
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AvatarStack from './AvatarStack.svelte';

const team = [
	{ name: 'Ada Lovelace' },
	{ name: 'Grace Hopper' },
	{ name: 'Margaret Hamilton' },
	{ name: 'Katherine Johnson' },
	{ name: 'Hedy Lamarr' }
];

describe('AvatarStack', () => {
	it('renders the container even with no people', () => {
		const { container } = render(AvatarStack, { people: [] });
		const stack = container.querySelector('.avatar-stack') as HTMLElement;
		expect(stack).toBeTruthy();
		expect(stack.querySelectorAll('.avatar-item').length).toBe(0);
	});

	it('renders at most `max` avatars from the list', () => {
		const { container } = render(AvatarStack, { people: team, max: 3 });
		// 3 visible + 1 overflow tile = 4
		const items = container.querySelectorAll('.avatar-item');
		expect(items.length).toBe(4);
		const visible = container.querySelectorAll('.avatar-item:not(.avatar-overflow)');
		expect(visible.length).toBe(3);
	});

	it('renders the "+N" overflow tile with the correct count', () => {
		const { container } = render(AvatarStack, { people: team, max: 3 });
		const overflow = container.querySelector('.avatar-overflow') as HTMLElement;
		expect(overflow).toBeTruthy();
		expect(overflow.textContent?.trim()).toBe('+2');
	});

	it('hides the overflow tile when showOverflow=false', () => {
		const { container } = render(AvatarStack, { people: team, max: 3, showOverflow: false });
		expect(container.querySelector('.avatar-overflow')).toBeNull();
	});

	it('renders initials when no src is provided', () => {
		const { container } = render(AvatarStack, { people: [{ name: 'Ada Lovelace' }] });
		const initials = container.querySelector('.avatar-initials') as HTMLElement;
		expect(initials).toBeTruthy();
		expect(initials.textContent).toBe('AL');
	});

	it('renders an <img> when a src is provided', () => {
		const { container } = render(AvatarStack, {
			people: [{ name: 'Ada Lovelace', src: '/img/ada.jpg' }]
		});
		const img = container.querySelector('img') as HTMLImageElement;
		expect(img).toBeTruthy();
		expect(img.getAttribute('src')).toBe('/img/ada.jpg');
		expect(img.getAttribute('alt')).toBe('Ada Lovelace');
	});

	it('derives single-word initials by taking the first two letters', () => {
		const { container } = render(AvatarStack, { people: [{ name: 'Madonna' }] });
		expect(container.querySelector('.avatar-initials')?.textContent).toBe('MA');
	});

	it('respects an explicit initials override', () => {
		const { container } = render(AvatarStack, {
			people: [{ name: 'Margaret Hamilton', initials: 'MH' }]
		});
		expect(container.querySelector('.avatar-initials')?.textContent).toBe('MH');
	});

	it('uses name as the aria-label when no alt is given', () => {
		const { getByLabelText } = render(AvatarStack, { people: [{ name: 'Ada Lovelace' }] });
		expect(getByLabelText('Ada Lovelace')).toBeTruthy();
	});

	it('writes size + overlap into CSS custom properties', () => {
		const { container } = render(AvatarStack, {
			people: [{ name: 'Ada Lovelace' }],
			size: 48,
			overlap: 16
		});
		const stack = container.querySelector('.avatar-stack') as HTMLElement;
		expect(stack.style.getPropertyValue('--avatar-size')).toBe('48px');
		expect(stack.style.getPropertyValue('--avatar-overlap')).toBe('16px');
	});
});
