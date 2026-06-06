/**
 * ============================================================
 * TagInput Tests
 * ============================================================
 * Mounts the component and exercises the real interactions:
 * committing on Enter, deduping, two-step Backspace deletion,
 * remove buttons, and the group ARIA contract.
 *
 * 💡 Run `bun run test:ui` for a visual, filterable runner.
 * ============================================================
 */

import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import TagInput from './TagInput.svelte';

afterEach(() => {
	cleanup();
});

describe('TagInput', () => {
	it('renders initial tags as listitems inside a labelled group', () => {
		const { getByRole, getAllByRole } = render(TagInput, {
			props: { value: ['alpha', 'beta'], ariaLabel: 'Skills' }
		});

		const group = getByRole('group', { name: 'Skills' });
		expect(group).toBeTruthy();
		expect(getAllByRole('listitem')).toHaveLength(2);
	});

	it('commits a typed tag on Enter', async () => {
		const user = userEvent.setup();
		const { getByLabelText, getAllByRole } = render(TagInput, {
			props: { value: [], ariaLabel: 'Tags' }
		});

		const input = getByLabelText('Tags, add new');
		await user.type(input, 'svelte{Enter}');

		expect(getAllByRole('listitem')).toHaveLength(1);
	});

	it('rejects a case-insensitive duplicate by default', async () => {
		const user = userEvent.setup();
		const { getByLabelText, getAllByRole } = render(TagInput, {
			props: { value: ['Svelte'] }
		});

		const input = getByLabelText('Tags, add new');
		await user.type(input, 'svelte{Enter}');

		// Still only the original chip.
		expect(getAllByRole('listitem')).toHaveLength(1);
	});

	it('exposes a labelled remove button per chip and removes it on click', async () => {
		const user = userEvent.setup();
		const { getByRole, queryAllByRole } = render(TagInput, {
			props: { value: ['one'] }
		});

		const removeBtn = getByRole('button', { name: 'Remove one' });
		await user.click(removeBtn);

		expect(queryAllByRole('listitem')).toHaveLength(0);
	});

	it('removes the last chip only on the second empty Backspace (arm then fire)', async () => {
		const user = userEvent.setup();
		const { getByLabelText, getAllByRole, queryAllByRole } = render(TagInput, {
			props: { value: ['keep', 'drop'] }
		});

		const input = getByLabelText('Tags, add new');
		input.focus();

		// First Backspace arms (nothing removed yet).
		await user.keyboard('{Backspace}');
		expect(getAllByRole('listitem')).toHaveLength(2);

		// Second Backspace fires.
		await user.keyboard('{Backspace}');
		expect(queryAllByRole('listitem')).toHaveLength(1);
	});

	it('honours the max cap', async () => {
		const { getByLabelText, getAllByRole } = render(TagInput, {
			props: { value: ['a'], max: 1 }
		});

		const input = getByLabelText('Tags, add new') as HTMLInputElement;
		// At capacity the input is disabled, so no further tags can be added.
		expect(input.disabled).toBe(true);
		expect(getAllByRole('listitem')).toHaveLength(1);
	});
});
