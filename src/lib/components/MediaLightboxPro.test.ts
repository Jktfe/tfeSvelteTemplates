import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MediaLightboxPro, {
	mediaCounter,
	nextMediaIndex,
	previousMediaIndex,
	type MediaLightboxItem
} from './MediaLightboxPro.svelte';

const items: MediaLightboxItem[] = [
	{
		id: 'health',
		title: 'Health matrix',
		src: '/ComponentScreenshots/ComponentHealthMatrixShot.webp',
		alt: 'Health matrix screenshot'
	},
	{
		id: 'tokens',
		title: 'Theme tokens',
		src: '/ComponentScreenshots/ThemeTokenInspectorShot.webp',
		alt: 'Theme token screenshot'
	}
];

describe('MediaLightboxPro helpers', () => {
	it('wraps media navigation indexes', () => {
		expect(nextMediaIndex(1, 2)).toBe(0);
		expect(previousMediaIndex(0, 2)).toBe(1);
		expect(mediaCounter(1, 2)).toBe('2 / 2');
	});
});

describe('MediaLightboxPro component', () => {
	it('renders media thumbnails', () => {
		render(MediaLightboxPro, { items, title: 'Visual proof' });

		expect(screen.getByRole('heading', { name: 'Visual proof' })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Health matrix/ })).toBeTruthy();
		expect(screen.getByAltText('Theme token screenshot')).toBeTruthy();
	});
});

describe('MediaLightboxPro keyboard and focus behaviour', () => {
	async function openFirst() {
		const user = userEvent.setup();
		render(MediaLightboxPro, { items, title: 'Visual proof' });
		const trigger = screen.getByRole('button', { name: /Health matrix/ });
		await user.click(trigger);
		return { user, trigger };
	}

	it('opens an aria-modal dialog labelled by the active item', async () => {
		await openFirst();
		const dialog = screen.getByRole('dialog');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		expect(dialog.getAttribute('aria-labelledby')).toBe('media-lightbox-active-title');
		expect(document.getElementById('media-lightbox-active-title')?.textContent).toBe(
			'Health matrix'
		);
	});

	it('moves focus into the dialog on open', async () => {
		await openFirst();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close lightbox' }));
	});

	it('closes on Escape and restores focus to the trigger', async () => {
		const { user, trigger } = await openFirst();
		await user.keyboard('{Escape}');
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('restores focus to the trigger when closed via the Close button', async () => {
		const { user, trigger } = await openFirst();
		await user.click(screen.getByRole('button', { name: 'Close lightbox' }));
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('traps Tab and Shift+Tab inside the dialog', async () => {
		const { user } = await openFirst();
		const closeBtn = screen.getByRole('button', { name: 'Close lightbox' });
		const nextBtn = screen.getByRole('button', { name: 'Next item' });
		nextBtn.focus();
		await user.tab();
		expect(document.activeElement).toBe(closeBtn);
		await user.tab({ shift: true });
		expect(document.activeElement).toBe(nextBtn);
	});

	it('steps through items with the arrow keys, wrapping at the ends', async () => {
		const { user } = await openFirst();
		expect(screen.getByText('1 / 2')).toBeTruthy();
		await user.keyboard('{ArrowRight}');
		expect(document.getElementById('media-lightbox-active-title')?.textContent).toBe(
			'Theme tokens'
		);
		expect(screen.getByText('2 / 2')).toBeTruthy();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByText('1 / 2')).toBeTruthy();
		await user.keyboard('{ArrowLeft}');
		expect(screen.getByText('2 / 2')).toBeTruthy();
	});

	it('hides previous/next controls and ignores arrows for a single item', async () => {
		const user = userEvent.setup();
		render(MediaLightboxPro, { items: [items[0]] });
		await user.click(screen.getByRole('button', { name: /Health matrix/ }));
		expect(screen.queryByRole('button', { name: 'Next item' })).toBeNull();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByText('1 / 1')).toBeTruthy();
	});

	it('closes when the backdrop (not the panel) is clicked', async () => {
		const { user } = await openFirst();
		const panel = screen.getByRole('dialog');
		await user.click(panel);
		expect(screen.getByRole('dialog')).toBeTruthy();
		const backdrop = panel.parentElement as HTMLElement;
		await user.click(backdrop);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('locks body scroll while open and restores it on close', async () => {
		document.body.style.overflow = 'auto';
		const { user } = await openFirst();
		expect(document.body.style.overflow).toBe('hidden');
		await user.keyboard('{Escape}');
		expect(document.body.style.overflow).toBe('auto');
		document.body.style.overflow = '';
	});
});
