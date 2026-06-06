/**
 * ============================================================
 * RichTextEditor Tests
 * ============================================================
 *
 * Verifies the editor renders a toolbar + editable region, that
 * the placeholder shows only when empty, that an externally set
 * `value` populates the editor, that toolbar buttons expose the
 * right a11y attributes, and — most importantly — that the inline
 * allowlist sanitiser strips dangerous markup while keeping the
 * allow-listed tags and safe text.
 *
 * Run: bun run test src/lib/components/RichTextEditor.test.ts
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import RichTextEditor from './RichTextEditor.svelte';

describe('RichTextEditor', () => {
	it('renders a formatting toolbar with the eight tools', () => {
		const { container } = render(RichTextEditor);
		const toolbar = screen.getByRole('toolbar', { name: 'Text formatting' });
		expect(toolbar).toBeInTheDocument();
		expect(container.querySelectorAll('.rte-btn').length).toBe(8);
	});

	it('exposes the editable region as a multiline textbox', () => {
		render(RichTextEditor, { props: { ariaLabel: 'Bio editor' } });
		const box = screen.getByRole('textbox', { name: 'Bio editor' });
		expect(box.getAttribute('aria-multiline')).toBe('true');
		expect(box.getAttribute('contenteditable')).toBe('true');
	});

	it('shows the placeholder when empty and hides it when value is set', () => {
		const { container, rerender } = render(RichTextEditor, {
			props: { placeholder: 'Write here…' }
		});
		expect(container.querySelector('.rte-placeholder')?.textContent).toBe('Write here…');

		rerender({ value: '<p>Hello</p>', placeholder: 'Write here…' });
		expect(container.querySelector('.rte-placeholder')).toBeNull();
	});

	it('populates the editor from an external value', () => {
		const { container } = render(RichTextEditor, {
			props: { value: '<p>Seeded <strong>content</strong></p>' }
		});
		const editor = container.querySelector('.rte-editor') as HTMLElement;
		expect(editor.innerHTML).toContain('<strong>content</strong>');
	});

	it('toolbar buttons carry aria-labels and the formatting buttons are pressable', () => {
		render(RichTextEditor);
		expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
		expect(screen.getByRole('button', { name: 'Bullet list' })).toHaveAttribute('aria-pressed', 'false');
		// Link + clear are actions, not toggles — no aria-pressed.
		expect(screen.getByRole('button', { name: 'Insert link' })).not.toHaveAttribute('aria-pressed');
	});

	it('first toolbar button is in the tab order, the rest are roving (-1)', () => {
		render(RichTextEditor);
		expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('tabindex', '0');
		expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('tabindex', '-1');
	});

	it('disabled mode turns off contenteditable and disables the toolbar', () => {
		const { container } = render(RichTextEditor, { props: { disabled: true } });
		const editor = container.querySelector('.rte-editor') as HTMLElement;
		expect(editor.getAttribute('contenteditable')).toBe('false');
		expect((screen.getByRole('button', { name: 'Bold' }) as HTMLButtonElement).disabled).toBe(true);
	});

	it('sanitises a dangerous external value: drops script + event handlers, keeps safe tags', () => {
		const dirty =
			'<p onclick="steal()">Safe <strong>bold</strong></p>' +
			'<script>alert(1)</script>' +
			'<img src=x onerror="hack()">';
		const { container } = render(RichTextEditor, { props: { value: dirty } });
		const editor = container.querySelector('.rte-editor') as HTMLElement;
		const html = editor.innerHTML;
		// Allowed structure survives, with the inline handler stripped.
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('Safe');
		expect(html).not.toContain('onclick');
		// Disallowed / dangerous content is gone.
		expect(html).not.toContain('<script');
		expect(html.toLowerCase()).not.toContain('onerror');
		expect(html.toLowerCase()).not.toContain('<img');
	});

	it('rejects javascript: links but keeps a safe https link', () => {
		const dirty =
			'<a href="javascript:alert(1)">bad</a>' +
			'<a href="https://example.com">good</a>';
		const { container } = render(RichTextEditor, { props: { value: dirty } });
		const editor = container.querySelector('.rte-editor') as HTMLElement;
		const html = editor.innerHTML;
		expect(html.toLowerCase()).not.toContain('javascript:');
		expect(html).toContain('href="https://example.com"');
		// Surviving anchors are hardened.
		expect(html).toContain('rel="noopener noreferrer"');
	});
});
