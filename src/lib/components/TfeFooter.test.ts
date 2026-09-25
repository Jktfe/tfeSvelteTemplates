/**
 * ============================================================
 * TfeFooter Tests
 * ============================================================
 *
 * The footer takes no props, so these tests pin its structure:
 *   - a single contentinfo landmark
 *   - brand block with logo alt text and heading
 *   - the three link columns in order
 *   - every external link opens safely (target + rel)
 *   - internal links stay same-tab
 *   - the lockup bar copy
 * ============================================================
 */

import { render, screen, within } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import TfeFooter from './TfeFooter.svelte';

describe('TfeFooter', () => {
	it('renders exactly one footer landmark', () => {
		render(TfeFooter);
		expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
	});

	it('renders the brand block', () => {
		render(TfeFooter);
		expect(screen.getByAltText('TFE logo')).toHaveAttribute('src', '/tfe/tfe-logo-white.svg');
		expect(screen.getByRole('heading', { level: 3, name: 'There For Everything.' })).toBeInTheDocument();
	});

	it('renders the link columns in order', () => {
		render(TfeFooter);
		const headings = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
		expect(headings).toEqual(['The kit', 'Source', 'Built by']);
	});

	it('opens every external link in a new tab with safe rel attributes', () => {
		const { container } = render(TfeFooter);
		const external = Array.from(container.querySelectorAll<HTMLAnchorElement>('a')).filter((a) =>
			a.getAttribute('href')?.startsWith('http')
		);
		expect(external.length).toBeGreaterThan(0);
		for (const link of external) {
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	it('keeps internal links in the same tab', () => {
		render(TfeFooter);
		const footer = screen.getByRole('contentinfo');
		const components = within(footer).getByRole('link', { name: 'All components' });
		expect(components).toHaveAttribute('href', '/#components');
		expect(components).not.toHaveAttribute('target');
		expect(within(footer).getByRole('link', { name: 'GSAP suite' })).toHaveAttribute(
			'href',
			'/gsap-suite'
		);
	});

	it('points the source column at the public repo', () => {
		render(TfeFooter);
		expect(screen.getByRole('link', { name: 'GitHub repo' })).toHaveAttribute(
			'href',
			'https://github.com/Jktfe/tfeSvelteTemplates'
		);
	});

	it('renders the lockup bar copy', () => {
		render(TfeFooter);
		expect(screen.getByText('© TFE Ltd · A British limited company')).toBeInTheDocument();
		expect(screen.getByText('Built with Svelte 5 · SvelteKit · TypeScript')).toBeInTheDocument();
	});
});
