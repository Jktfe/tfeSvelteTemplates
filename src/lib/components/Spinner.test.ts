/**
 * ============================================================
 * Spinner Tests
 * ============================================================
 *
 * Verifies the four visual variants render the right structural
 * elements, sizes apply the right class, the visible label and
 * ARIA labels are wired up correctly, and custom colour is
 * forwarded to the inline custom property.
 *
 * Animations themselves live in CSS keyframes — they're not what
 * we're testing here. We test the markup contract that makes the
 * animations possible, plus the accessibility surface.
 * ============================================================
 */

import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Spinner from './Spinner.svelte';

function getRoot(container: HTMLElement): HTMLElement {
	const el = container.querySelector('.spinner');
	if (!el) throw new Error('Spinner root not found');
	return el as HTMLElement;
}

describe('Spinner', () => {
	it('renders the ring variant by default', () => {
		const { container } = render(Spinner);
		const root = getRoot(container);
		expect(root.classList.contains('spinner-ring')).toBe(true);
		expect(container.querySelector('.ring-svg')).toBeTruthy();
		expect(container.querySelector('.ring-arc')).toBeTruthy();
	});

	it('renders three dots when variant is "dots"', () => {
		const { container } = render(Spinner, { props: { variant: 'dots' } });
		const root = getRoot(container);
		expect(root.classList.contains('spinner-dots')).toBe(true);
		const dots = container.querySelectorAll('.dot');
		expect(dots.length).toBe(3);
	});

	it('renders four bars when variant is "bars"', () => {
		const { container } = render(Spinner, { props: { variant: 'bars' } });
		const root = getRoot(container);
		expect(root.classList.contains('spinner-bars')).toBe(true);
		const bars = container.querySelectorAll('.bar');
		expect(bars.length).toBe(4);
	});

	it('renders three concentric pulse rings when variant is "pulse"', () => {
		const { container } = render(Spinner, { props: { variant: 'pulse' } });
		const root = getRoot(container);
		expect(root.classList.contains('spinner-pulse')).toBe(true);
		const rings = container.querySelectorAll('.pulse-ring');
		expect(rings.length).toBe(3);
	});

	it('applies size-sm class when size is "sm"', () => {
		const { container } = render(Spinner, { props: { size: 'sm' } });
		expect(getRoot(container).classList.contains('spinner-sm')).toBe(true);
	});

	it('applies size-lg class when size is "lg"', () => {
		const { container } = render(Spinner, { props: { size: 'lg' } });
		expect(getRoot(container).classList.contains('spinner-lg')).toBe(true);
	});

	it('defaults to size-md when size is not provided', () => {
		const { container } = render(Spinner);
		expect(getRoot(container).classList.contains('spinner-md')).toBe(true);
	});

	it('exposes role="status" so AT announces it as a status region', () => {
		const { container } = render(Spinner);
		const root = getRoot(container);
		expect(root.getAttribute('role')).toBe('status');
	});

	it('uses aria-live="polite" so the label announces without interrupting', () => {
		const { container } = render(Spinner);
		const root = getRoot(container);
		expect(root.getAttribute('aria-live')).toBe('polite');
	});

	it('uses ariaLabel as fallback when no visible label is set', () => {
		const { container } = render(Spinner, { props: { ariaLabel: 'Fetching data' } });
		const root = getRoot(container);
		expect(root.getAttribute('aria-label')).toBe('Fetching data');
	});

	it('defaults aria-label to "Loading"', () => {
		const { container } = render(Spinner);
		const root = getRoot(container);
		expect(root.getAttribute('aria-label')).toBe('Loading');
	});

	it('renders the visible label and prefers it for aria-label (avoids duplicate AT announcement)', () => {
		const { container, getByText } = render(Spinner, { props: { label: 'Saving…' } });
		expect(getByText('Saving…')).toBeTruthy();
		expect(getRoot(container).getAttribute('aria-label')).toBe('Saving…');
	});

	it('does not render a label element when label prop is empty', () => {
		const { container } = render(Spinner);
		expect(container.querySelector('.spinner-label')).toBeNull();
	});

	it('forwards a custom colour as the --spinner-color CSS custom property', () => {
		const { container } = render(Spinner, { props: { color: '#10b981' } });
		const root = getRoot(container);
		const style = root.getAttribute('style') ?? '';
		expect(style).toContain('--spinner-color: #10b981');
	});

	it('omits the custom-property style when no colour is provided (inherits currentColor)', () => {
		const { container } = render(Spinner);
		const root = getRoot(container);
		const style = root.getAttribute('style') ?? '';
		expect(style).not.toContain('--spinner-color');
	});

	it('merges an extra class onto the wrapper', () => {
		const { container } = render(Spinner, { props: { class: 'my-custom-class' } });
		const root = getRoot(container);
		expect(root.classList.contains('my-custom-class')).toBe(true);
		// Built-in classes still present
		expect(root.classList.contains('spinner')).toBe(true);
		expect(root.classList.contains('spinner-ring')).toBe(true);
	});
});
