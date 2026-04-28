/*
 * Switch Tests
 *
 * Covers:
 *   ✓ Renders unchecked by default
 *   ✓ Click toggles checked state
 *   ✓ aria-checked reflects state
 *   ✓ role="switch" set on the button
 *   ✓ Disabled prevents toggle
 *   ✓ Custom label renders
 *   ✓ onChange callback fires with new value
 *   ✓ Applies size class (sm/md/lg)
 *   ✓ Applies variant colour class on
 *   ✓ aria-label fallback when no visible label
 *
 * Run:
 *   bun run test -- Switch
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Switch from './Switch.svelte';

describe('Switch', () => {
	it('renders unchecked by default', () => {
		const { container } = render(Switch);
		const button = container.querySelector('[role="switch"]') as HTMLButtonElement;
		expect(button.getAttribute('aria-checked')).toBe('false');
	});

	it('click toggles checked state', async () => {
		const { container } = render(Switch);
		const button = container.querySelector('[role="switch"]') as HTMLButtonElement;
		await fireEvent.click(button);
		expect(button.getAttribute('aria-checked')).toBe('true');
		await fireEvent.click(button);
		expect(button.getAttribute('aria-checked')).toBe('false');
	});

	it('uses role="switch" on the button', () => {
		const { container } = render(Switch);
		const button = container.querySelector('button');
		expect(button?.getAttribute('role')).toBe('switch');
	});

	it('aria-checked reflects checked prop', () => {
		const { container } = render(Switch, { props: { checked: true } });
		const button = container.querySelector('[role="switch"]');
		expect(button?.getAttribute('aria-checked')).toBe('true');
	});

	it('disabled prevents toggle', async () => {
		const onChange = vi.fn();
		const { container } = render(Switch, { props: { disabled: true, onChange } });
		const button = container.querySelector('[role="switch"]') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
		await fireEvent.click(button);
		expect(button.getAttribute('aria-checked')).toBe('false');
		expect(onChange).not.toHaveBeenCalled();
	});

	it('renders the label when provided', () => {
		const { getByText } = render(Switch, { props: { label: 'Email notifications' } });
		expect(getByText('Email notifications')).toBeTruthy();
	});

	it('label position left renders label before track', () => {
		const { container } = render(Switch, {
			props: { label: 'Lefty', labelPosition: 'left' }
		});
		const wrapper = container.querySelector('.switch-wrapper') as HTMLElement;
		const firstChild = wrapper.firstElementChild;
		expect(firstChild?.classList.contains('switch-label-left')).toBe(true);
	});

	it('onChange callback fires with new value', async () => {
		const onChange = vi.fn();
		const { container } = render(Switch, { props: { onChange } });
		const button = container.querySelector('[role="switch"]') as HTMLButtonElement;
		await fireEvent.click(button);
		expect(onChange).toHaveBeenCalledWith(true);
		await fireEvent.click(button);
		expect(onChange).toHaveBeenLastCalledWith(false);
	});

	it('applies the size class', () => {
		const { container } = render(Switch, { props: { size: 'lg' } });
		expect(container.querySelector('.switch-lg')).toBeTruthy();
	});

	it('applies the variant class on the track', () => {
		const { container } = render(Switch, { props: { variant: 'success', checked: true } });
		const track = container.querySelector('.switch-track');
		expect(track?.classList.contains('switch-success')).toBe(true);
	});

	it('uses ariaLabel fallback when no visible label', () => {
		const { container } = render(Switch);
		const button = container.querySelector('[role="switch"]');
		expect(button?.getAttribute('aria-label')).toBe('Toggle');
	});
});
