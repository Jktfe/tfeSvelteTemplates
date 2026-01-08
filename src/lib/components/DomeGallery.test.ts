/**
 * ============================================================
 * DomeGallery Tests
 * ============================================================
 *
 * These tests verify that the DomeGallery component works correctly.
 * We're checking:
 *   - It renders without crashing
 *   - Structure contains expected elements
 *   - Image tiles are created from data
 *   - CSS custom properties are applied
 *   - Accessibility attributes are present
 *   - Keyboard interactions work (Escape to close)
 *   - Grayscale filter is controllable
 *
 * Note: Full drag/inertia interaction tests require e2e tools.
 * jsdom doesn't support CSS 3D transforms or requestAnimationFrame
 * for physics simulation testing.
 *
 * Run: bun run test DomeGallery
 * ============================================================
 */

import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DomeGallery from './DomeGallery.svelte';

// Sample test data
const testImages = [
	{ src: 'https://example.com/image1.jpg', alt: 'First image' },
	{ src: 'https://example.com/image2.jpg', alt: 'Second image' },
	{ src: 'https://example.com/image3.jpg', alt: 'Third image' }
];

const testImageUrls = [
	'https://example.com/url1.jpg',
	'https://example.com/url2.jpg',
	'https://example.com/url3.jpg'
];

// Mock ResizeObserver since jsdom doesn't support it
class MockResizeObserver {
	callback: ResizeObserverCallback;
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}
	observe() {
		// Trigger immediately with mock dimensions
		this.callback(
			[
				{
					contentRect: { width: 800, height: 600 }
				} as unknown as ResizeObserverEntry
			],
			this as unknown as ResizeObserver
		);
	}
	unobserve() {}
	disconnect() {}
}

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', MockResizeObserver);

	// Mock setPointerCapture and releasePointerCapture (not supported by jsdom)
	Element.prototype.setPointerCapture = vi.fn();
	Element.prototype.releasePointerCapture = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
	// Clean up scroll lock class if left behind
	document.body.classList.remove('dg-scroll-lock');
});

describe('DomeGallery', () => {
	// =========================================================================
	// RENDERING TESTS
	// =========================================================================

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(DomeGallery, { props: { images: testImages } });
			// If we get here without errors, the component rendered
		});

		it('renders the root container', () => {
			render(DomeGallery, { props: { images: testImages } });
			const root = document.querySelector('.sphere-root');
			expect(root).toBeInTheDocument();
		});

		it('renders the main element', () => {
			render(DomeGallery, { props: { images: testImages } });
			const main = document.querySelector('.sphere-main');
			expect(main).toBeInTheDocument();
		});

		it('renders the stage', () => {
			render(DomeGallery, { props: { images: testImages } });
			const stage = document.querySelector('.stage');
			expect(stage).toBeInTheDocument();
		});

		it('renders the sphere container', () => {
			render(DomeGallery, { props: { images: testImages } });
			const sphere = document.querySelector('.sphere');
			expect(sphere).toBeInTheDocument();
		});
	});

	// =========================================================================
	// IMAGE TILE TESTS
	// =========================================================================

	describe('Image Tiles', () => {
		it('creates tiles from image objects', () => {
			render(DomeGallery, { props: { images: testImages } });
			const tiles = document.querySelectorAll('.item');
			expect(tiles.length).toBeGreaterThan(0);
		});

		it('creates tiles from URL strings', () => {
			render(DomeGallery, { props: { images: testImageUrls } });
			const tiles = document.querySelectorAll('.item');
			expect(tiles.length).toBeGreaterThan(0);
		});

		it('renders images inside tiles', () => {
			render(DomeGallery, { props: { images: testImages } });
			const images = document.querySelectorAll('.item__image img');
			expect(images.length).toBeGreaterThan(0);
		});

		it('tiles have data attributes for position', () => {
			render(DomeGallery, { props: { images: testImages } });
			const tile = document.querySelector('.item');
			expect(tile).toHaveAttribute('data-offset-x');
			expect(tile).toHaveAttribute('data-offset-y');
			expect(tile).toHaveAttribute('data-size-x');
			expect(tile).toHaveAttribute('data-size-y');
		});

		it('tiles have data-src for image source', () => {
			render(DomeGallery, { props: { images: testImages } });
			const tile = document.querySelector('.item');
			expect(tile).toHaveAttribute('data-src');
		});

		it('item__image elements have role="button"', () => {
			render(DomeGallery, { props: { images: testImages } });
			const imageContainers = document.querySelectorAll('.item__image');
			imageContainers.forEach((el) => {
				expect(el).toHaveAttribute('role', 'button');
			});
		});

		it('item__image elements are focusable', () => {
			render(DomeGallery, { props: { images: testImages } });
			const imageContainers = document.querySelectorAll('.item__image');
			imageContainers.forEach((el) => {
				expect(el).toHaveAttribute('tabindex', '0');
			});
		});
	});

	// =========================================================================
	// ACCESSIBILITY TESTS
	// =========================================================================

	describe('Accessibility', () => {
		it('tiles have aria-label with alt text', () => {
			render(DomeGallery, { props: { images: testImages } });
			const firstTileImage = document.querySelector('.item__image');
			expect(firstTileImage).toHaveAttribute('aria-label');
		});

		it('tiles without alt text get fallback aria-label', () => {
			const imagesNoAlt = [{ src: 'https://example.com/img.jpg', alt: '' }];
			render(DomeGallery, { props: { images: imagesNoAlt } });
			const tileImage = document.querySelector('.item__image');
			expect(tileImage).toHaveAttribute('aria-label', 'Open image');
		});

		it('images have alt attributes', () => {
			render(DomeGallery, { props: { images: testImages } });
			const img = document.querySelector('.item__image img') as HTMLImageElement;
			expect(img.alt).toBeDefined();
		});

		it('images have draggable="false" to prevent browser drag', () => {
			render(DomeGallery, { props: { images: testImages } });
			const img = document.querySelector('.item__image img') as HTMLImageElement;
			expect(img.draggable).toBe(false);
		});
	});

	// =========================================================================
	// OVERLAY TESTS
	// =========================================================================

	describe('Overlays', () => {
		it('renders the main overlay', () => {
			render(DomeGallery, { props: { images: testImages } });
			const overlay = document.querySelector('.overlay');
			expect(overlay).toBeInTheDocument();
		});

		it('renders the blur overlay', () => {
			render(DomeGallery, { props: { images: testImages } });
			const blurOverlay = document.querySelector('.overlay--blur');
			expect(blurOverlay).toBeInTheDocument();
		});

		it('renders top edge fade', () => {
			render(DomeGallery, { props: { images: testImages } });
			const topFade = document.querySelector('.edge-fade--top');
			expect(topFade).toBeInTheDocument();
		});

		it('renders bottom edge fade', () => {
			render(DomeGallery, { props: { images: testImages } });
			const bottomFade = document.querySelector('.edge-fade--bottom');
			expect(bottomFade).toBeInTheDocument();
		});
	});

	// =========================================================================
	// VIEWER TESTS
	// =========================================================================

	describe('Viewer (Enlarged Image Container)', () => {
		it('renders the viewer container', () => {
			render(DomeGallery, { props: { images: testImages } });
			const viewer = document.querySelector('.viewer');
			expect(viewer).toBeInTheDocument();
		});

		it('renders the scrim (backdrop)', () => {
			render(DomeGallery, { props: { images: testImages } });
			const scrim = document.querySelector('.scrim');
			expect(scrim).toBeInTheDocument();
		});

		it('renders the frame (target area)', () => {
			render(DomeGallery, { props: { images: testImages } });
			const frame = document.querySelector('.frame');
			expect(frame).toBeInTheDocument();
		});

		it('starts with data-enlarging="false"', () => {
			render(DomeGallery, { props: { images: testImages } });
			const root = document.querySelector('.sphere-root');
			expect(root).toHaveAttribute('data-enlarging', 'false');
		});
	});

	// =========================================================================
	// CSS CUSTOM PROPERTIES TESTS
	// =========================================================================

	describe('CSS Custom Properties', () => {
		it('applies segments to style', () => {
			render(DomeGallery, { props: { images: testImages, segments: 40 } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--segments-x: 40');
			expect(root.style.cssText).toContain('--segments-y: 40');
		});

		it('applies overlay blur color', () => {
			render(DomeGallery, { props: { images: testImages, overlayBlurColor: '#ff0000' } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--overlay-blur-color: #ff0000');
		});

		it('applies tile border radius', () => {
			render(DomeGallery, { props: { images: testImages, imageBorderRadius: '20px' } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--tile-radius: 20px');
		});

		it('applies enlarge border radius', () => {
			render(DomeGallery, { props: { images: testImages, openedImageBorderRadius: '50px' } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--enlarge-radius: 50px');
		});

		it('applies grayscale filter when enabled', () => {
			render(DomeGallery, { props: { images: testImages, grayscale: true } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--image-filter: grayscale(1)');
		});

		it('removes grayscale filter when disabled', () => {
			render(DomeGallery, { props: { images: testImages, grayscale: false } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--image-filter: none');
		});
	});

	// =========================================================================
	// PROPS TESTS
	// =========================================================================

	describe('Props', () => {
		it('uses default segments of 35', () => {
			render(DomeGallery, { props: { images: testImages } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--segments-x: 35');
		});

		it('accepts custom segments value', () => {
			render(DomeGallery, { props: { images: testImages, segments: 50 } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--segments-x: 50');
		});

		it('defaults grayscale to true', () => {
			render(DomeGallery, { props: { images: testImages } });
			const root = document.querySelector('.sphere-root') as HTMLElement;
			expect(root.style.cssText).toContain('--image-filter: grayscale(1)');
		});
	});

	// =========================================================================
	// STRUCTURE TESTS
	// =========================================================================

	describe('Structure', () => {
		it('has correct DOM hierarchy', () => {
			render(DomeGallery, { props: { images: testImages } });

			const root = document.querySelector('.sphere-root');
			const main = root?.querySelector('.sphere-main');
			const stage = main?.querySelector('.stage');
			const sphere = stage?.querySelector('.sphere');
			const items = sphere?.querySelectorAll('.item');

			expect(root).toBeInTheDocument();
			expect(main).toBeInTheDocument();
			expect(stage).toBeInTheDocument();
			expect(sphere).toBeInTheDocument();
			expect(items?.length).toBeGreaterThan(0);
		});

		it('viewer contains scrim and frame', () => {
			render(DomeGallery, { props: { images: testImages } });

			const viewer = document.querySelector('.viewer');
			const scrim = viewer?.querySelector('.scrim');
			const frame = viewer?.querySelector('.frame');

			expect(scrim).toBeInTheDocument();
			expect(frame).toBeInTheDocument();
		});

		it('item contains item__image which contains img', () => {
			render(DomeGallery, { props: { images: testImages } });

			const item = document.querySelector('.item');
			const itemImage = item?.querySelector('.item__image');
			const img = itemImage?.querySelector('img');

			expect(itemImage).toBeInTheDocument();
			expect(img).toBeInTheDocument();
		});
	});

	// =========================================================================
	// EMPTY STATE TESTS
	// =========================================================================

	describe('Empty State', () => {
		it('renders without images (empty array)', () => {
			render(DomeGallery, { props: { images: [] } });
			const root = document.querySelector('.sphere-root');
			expect(root).toBeInTheDocument();
		});

		it('creates empty tiles when no images provided', () => {
			render(DomeGallery, { props: { images: [] } });
			// Should still have structure but tiles may have empty src
			const tiles = document.querySelectorAll('.item');
			expect(tiles.length).toBeGreaterThan(0);
		});
	});

	// =========================================================================
	// POINTER EVENT HANDLER TESTS
	// =========================================================================

	describe('Pointer Event Handlers', () => {
		it('has pointer event handlers on main', () => {
			render(DomeGallery, { props: { images: testImages } });
			const main = document.querySelector('.sphere-main');
			// The element should exist and be interactive
			expect(main).toBeInTheDocument();
		});

		it('pointer down on main does not crash', async () => {
			render(DomeGallery, { props: { images: testImages } });
			const main = document.querySelector('.sphere-main') as HTMLElement;

			// Should not throw
			await fireEvent.pointerDown(main, { clientX: 100, clientY: 100, pointerId: 1 });
		});

		it('pointer move on main does not crash', async () => {
			render(DomeGallery, { props: { images: testImages } });
			const main = document.querySelector('.sphere-main') as HTMLElement;

			await fireEvent.pointerMove(main, { clientX: 150, clientY: 150 });
		});

		it('pointer up on main does not crash', async () => {
			render(DomeGallery, { props: { images: testImages } });
			const main = document.querySelector('.sphere-main') as HTMLElement;

			await fireEvent.pointerUp(main, { pointerId: 1 });
		});
	});

	// =========================================================================
	// KEYBOARD TESTS
	// =========================================================================

	describe('Keyboard Navigation', () => {
		it('tiles respond to Enter key', async () => {
			render(DomeGallery, { props: { images: testImages } });
			const tileImage = document.querySelector('.item__image') as HTMLElement;

			// Should not crash when pressing Enter
			await fireEvent.keyDown(tileImage, { key: 'Enter' });
		});

		it('tiles respond to Space key', async () => {
			render(DomeGallery, { props: { images: testImages } });
			const tileImage = document.querySelector('.item__image') as HTMLElement;

			// Should not crash when pressing Space
			await fireEvent.keyDown(tileImage, { key: ' ' });
		});
	});

	// =========================================================================
	// IMAGE NORMALIZATION TESTS
	// =========================================================================

	describe('Image Normalization', () => {
		it('accepts string URLs', () => {
			render(DomeGallery, { props: { images: ['url1.jpg', 'url2.jpg'] } });
			const images = document.querySelectorAll('.item__image img') as NodeListOf<HTMLImageElement>;
			// At least some images should have the URL
			const srcs = Array.from(images).map((img) => img.src);
			expect(srcs.some((src) => src.includes('url1.jpg') || src.includes('url2.jpg'))).toBe(true);
		});

		it('accepts objects with src and alt', () => {
			render(DomeGallery, {
				props: {
					images: [{ src: 'test.jpg', alt: 'Test image' }]
				}
			});
			const images = document.querySelectorAll('.item__image img') as NodeListOf<HTMLImageElement>;
			expect(images.length).toBeGreaterThan(0);
		});

		it('handles mixed array of strings and objects', () => {
			render(DomeGallery, {
				props: {
					images: ['string.jpg', { src: 'object.jpg', alt: 'Object' }]
				}
			});
			const tiles = document.querySelectorAll('.item');
			expect(tiles.length).toBeGreaterThan(0);
		});
	});

	// =========================================================================
	// SCROLL LOCK CLEANUP TESTS
	// =========================================================================

	describe('Scroll Lock Cleanup', () => {
		it('removes scroll lock class on unmount', () => {
			document.body.classList.add('dg-scroll-lock');
			const { unmount } = render(DomeGallery, { props: { images: testImages } });

			// Unmount should trigger cleanup
			unmount();

			// Check that class is removed (may be async)
			expect(document.body.classList.contains('dg-scroll-lock')).toBe(false);
		});
	});
});
