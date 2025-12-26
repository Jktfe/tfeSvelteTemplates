/**
 * ============================================================
 * BeforeAfter Tests
 * ============================================================
 *
 * These tests verify that the BeforeAfter component works correctly.
 * We're checking:
 *   - It renders without crashing
 *   - Images display with correct sources and alt text
 *   - Divider handle renders with correct position
 *   - Optional labels appear when provided
 *   - Accessibility attributes are correct
 *   - Custom styling props apply correctly
 *   - Keyboard navigation works (arrow keys)
 *
 * Note: Pointer capture tests are limited in jsdom environment.
 * Real drag interactions should be tested with e2e tools.
 *
 * Run: bun run test BeforeAfter
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import BeforeAfter from './BeforeAfter.svelte';

// Sample image URLs for testing
const testProps = {
	beforeImage: 'https://example.com/before.jpg',
	afterImage: 'https://example.com/after.jpg'
};

describe('BeforeAfter', () => {
	// =========================================================================
	// RENDERING TESTS
	// =========================================================================

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(BeforeAfter, { props: testProps });
			// If we get here without errors, the component rendered
		});

		it('renders the container element', () => {
			render(BeforeAfter, { props: testProps });
			const container = document.querySelector('.before-after-container');
			expect(container).toBeInTheDocument();
		});

		it('renders both before and after panels', () => {
			render(BeforeAfter, { props: testProps });
			const beforePanel = document.querySelector('.before-panel');
			const afterPanel = document.querySelector('.after-panel');
			expect(beforePanel).toBeInTheDocument();
			expect(afterPanel).toBeInTheDocument();
		});

		it('renders the divider handle', () => {
			render(BeforeAfter, { props: testProps });
			const handle = document.querySelector('.divider-handle');
			expect(handle).toBeInTheDocument();
		});

		it('renders the circular handle with arrow icon', () => {
			render(BeforeAfter, { props: testProps });
			const handle = document.querySelector('.handle');
			const svg = handle?.querySelector('svg');
			expect(handle).toBeInTheDocument();
			expect(svg).toBeInTheDocument();
		});
	});

	// =========================================================================
	// IMAGE TESTS
	// =========================================================================

	describe('Images', () => {
		it('renders before image with correct src', () => {
			render(BeforeAfter, { props: testProps });
			const images = document.querySelectorAll('.comparison-image');
			const beforeImg = images[0] as HTMLImageElement;
			expect(beforeImg.src).toBe(testProps.beforeImage);
		});

		it('renders after image with correct src', () => {
			render(BeforeAfter, { props: testProps });
			const images = document.querySelectorAll('.comparison-image');
			const afterImg = images[1] as HTMLImageElement;
			expect(afterImg.src).toBe(testProps.afterImage);
		});

		it('renders default alt text for before image', () => {
			render(BeforeAfter, { props: testProps });
			const beforeImg = screen.getByAltText('Before');
			expect(beforeImg).toBeInTheDocument();
		});

		it('renders default alt text for after image', () => {
			render(BeforeAfter, { props: testProps });
			const afterImg = screen.getByAltText('After');
			expect(afterImg).toBeInTheDocument();
		});

		it('renders custom alt text when provided', () => {
			render(BeforeAfter, {
				props: {
					...testProps,
					beforeAlt: 'Old version',
					afterAlt: 'New version'
				}
			});
			expect(screen.getByAltText('Old version')).toBeInTheDocument();
			expect(screen.getByAltText('New version')).toBeInTheDocument();
		});
	});

	// =========================================================================
	// LABEL TESTS
	// =========================================================================

	describe('Labels', () => {
		it('does not render labels by default', () => {
			render(BeforeAfter, { props: testProps });
			const labels = document.querySelectorAll('.panel-label');
			expect(labels.length).toBe(0);
		});

		it('renders before label when provided', () => {
			render(BeforeAfter, {
				props: { ...testProps, beforeLabel: 'Before' }
			});
			expect(screen.getByText('Before')).toBeInTheDocument();
		});

		it('renders after label when provided', () => {
			render(BeforeAfter, {
				props: { ...testProps, afterLabel: 'After' }
			});
			expect(screen.getByText('After')).toBeInTheDocument();
		});

		it('renders both labels when both provided', () => {
			render(BeforeAfter, {
				props: { ...testProps, beforeLabel: 'Original', afterLabel: 'Edited' }
			});
			expect(screen.getByText('Original')).toBeInTheDocument();
			expect(screen.getByText('Edited')).toBeInTheDocument();
		});

		it('positions before label on the left', () => {
			render(BeforeAfter, {
				props: { ...testProps, beforeLabel: 'Before' }
			});
			const label = document.querySelector('.before-label');
			expect(label).toBeInTheDocument();
		});

		it('positions after label on the right', () => {
			render(BeforeAfter, {
				props: { ...testProps, afterLabel: 'After' }
			});
			const label = document.querySelector('.after-label');
			expect(label).toBeInTheDocument();
		});
	});

	// =========================================================================
	// DIVIDER POSITION TESTS
	// =========================================================================

	describe('Divider Position', () => {
		it('starts at 50% by default', () => {
			render(BeforeAfter, { props: testProps });
			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('50%');
		});

		it('respects custom initial position', () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 30 }
			});
			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('30%');
		});

		it('applies clip-path to before panel', () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 60 }
			});
			const beforePanel = document.querySelector('.before-panel') as HTMLElement;
			// At 60%, before should clip 40% from right: inset(0 40% 0 0)
			expect(beforePanel.style.clipPath).toBe('inset(0 40% 0 0)');
		});

		it('applies clip-path to after panel', () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 60 }
			});
			const afterPanel = document.querySelector('.after-panel') as HTMLElement;
			// At 60%, after should clip 60% from left: inset(0 0 0 60%)
			expect(afterPanel.style.clipPath).toBe('inset(0 0 0 60%)');
		});
	});

	// =========================================================================
	// STYLING PROPS TESTS
	// =========================================================================

	describe('Styling Props', () => {
		it('applies default aspect ratio', () => {
			render(BeforeAfter, { props: testProps });
			const container = document.querySelector('.before-after-container') as HTMLElement;
			expect(container.style.aspectRatio).toBe('16/9');
		});

		it('applies custom aspect ratio', () => {
			render(BeforeAfter, {
				props: { ...testProps, aspectRatio: '4/3' }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;
			expect(container.style.aspectRatio).toBe('4/3');
		});

		it('applies default width', () => {
			render(BeforeAfter, { props: testProps });
			const container = document.querySelector('.before-after-container') as HTMLElement;
			expect(container.style.width).toBe('100%');
		});

		it('applies custom width', () => {
			render(BeforeAfter, {
				props: { ...testProps, width: '500px' }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;
			expect(container.style.width).toBe('500px');
		});

		it('applies divider color via CSS custom property', () => {
			render(BeforeAfter, {
				props: { ...testProps, dividerColor: '#ff0000' }
			});
			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.getPropertyValue('--divider-color')).toBe('#ff0000');
		});

		it('applies divider width via CSS custom property', () => {
			render(BeforeAfter, {
				props: { ...testProps, dividerWidth: 4 }
			});
			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.getPropertyValue('--divider-width')).toBe('4px');
		});

		it('applies handle size', () => {
			render(BeforeAfter, {
				props: { ...testProps, handleSize: 60 }
			});
			const handle = document.querySelector('.handle') as HTMLElement;
			expect(handle.style.width).toBe('60px');
			expect(handle.style.height).toBe('60px');
		});

		it('applies handle color', () => {
			render(BeforeAfter, {
				props: { ...testProps, handleColor: '#333333' }
			});
			const handle = document.querySelector('.handle') as HTMLElement;
			expect(handle.style.background).toBe('rgb(51, 51, 51)');
		});

		it('applies custom class name', () => {
			render(BeforeAfter, {
				props: { ...testProps, class: 'my-custom-class' }
			});
			const container = document.querySelector('.before-after-container');
			expect(container).toHaveClass('my-custom-class');
		});
	});

	// =========================================================================
	// ACCESSIBILITY TESTS
	// =========================================================================

	describe('Accessibility', () => {
		it('container has role="application"', () => {
			render(BeforeAfter, { props: testProps });
			const container = screen.getByRole('application');
			expect(container).toBeInTheDocument();
		});

		it('container has aria-label', () => {
			render(BeforeAfter, { props: testProps });
			const container = screen.getByRole('application');
			expect(container).toHaveAttribute(
				'aria-label',
				'Before and after comparison. Use arrow keys or drag to compare.'
			);
		});

		it('container is focusable with tabindex', () => {
			render(BeforeAfter, { props: testProps });
			const container = document.querySelector('.before-after-container');
			expect(container).toHaveAttribute('tabindex', '0');
		});

		it('divider has role="separator"', () => {
			render(BeforeAfter, { props: testProps });
			const separator = screen.getByRole('separator');
			expect(separator).toBeInTheDocument();
		});

		it('divider has aria-valuenow', () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 75 }
			});
			const separator = screen.getByRole('separator');
			expect(separator).toHaveAttribute('aria-valuenow', '75');
		});

		it('divider has aria-valuemin and aria-valuemax', () => {
			render(BeforeAfter, { props: testProps });
			const separator = screen.getByRole('separator');
			expect(separator).toHaveAttribute('aria-valuemin', '0');
			expect(separator).toHaveAttribute('aria-valuemax', '100');
		});

		it('divider has descriptive aria-label', () => {
			render(BeforeAfter, { props: testProps });
			const separator = screen.getByRole('separator');
			expect(separator).toHaveAttribute('aria-label', 'Draggable divider. Position: 50%');
		});
	});

	// =========================================================================
	// KEYBOARD NAVIGATION TESTS
	// =========================================================================

	describe('Keyboard Navigation', () => {
		it('decreases position on ArrowLeft', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 50 }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowLeft' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('49%');
		});

		it('increases position on ArrowRight', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 50 }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowRight' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('51%');
		});

		it('does not go below 0%', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 0 }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowLeft' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('0%');
		});

		it('does not go above 100%', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 100 }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowRight' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('100%');
		});

		it('ignores other keys', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 50 }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'Enter' });
			await fireEvent.keyDown(container, { key: ' ' });
			await fireEvent.keyDown(container, { key: 'a' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('50%');
		});
	});

	// =========================================================================
	// DISABLED STATE TESTS
	// =========================================================================

	describe('Disabled State', () => {
		it('ignores keyboard navigation when disabled', async () => {
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 50, disabled: true }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowLeft' });
			await fireEvent.keyDown(container, { key: 'ArrowRight' });

			const handle = document.querySelector('.divider-handle') as HTMLElement;
			expect(handle.style.left).toBe('50%');
		});
	});

	// =========================================================================
	// CALLBACK TESTS
	// =========================================================================

	describe('onChange Callback', () => {
		it('calls onChange when position changes via keyboard', async () => {
			const onChange = vi.fn();
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 50, onChange }
			});
			const container = document.querySelector('.before-after-container') as HTMLElement;

			await fireEvent.keyDown(container, { key: 'ArrowLeft' });

			// Called on mount (50) and on key press (49)
			expect(onChange).toHaveBeenCalledWith(49);
		});

		it('calls onChange with initial position on mount', () => {
			const onChange = vi.fn();
			render(BeforeAfter, {
				props: { ...testProps, initialPosition: 75, onChange }
			});

			expect(onChange).toHaveBeenCalledWith(75);
		});
	});

	// =========================================================================
	// STRUCTURE TESTS
	// =========================================================================

	describe('Structure', () => {
		it('has correct DOM hierarchy', () => {
			render(BeforeAfter, { props: testProps });

			const container = document.querySelector('.before-after-container');
			const beforePanel = container?.querySelector('.before-panel');
			const afterPanel = container?.querySelector('.after-panel');
			const dividerHandle = container?.querySelector('.divider-handle');
			const handle = dividerHandle?.querySelector('.handle');

			expect(container).toBeInTheDocument();
			expect(beforePanel).toBeInTheDocument();
			expect(afterPanel).toBeInTheDocument();
			expect(dividerHandle).toBeInTheDocument();
			expect(handle).toBeInTheDocument();
		});

		it('before panel contains image', () => {
			render(BeforeAfter, { props: testProps });
			const beforePanel = document.querySelector('.before-panel');
			const img = beforePanel?.querySelector('img');
			expect(img).toBeInTheDocument();
		});

		it('after panel contains image', () => {
			render(BeforeAfter, { props: testProps });
			const afterPanel = document.querySelector('.after-panel');
			const img = afterPanel?.querySelector('img');
			expect(img).toBeInTheDocument();
		});

		it('handle contains SVG arrow icon', () => {
			render(BeforeAfter, { props: testProps });
			const handle = document.querySelector('.handle');
			const svg = handle?.querySelector('svg');
			const paths = svg?.querySelectorAll('path');
			expect(paths?.length).toBe(2); // Two arrow paths
		});
	});
});
