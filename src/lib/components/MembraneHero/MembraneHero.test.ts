/**
 * ============================================================
 * MembraneHero Tests
 * ============================================================
 *
 * Verifies headline / subhead / eyebrow / CTA rendering, palette
 * class application, optional focal-dot toggle, decorative SVG
 * carries aria-hidden, and class prop forwarding.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import MembraneHero from './MembraneHero.svelte';

describe('MembraneHero', () => {
	it('renders the default headline as an H1', () => {
		const { container } = render(MembraneHero, { props: {} });
		const h1 = container.querySelector('h1');
		expect(h1).toBeTruthy();
		expect(h1?.textContent).toContain('A new kind of canvas');
	});

	it('renders the default eyebrow tag', () => {
		render(MembraneHero, { props: {} });
		expect(screen.getByText('Now in beta')).toBeTruthy();
	});

	it('renders the default subhead', () => {
		render(MembraneHero, { props: {} });
		expect(screen.getByText(/Hand-crafted primitives/)).toBeTruthy();
	});

	it('renders both CTAs as anchor links', () => {
		const { container } = render(MembraneHero, {
			props: { primaryHref: '/start', secondaryHref: '/docs' }
		});
		const anchors = container.querySelectorAll('a');
		const hrefs = Array.from(anchors).map((a) => a.getAttribute('href'));
		expect(hrefs).toContain('/start');
		expect(hrefs).toContain('/docs');
	});

	it('uses the supplied custom headline when provided', () => {
		const { container } = render(MembraneHero, {
			props: { headline: 'Custom mountain peak' }
		});
		const h1 = container.querySelector('h1');
		expect(h1?.textContent).toContain('Custom mountain peak');
	});

	it('honours the palette prop via a class on the hero', () => {
		const { container } = render(MembraneHero, { props: { palette: 'sunset' } });
		expect(container.querySelector('.mh-sunset')).toBeTruthy();
	});

	it('renders the focal dot by default', () => {
		const { container } = render(MembraneHero, { props: {} });
		expect(container.querySelector('.mh-dot')).toBeTruthy();
	});

	it('omits the focal dot when showDot=false', () => {
		const { container } = render(MembraneHero, { props: { showDot: false } });
		expect(container.querySelector('.mh-dot')).toBeNull();
	});

	it('marks decorative SVG layers as aria-hidden', () => {
		const { container } = render(MembraneHero, { props: {} });
		const ariaHidden = container.querySelectorAll('[aria-hidden="true"]');
		expect(ariaHidden.length).toBeGreaterThan(0);
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(MembraneHero, { props: { class: 'extra-hero-class' } });
		expect(container.querySelector('.extra-hero-class')).toBeTruthy();
	});
});
