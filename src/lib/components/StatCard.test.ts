/**
 * ============================================================
 * StatCard Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders title and value
 *   ✓ Hides the footer when no delta is given
 *   ✓ Shows ↑ for positive delta
 *   ✓ Shows ↓ for negative delta
 *   ✓ Shows — for zero delta
 *   ✓ sentiment-positive class when trend matches positiveDirection
 *   ✓ sentiment-negative class when trend opposes positiveDirection
 *   ✓ positiveDirection='down' inverts the sentiment colour
 *   ✓ deltaLabel renders in the footer
 *   ✓ Size class is applied
 *
 * Run:
 *   bun run test -- StatCard
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import StatCard from './StatCard.svelte';

describe('StatCard', () => {
	it('renders title and value', () => {
		const { getByText } = render(StatCard, { title: 'Revenue', value: '£12,450' });
		expect(getByText('Revenue')).toBeTruthy();
		expect(getByText('£12,450')).toBeTruthy();
	});

	it('hides the footer when delta is undefined', () => {
		const { container } = render(StatCard, { title: 'Total', value: 100 });
		expect(container.querySelector('.stat-footer')).toBeNull();
	});

	it('shows ↑ glyph for positive delta', () => {
		const { container } = render(StatCard, {
			title: 'Revenue',
			value: '£100',
			delta: 8.2,
			deltaSuffix: '%'
		});
		const arrow = container.querySelector('.stat-arrow') as HTMLElement;
		expect(arrow.textContent?.trim()).toBe('↑');
	});

	it('shows ↓ glyph for negative delta', () => {
		const { container } = render(StatCard, {
			title: 'Bounce rate',
			value: '32%',
			delta: -3.4,
			deltaSuffix: '%'
		});
		const arrow = container.querySelector('.stat-arrow') as HTMLElement;
		expect(arrow.textContent?.trim()).toBe('↓');
	});

	it('shows — for zero delta', () => {
		const { container } = render(StatCard, {
			title: 'Steady',
			value: 50,
			delta: 0
		});
		const arrow = container.querySelector('.stat-arrow') as HTMLElement;
		expect(arrow.textContent?.trim()).toBe('—');
	});

	it('marks positive-up trend as sentiment-positive', () => {
		const { container } = render(StatCard, {
			title: 'Revenue',
			value: 100,
			delta: 5
		});
		const delta = container.querySelector('.stat-delta') as HTMLElement;
		expect(delta.classList.contains('sentiment-positive')).toBe(true);
	});

	it('marks negative-up trend as sentiment-negative', () => {
		const { container } = render(StatCard, {
			title: 'Revenue',
			value: 100,
			delta: -5
		});
		const delta = container.querySelector('.stat-delta') as HTMLElement;
		expect(delta.classList.contains('sentiment-negative')).toBe(true);
	});

	it('positiveDirection=down inverts sentiment colour', () => {
		// Page-load time is good when it goes down.
		const { container } = render(StatCard, {
			title: 'Load time',
			value: '1.4s',
			delta: -12,
			deltaSuffix: '%',
			positiveDirection: 'down'
		});
		const delta = container.querySelector('.stat-delta') as HTMLElement;
		// Down trend with positiveDirection=down → positive sentiment (green).
		expect(delta.classList.contains('sentiment-positive')).toBe(true);
	});

	it('renders deltaLabel in the footer', () => {
		const { getByText } = render(StatCard, {
			title: 'Users',
			value: 1234,
			delta: 4.2,
			deltaSuffix: '%',
			deltaLabel: 'vs last week'
		});
		expect(getByText('vs last week')).toBeTruthy();
	});

	it('applies the size class', () => {
		const { container } = render(StatCard, { title: 'Big', value: 1, size: 'lg' });
		const card = container.querySelector('.stat-card') as HTMLElement;
		expect(card.classList.contains('stat-lg')).toBe(true);
	});

	it('exposes trend and sentiment as data attributes', () => {
		const { container } = render(StatCard, {
			title: 'Errors',
			value: 12,
			delta: -3,
			positiveDirection: 'down'
		});
		const card = container.querySelector('.stat-card') as HTMLElement;
		expect(card.dataset.trend).toBe('down');
		expect(card.dataset.sentiment).toBe('positive');
	});
});
