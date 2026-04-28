/**
 * ============================================================
 * PinInput Tests
 * ============================================================
 *
 * Verifies the segmented OTP input renders the right number of
 * cells, auto-advances on typing, jumps back on Backspace, and
 * distributes pastes across all cells. Mask + numeric filter
 * tested at the value/DOM level.
 *
 * Run: bun run test src/lib/components/PinInput.test.ts
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PinInput from './PinInput.svelte';

function getCells(container: HTMLElement): HTMLInputElement[] {
	return Array.from(container.querySelectorAll('input.pin-cell')) as HTMLInputElement[];
}

describe('PinInput', () => {
	it('renders default 4 cells', () => {
		const { container } = render(PinInput);
		expect(getCells(container).length).toBe(4);
	});

	it('renders custom length (6 cells)', () => {
		const { container } = render(PinInput, { props: { length: 6 } });
		expect(getCells(container).length).toBe(6);
	});

	it('typing a digit auto-advances focus to the next cell', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4 } });
		const cells = getCells(container);
		cells[0].focus();
		await user.keyboard('1');
		expect(cells[1]).toHaveFocus();
		expect(cells[0].value).toBe('1');
	});

	it('Backspace on an empty cell jumps to and clears the previous cell', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4, value: '12' } });
		const cells = getCells(container);
		// Cell index 2 is empty after value='12'
		cells[2].focus();
		await user.keyboard('{Backspace}');
		expect(cells[1]).toHaveFocus();
		expect(cells[1].value).toBe('');
	});

	it('paste distributes characters across cells', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 6 } });
		const cells = getCells(container);
		cells[0].focus();
		await user.paste('123456');
		expect(cells[0].value).toBe('1');
		expect(cells[1].value).toBe('2');
		expect(cells[2].value).toBe('3');
		expect(cells[3].value).toBe('4');
		expect(cells[4].value).toBe('5');
		expect(cells[5].value).toBe('6');
	});

	it('numeric mode rejects non-digit characters', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4, type: 'numeric' } });
		const cells = getCells(container);
		cells[0].focus();
		await user.keyboard('a');
		expect(cells[0].value).toBe('');
		// Focus should NOT have advanced because the character was rejected
		expect(cells[0]).toHaveFocus();
	});

	it('alphanumeric mode accepts letters and digits', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4, type: 'alphanumeric' } });
		const cells = getCells(container);
		cells[0].focus();
		await user.keyboard('A');
		expect(cells[0].value).toBe('A');
		expect(cells[1]).toHaveFocus();
	});

	it('mask renders cells as password inputs (browser draws bullets)', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4, mask: true } });
		const cells = getCells(container);
		// All cells should be type="password" so the browser masks the glyph
		for (const cell of cells) {
			expect(cell.type).toBe('password');
		}
		// Underlying value is preserved (so the consumer can verify the code)
		cells[0].focus();
		await user.keyboard('5');
		expect(cells[0].value).toBe('5');
	});

	it('onComplete fires once when all cells are filled', async () => {
		const user = userEvent.setup();
		const onComplete = vi.fn();
		const { container } = render(PinInput, {
			props: { length: 4, onComplete }
		});
		const cells = getCells(container);
		cells[0].focus();
		await user.keyboard('1234');
		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(onComplete).toHaveBeenCalledWith('1234');
	});

	it('disabled prevents input changes', async () => {
		const user = userEvent.setup();
		const { container } = render(PinInput, { props: { length: 4, disabled: true } });
		const cells = getCells(container);
		expect(cells[0].disabled).toBe(true);
		await user.click(cells[0]);
		await user.keyboard('5');
		expect(cells[0].value).toBe('');
	});

	it('applies size class on the wrapper', () => {
		const { container } = render(PinInput, { props: { size: 'lg' } });
		const wrapper = container.querySelector('.pin-input');
		expect(wrapper?.className).toContain('pin-input-lg');
	});

	it('initial value prop populates the cells', () => {
		const { container } = render(PinInput, { props: { length: 4, value: '42' } });
		const cells = getCells(container);
		expect(cells[0].value).toBe('4');
		expect(cells[1].value).toBe('2');
		expect(cells[2].value).toBe('');
		expect(cells[3].value).toBe('');
	});

	it('exposes group role with aria-label for screen readers', () => {
		render(PinInput, { props: { ariaLabel: 'Two-factor code' } });
		const group = screen.getByRole('group', { name: 'Two-factor code' });
		expect(group).toBeInTheDocument();
	});

	it('numeric mode sets inputmode=numeric on each cell', () => {
		const { container } = render(PinInput, { props: { length: 4, type: 'numeric' } });
		for (const cell of getCells(container)) {
			expect(cell.getAttribute('inputmode')).toBe('numeric');
		}
	});
});
