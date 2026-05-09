/**
 * ============================================================
 * GsapSplitTextHero Tests
 * ============================================================
 *
 * Verifies module-level exports (mode option list + normaliser),
 * smoke render with default copy, prop overrides, mode switch
 * accessibility wiring, and the theme prop reaching the DOM.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import GsapSplitTextHero, {
	normalizeSplitTextMode,
	splitTextModeOptions,
	splitTextModeConfig
} from './GsapSplitTextHero.svelte';

describe('GsapSplitTextHero module helpers', () => {
	it('exposes the canonical chars/words/lines mode option list', () => {
		const ids = splitTextModeOptions.map((o) => o.id);
		expect(ids).toEqual(['chars', 'words', 'lines']);
	});

	it('normalizeSplitTextMode accepts known modes verbatim', () => {
		expect(normalizeSplitTextMode('chars')).toBe('chars');
		expect(normalizeSplitTextMode('words')).toBe('words');
		expect(normalizeSplitTextMode('lines')).toBe('lines');
	});

	it('normalizeSplitTextMode falls back to "chars" for unknown values', () => {
		expect(normalizeSplitTextMode('paragraphs')).toBe('chars');
		expect(normalizeSplitTextMode('')).toBe('chars');
		expect(normalizeSplitTextMode('CHARS')).toBe('chars');
	});

	it('splitTextModeConfig returns a target for each canonical mode', () => {
		expect(splitTextModeConfig('chars').target).toBeDefined();
		expect(splitTextModeConfig('words').target).toBeDefined();
		expect(splitTextModeConfig('lines').target).toBeDefined();
	});
});

describe('GsapSplitTextHero component', () => {
	it('renders the default headline as an H1 with the right id', () => {
		const { container } = render(GsapSplitTextHero, { props: {} });
		const h1 = container.querySelector('h1#gsap-suite-title');
		expect(h1).toBeTruthy();
		expect(h1?.textContent).toContain('Motion primitives');
	});

	it('uses a custom headline when supplied', () => {
		const { container } = render(GsapSplitTextHero, {
			props: { headline: 'Bespoke headline content' }
		});
		const h1 = container.querySelector('h1#gsap-suite-title');
		expect(h1?.textContent).toContain('Bespoke headline content');
	});

	it('renders the eyebrow + lede copy', () => {
		render(GsapSplitTextHero, {
			props: { eyebrow: 'Eyebrow tag', copy: 'Body lede.' }
		});
		expect(screen.getByText('Eyebrow tag')).toBeTruthy();
		expect(screen.getByText('Body lede.')).toBeTruthy();
	});

	it('renders one mode-switch button per splitTextModeOptions entry', () => {
		const { container } = render(GsapSplitTextHero, { props: {} });
		const buttons = container.querySelectorAll('.mode-switch button');
		expect(buttons.length).toBe(splitTextModeOptions.length);
	});

	it('mode-switch buttons expose aria-pressed reflecting the active mode', () => {
		const { container } = render(GsapSplitTextHero, {
			props: { initialMode: 'words' }
		});
		const buttons = container.querySelectorAll('.mode-switch button');
		const pressed = Array.from(buttons).filter((b) => b.getAttribute('aria-pressed') === 'true');
		expect(pressed.length).toBe(1);
		expect(pressed[0].textContent).toContain('Words');
	});

	it('clicking a different mode flips the aria-pressed states', async () => {
		const user = userEvent.setup();
		const { container } = render(GsapSplitTextHero, { props: { initialMode: 'chars' } });
		const linesBtn = Array.from(container.querySelectorAll('.mode-switch button')).find(
			(b) => b.textContent?.trim() === 'Lines'
		) as HTMLButtonElement;
		expect(linesBtn).toBeTruthy();
		await user.click(linesBtn);
		expect(linesBtn.getAttribute('aria-pressed')).toBe('true');
	});

	it('forwards the class prop onto the wrapper', () => {
		const { container } = render(GsapSplitTextHero, {
			props: { class: 'custom-hero-class' }
		});
		expect(container.querySelector('.custom-hero-class')).toBeTruthy();
	});

	it('the mode-switch group carries an aria-label', () => {
		const { container } = render(GsapSplitTextHero, { props: {} });
		const switchEl = container.querySelector('.mode-switch');
		expect(switchEl?.getAttribute('aria-label')).toBeTruthy();
	});
});
