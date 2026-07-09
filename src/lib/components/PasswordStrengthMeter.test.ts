/**
 * ============================================================
 * PasswordStrengthMeter Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Empty value → Weak, zero filled segments
 *   ✓ A strong password satisfying all rules → Strong, all segments filled
 *   ✓ The checklist reflects exactly which rules pass
 *   ✓ showChecklist=false hides the checklist
 *   ✓ showLabel=false hides the live status line
 *   ✓ The strength label lives in an aria-live region
 *   ✓ Forwards extra classes via the class prop
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PasswordStrengthMeter from './PasswordStrengthMeter.svelte';

describe('PasswordStrengthMeter', () => {
	it('shows Weak with no filled segments for an empty value', () => {
		const { container } = render(PasswordStrengthMeter, { value: '' });

		const label = container.querySelector('.psm-label-value');
		expect(label?.textContent).toBe('Weak');

		const filled = container.querySelectorAll('.psm-seg.is-filled');
		expect(filled.length).toBe(0);
	});

	it('shows Strong with all segments filled for a password meeting every rule', () => {
		const { container } = render(PasswordStrengthMeter, { value: 'Abcdef1!' });

		const label = container.querySelector('.psm-label-value');
		expect(label?.textContent).toBe('Strong');

		const segs = container.querySelectorAll('.psm-seg');
		const filled = container.querySelectorAll('.psm-seg.is-filled');
		expect(segs.length).toBe(4);
		expect(filled.length).toBe(4);
	});

	it('reflects exactly which rules pass in the checklist', () => {
		// "abcdefgh": length ✓, lowercase ✓, but no uppercase / digit / symbol.
		const { container } = render(PasswordStrengthMeter, { value: 'abcdefgh' });

		const items = container.querySelectorAll('.psm-rule');
		expect(items.length).toBe(5);

		const passed = container.querySelectorAll('.psm-rule.is-pass');
		const failed = container.querySelectorAll('.psm-rule.is-fail');
		expect(passed.length).toBe(2);
		expect(failed.length).toBe(3);
	});

	it('honours a custom rule set', () => {
		const rules = [
			{ id: 'has-a', label: 'Contains the letter a', test: (v: string) => v.includes('a') },
			{ id: 'long', label: 'At least 4 characters', test: (v: string) => v.length >= 4 }
		];
		const { container } = render(PasswordStrengthMeter, { value: 'aaaa', rules });

		const items = container.querySelectorAll('.psm-rule');
		expect(items.length).toBe(2);
		expect(container.querySelectorAll('.psm-rule.is-pass').length).toBe(2);
		expect(container.querySelector('.psm-label-value')?.textContent).toBe('Strong');
	});

	it('hides the checklist when showChecklist is false', () => {
		const { container } = render(PasswordStrengthMeter, {
			value: 'Abcdef1!',
			showChecklist: false
		});
		expect(container.querySelector('.psm-checklist')).toBeNull();
	});

	it('hides the label when showLabel is false', () => {
		const { container } = render(PasswordStrengthMeter, {
			value: 'Abcdef1!',
			showLabel: false
		});
		expect(container.querySelector('.psm-label')).toBeNull();
	});

	it('puts the strength label in an aria-live region', () => {
		const { container } = render(PasswordStrengthMeter, { value: 'abc' });
		const live = container.querySelector('[aria-live="polite"]');
		expect(live).toBeTruthy();
		expect(live?.classList.contains('psm-label')).toBe(true);
	});

	it('does not announce the password itself', () => {
		const { container } = render(PasswordStrengthMeter, { value: 'SuperSecret1!' });
		const live = container.querySelector('[aria-live="polite"]');
		expect(live?.textContent).not.toContain('SuperSecret1!');
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(PasswordStrengthMeter, { value: '', class: 'custom-psm' });
		const root = container.querySelector('.psm') as HTMLElement;
		expect(root.classList.contains('custom-psm')).toBe(true);
	});
});
