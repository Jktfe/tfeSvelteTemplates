import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

// Stub gsap/Flip so vitest's mock registry resolves the import synchronously.
// Without this, GsapFlipGrid (rendered transitively by ComponentDirectory)
// goes through the worker module-runner RPC for gsap/Flip, which can resolve
// AFTER vitest tears the worker down — surfacing as
// `[vitest-worker]: Closing rpc while 'fetch' was pending` against gsap/Flip.js:11.
vi.mock('gsap/Flip', () => ({
	Flip: { fit: () => null, getState: () => null, from: () => null }
}));

vi.mock('$lib/gsap/context', () => ({
	prefersReducedMotion: () => true,
	registerGsapPlugins: () =>
		Promise.resolve({
			from: () => null,
			killTweensOf: () => null
		})
}));

import ComponentDirectory, {
	type DirectoryComponentInfo,
	selectFeaturedComponents,
	shouldUseComponentDirectory
} from './ComponentDirectory.svelte';

const components: DirectoryComponentInfo[] = Array.from({ length: 12 }, (_, index) => ({
	name: `Component ${index + 1}`,
	href: `/component-${index + 1}`,
	icon: index % 2 === 0 ? '🎬' : '📊',
	description: `Component ${index + 1} description`,
	screenshot: `/ComponentScreenshots/Component${index + 1}Shot.png`,
	themeSupport: index % 2 === 0 ? 'dual' : 'light',
	source: `src/lib/components/Component${index + 1}.svelte`
}));

describe('ComponentDirectory', () => {
	it('uses the directory template only above the dense threshold', () => {
		expect(shouldUseComponentDirectory(9)).toBe(false);
		expect(shouldUseComponentDirectory(10)).toBe(true);
		expect(shouldUseComponentDirectory(4, 3)).toBe(true);
	});

	it('selects the configured number of featured components', () => {
		expect(selectFeaturedComponents(components, 2).map((component) => component.name)).toEqual([
			'Component 1',
			'Component 2'
		]);
		expect(selectFeaturedComponents(components, -1)).toEqual([]);
	});

	it('renders every component as a directory link', () => {
		const { container } = render(ComponentDirectory, {
			components,
			categoryName: 'Dense category',
			featuredCount: 3
		});

		expect(container.querySelector('.component-directory')).toHaveAttribute('data-count', '12');
		expect(container.querySelectorAll('.flip-grid__card')).toHaveLength(12);
		expect(container.querySelectorAll('.featured-link')).toHaveLength(3);
		expect(container.querySelectorAll('.theme-chip')).toHaveLength(3);
		expect(screen.getAllByText('Light and dark mode').length).toBeGreaterThan(0);
		expect(screen.getByRole('navigation', { name: 'Dense category component directory' })).toBeTruthy();
		expect(screen.getAllByRole('link', { name: /Component 1/i })[0]).toHaveAttribute(
			'href',
			'/component-1'
		);
	});
});
