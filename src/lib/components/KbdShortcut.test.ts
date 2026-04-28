/**
 * ============================================================
 * KbdShortcut Tests
 * ============================================================
 *
 * Verifies that KbdShortcut renders single keys and combos, swaps
 * Mac/Windows glyphs, applies sizes, honours custom separators,
 * and exposes accessible labels.
 *
 * 💡 TIP: `bun run test:ui` for a visual interface.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import KbdShortcut from './KbdShortcut.svelte';

describe('KbdShortcut', () => {
	it('renders without crashing', () => {
		const { container } = render(KbdShortcut, { props: { keys: 'Esc' } });
		expect(container.querySelector('kbd')).toBeTruthy();
	});

	it('renders single string key inside the kbd', () => {
		const { container } = render(KbdShortcut, { props: { keys: 'Tab', mac: true } });
		const kbd = container.querySelector('kbd');
		// Tab on mac → ⇥
		expect(kbd?.textContent).toContain('⇥');
	});

	it('renders array as combo with default + separator', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'K'], mac: true }
		});
		const kbd = container.querySelector('kbd');
		const text = kbd?.textContent ?? '';
		expect(text).toContain('⌘');
		expect(text).toContain('K');
		expect(text).toContain('+');
	});

	it('substitutes Mac glyphs when mac=true', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'Shift', 'Alt', 'P'], mac: true }
		});
		const text = container.querySelector('kbd')?.textContent ?? '';
		expect(text).toContain('⌘');
		expect(text).toContain('⇧');
		expect(text).toContain('⌥');
		expect(text).toContain('P');
	});

	it('renders Windows-style text when mac=false', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Ctrl', 'Shift', 'P'], mac: false }
		});
		const text = container.querySelector('kbd')?.textContent ?? '';
		expect(text).toContain('Ctrl');
		expect(text).toContain('Shift');
		expect(text).toContain('P');
	});

	it('maps Cmd to "Win" on non-mac', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'L'], mac: false }
		});
		const text = container.querySelector('kbd')?.textContent ?? '';
		expect(text).toContain('Win');
	});

	it('applies the size class', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Esc', size: 'lg' }
		});
		expect(container.querySelector('.kbd-lg')).toBeTruthy();
	});

	it('defaults to md size', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Esc' }
		});
		expect(container.querySelector('.kbd-md')).toBeTruthy();
	});

	it('uses a custom separator', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['G', 'S'], separator: ' → ' }
		});
		const text = container.querySelector('kbd')?.textContent ?? '';
		expect(text).toContain('→');
	});

	it('builds default aria-label by joining keys with " plus "', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'K'] }
		});
		const kbd = container.querySelector('kbd');
		expect(kbd?.getAttribute('aria-label')).toBe('Cmd plus K');
	});

	it('respects a custom ariaLabel override', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'K'], ariaLabel: 'Open command menu' }
		});
		const kbd = container.querySelector('kbd');
		expect(kbd?.getAttribute('aria-label')).toBe('Open command menu');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Esc', class: 'my-extra-class' }
		});
		expect(container.querySelector('.my-extra-class')).toBeTruthy();
	});

	it('uses a native <kbd> element as the wrapper', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Tab' }
		});
		expect(container.querySelector('kbd')?.tagName).toBe('KBD');
	});

	it('marks separator spans as aria-hidden', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: ['Cmd', 'K'] }
		});
		const seps = container.querySelectorAll('.kbd-sep');
		expect(seps.length).toBe(1);
		expect(seps[0].getAttribute('aria-hidden')).toBe('true');
	});

	it('renders no separator span for a single key', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Esc' }
		});
		expect(container.querySelectorAll('.kbd-sep').length).toBe(0);
	});

	it('renders escape as readable "esc" on mac', () => {
		const { container } = render(KbdShortcut, {
			props: { keys: 'Escape', mac: true }
		});
		const text = container.querySelector('kbd')?.textContent ?? '';
		expect(text.toLowerCase()).toContain('esc');
	});
});
