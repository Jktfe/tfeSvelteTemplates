/**
 * ============================================================
 * BadgeProvenance Tests
 * ============================================================
 *
 * Covers:
 *   - provenanceText() prefixes each kind with its label
 *   - the chip is an external link with safe rel attributes
 *   - default kind is `davevault`
 *   - `tone="ink"` adds the ink modifier class
 *   - decorative dot + arrow stay hidden from assistive tech
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import BadgeProvenance, { provenanceText } from './BadgeProvenance.svelte';

describe('provenanceText', () => {
	it.each([
		['gsap', 'Inspired by GSAP · Pen'],
		['aura', 'Inspired by Aura · Pen'],
		['davevault', 'Spec by Dave Vault · Pen'],
		['codepen', 'Inspired by CodePen · Pen'],
		['custom', 'Inspired by · Pen']
	] as const)('formats the %s kind', (kind, expected) => {
		expect(provenanceText(kind, 'Pen')).toBe(expected);
	});
});

describe('BadgeProvenance', () => {
	const baseProps = {
		sourceLabel: 'GreenSock pen xxmaNYj',
		sourceUrl: 'https://codepen.io/GreenSock/pen/xxmaNYj'
	};

	it('renders an external link to the source', () => {
		render(BadgeProvenance, { props: { ...baseProps, kind: 'gsap' } });
		const link = screen.getByRole('link', { name: /Inspired by GSAP · GreenSock pen xxmaNYj/ });
		expect(link).toHaveAttribute('href', baseProps.sourceUrl);
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		expect(link).toHaveAttribute('title', 'Inspired by GSAP · GreenSock pen xxmaNYj');
	});

	it('defaults to the davevault kind and soft tone', () => {
		render(BadgeProvenance, { props: baseProps });
		const link = screen.getByRole('link');
		expect(link).toHaveTextContent('Spec by Dave Vault');
		expect(link).not.toHaveClass('badge--ink');
	});

	it('applies the ink tone modifier', () => {
		render(BadgeProvenance, { props: { ...baseProps, tone: 'ink' } });
		expect(screen.getByRole('link')).toHaveClass('badge', 'badge--ink');
	});

	it('hides the decorative dot and arrow', () => {
		const { container } = render(BadgeProvenance, { props: baseProps });
		expect(container.querySelector('.badge__dot')).toHaveAttribute('aria-hidden', 'true');
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	});
});
