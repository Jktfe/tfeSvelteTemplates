/**
 * ============================================================
 * ComponentPageShell Tests
 * ============================================================
 *
 * A smoke test of the editorial shell's opt-in sections. The
 * contract is "everything you don't pass is omitted", so each
 * test checks both halves: a section renders when its prop or
 * snippet is supplied, and disappears when it isn't.
 *
 * Snippets are supplied through ComponentPageShellTestHarness,
 * because render() can't pass snippet props directly.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ComponentPageShellTestHarness from './ComponentPageShellTestHarness.test.svelte';

const minimal = {
	name: 'MagicCard',
	category: 'Cards & Layout',
	description: 'Cards with mouse-tracking spotlight effects.'
};

const full = {
	...minimal,
	install: 'cp src/lib/components/MagicCard.svelte ./src/lib',
	dependencies: ['Svelte 5+', 'Zero external dependencies'],
	source: 'src/lib/components/MagicCard.svelte',
	demoPath: 'src/routes/magiccard/+page.svelte',
	agentSteps: ['Copy MagicCard.svelte into your project.', 'Import and wrap any element.'],
	tags: ['Svelte 5', 'Hover'],
	resources: [
		{ label: 'Source', href: '/source' },
		{ label: 'Svelte docs', href: 'https://svelte.dev' }
	],
	usageSnippet: '<MagicCard gradientColor="#D9F99D40" />',
	codeExplanation: 'Tracks pointer position and paints a radial gradient.',
	docsHtml: '<h2>What Does It Do?</h2><p>Explainer body</p>'
};

function sectionHeadings() {
	return screen.getAllByRole('heading').map((h) => h.textContent?.trim());
}

describe('ComponentPageShell', () => {
	it('renders the header: breadcrumb, title and lede', () => {
		render(ComponentPageShellTestHarness, { props: minimal });
		expect(screen.getByRole('heading', { level: 1, name: 'MagicCard' })).toBeInTheDocument();
		expect(screen.getByText(minimal.description)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: 'Cards & Layout' })).toHaveAttribute(
			'href',
			'/#components'
		);
	});

	it('renders the demo snippet inside the Live demo section', () => {
		render(ComponentPageShellTestHarness, { props: minimal });
		const section = screen.getByRole('region', { name: 'Live demo' });
		expect(section).toContainElement(screen.getByTestId('demo-button'));
	});

	it('shows a placeholder when no demo snippet is supplied', () => {
		render(ComponentPageShellTestHarness, { props: { ...minimal, withDemo: false } });
		expect(screen.getByText('Drop your interactive demo into this slot.')).toBeInTheDocument();
	});

	it('omits every optional section when only the required props are given', () => {
		render(ComponentPageShellTestHarness, {
			props: { ...minimal, withApi: false }
		});
		const headings = sectionHeadings();
		expect(headings).toEqual(['MagicCard', 'Live demo']);
	});

	it('renders every section, in order, when all props and snippets are supplied', () => {
		render(ComponentPageShellTestHarness, { props: full });
		const headings = sectionHeadings();
		for (const expected of [
			'Live demo',
			'Implementation',
			'Logic explainer',
			'API',
			'Installation',
			'Dependencies',
			'For your agent',
			'Resources',
			'Tags'
		]) {
			expect(headings).toContain(expected);
		}
		expect(headings.indexOf('Live demo')).toBeLessThan(headings.indexOf('Implementation'));
		expect(headings.indexOf('Implementation')).toBeLessThan(headings.indexOf('Logic explainer'));
		expect(headings.indexOf('Logic explainer')).toBeLessThan(headings.indexOf('API'));
	});

	it('renders the api snippet and the docs HTML', () => {
		render(ComponentPageShellTestHarness, { props: full });
		expect(screen.getByRole('region', { name: 'API' })).toContainElement(
			screen.getByTestId('api-table')
		);
		expect(screen.getByText('Explainer body')).toBeInTheDocument();
	});

	it('lists dependencies, tags and agent steps', () => {
		render(ComponentPageShellTestHarness, { props: full });
		expect(screen.getByText('Zero external dependencies')).toBeInTheDocument();
		expect(screen.getByText('Hover')).toBeInTheDocument();
		expect(screen.getByText('Import and wrap any element.')).toBeInTheDocument();
		const steps = screen.getByRole('region', { name: 'For your agent' }).querySelectorAll('ol li b');
		expect(Array.from(steps).map((b) => b.textContent)).toEqual(['01', '02']);
	});

	it('marks only external resources as new-tab links', () => {
		render(ComponentPageShellTestHarness, { props: full });
		const internal = screen.getByRole('link', { name: 'Source' });
		const external = screen.getByRole('link', { name: /Svelte docs/ });
		expect(internal).not.toHaveAttribute('target');
		expect(external).toHaveAttribute('target', '_blank');
		expect(external).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('renders the install command with a copy button', () => {
		render(ComponentPageShellTestHarness, { props: full });
		expect(screen.getByText(full.install)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Copy install command' })).toBeInTheDocument();
	});

	it('renders shelf navigation in the header and footer when links exist', () => {
		render(ComponentPageShellTestHarness, {
			props: {
				...minimal,
				shelfNavigation: {
					shelf: 'Cards',
					index: 2,
					total: 5,
					previous: { name: 'CardStack', href: '/cardstack', icon: '🃏', description: '' },
					next: { name: 'Cardwall', href: '/cardwall', icon: '🧱', description: '' }
				}
			}
		});
		expect(screen.getAllByRole('navigation', { name: 'Cards component navigation' })).toHaveLength(2);
		expect(
			screen.getAllByRole('link', { name: 'Previous Cards component: CardStack' })[0]
		).toHaveAttribute('href', '/cardstack');
		expect(
			screen.getAllByRole('link', { name: 'Next Cards component: Cardwall' })[0]
		).toHaveAttribute('href', '/cardwall');
	});

	it('omits shelf navigation when there are no neighbours', () => {
		render(ComponentPageShellTestHarness, {
			props: { ...minimal, shelfNavigation: { shelf: 'Cards', index: 1, total: 1 } }
		});
		expect(screen.queryByRole('navigation')).toBeNull();
	});
});
