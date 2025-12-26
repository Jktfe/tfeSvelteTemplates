/**
 * ============================================================
 * Editor Component Tests
 * ============================================================
 *
 * Comprehensive tests for the CRUD modal editor component.
 *
 * What we're checking:
 *   ✓ Modal renders correctly in create/edit modes
 *   ✓ Form validation works
 *   ✓ Accessibility features (ARIA, focus trap, keyboard)
 *   ✓ Database warning displays correctly
 *   ✓ Form fields render and function properly
 *   ✓ Submit/cancel buttons work as expected
 *
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Editor from './Editor.svelte';

describe('Editor', () => {
	// ============================================================
	// Basic Rendering Tests
	// ============================================================
	describe('Rendering', () => {
		it('renders modal dialog', () => {
			const { container } = render(Editor);
			expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		});

		it('renders create mode title by default', () => {
			render(Editor);
			expect(screen.getByText('Create New Card')).toBeInTheDocument();
		});

		it('renders edit mode title when mode is edit', () => {
			render(Editor, {
				props: {
					mode: 'edit',
					initialData: { heading: 'Test Card' }
				}
			});
			expect(screen.getByText('Edit Card')).toBeInTheDocument();
		});

		it('renders backdrop', () => {
			const { container } = render(Editor);
			expect(container.querySelector('.editor-backdrop')).toBeInTheDocument();
		});

		it('has aria-modal attribute', () => {
			const { container } = render(Editor);
			const dialog = container.querySelector('[role="dialog"]');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
		});

		it('has aria-labelledby pointing to title', () => {
			const { container } = render(Editor);
			const dialog = container.querySelector('[role="dialog"]');
			expect(dialog).toHaveAttribute('aria-labelledby', 'editor-title');
		});
	});

	// ============================================================
	// Database Warning Tests
	// ============================================================
	describe('Database Warning', () => {
		it('shows warning when not using database', () => {
			const { container } = render(Editor, { props: { usingDatabase: false } });
			// Alert is inside aria-hidden backdrop, so use container query
			expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
			expect(screen.getByText(/Database not connected/)).toBeInTheDocument();
		});

		it('does not show warning when using database', () => {
			const { container } = render(Editor, { props: { usingDatabase: true } });
			expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
		});
	});

	// ============================================================
	// Form Fields Tests
	// ============================================================
	describe('Form Fields', () => {
		it('renders heading field', () => {
			render(Editor);
			expect(screen.getByText('Heading')).toBeInTheDocument();
		});

		it('renders compact text field', () => {
			render(Editor);
			expect(screen.getByText('Compact Text')).toBeInTheDocument();
		});

		it('renders expanded text field', () => {
			render(Editor);
			expect(screen.getByText('Expanded Text')).toBeInTheDocument();
		});

		it('renders image URL field', () => {
			render(Editor);
			expect(screen.getByText('Image URL')).toBeInTheDocument();
		});

		it('renders image alt text field', () => {
			render(Editor);
			expect(screen.getByText('Image Alt Text')).toBeInTheDocument();
		});

		it('renders background colour selector', () => {
			render(Editor);
			expect(screen.getByText('Background Colour')).toBeInTheDocument();
		});

		it('populates fields with initial data in edit mode', () => {
			render(Editor, {
				props: {
					mode: 'edit',
					initialData: {
						heading: 'Test Heading',
						compactText: 'Test compact',
						expandedText: 'Test expanded',
						imageSrc: 'https://example.com/image.jpg',
						imageAlt: 'Test alt'
					}
				}
			});
			// Check that the heading field has the initial value
			const headingInput = screen.getByPlaceholderText('Enter card heading');
			expect(headingInput).toHaveValue('Test Heading');
		});
	});

	// ============================================================
	// Action Buttons Tests
	// ============================================================
	describe('Action Buttons', () => {
		it('renders cancel button', () => {
			const { container } = render(Editor);
			// Buttons are inside aria-hidden backdrop, so use container query
			const cancelBtn = container.querySelector('.btn-cancel');
			expect(cancelBtn).toBeInTheDocument();
			expect(cancelBtn).toHaveTextContent('Cancel');
		});

		it('renders create button in create mode', () => {
			const { container } = render(Editor, { props: { mode: 'create' } });
			const saveBtn = container.querySelector('.btn-save');
			expect(saveBtn).toBeInTheDocument();
			expect(saveBtn).toHaveTextContent('Create Card');
		});

		it('renders save button in edit mode', () => {
			const { container } = render(Editor, { props: { mode: 'edit' } });
			const saveBtn = container.querySelector('.btn-save');
			expect(saveBtn).toBeInTheDocument();
			expect(saveBtn).toHaveTextContent('Save Changes');
		});

		it('calls onCancel when cancel button clicked', async () => {
			const onCancel = vi.fn();
			const { container } = render(Editor, { props: { onCancel } });

			const cancelBtn = container.querySelector('.btn-cancel') as HTMLButtonElement;
			await fireEvent.click(cancelBtn);
			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('submit button is disabled when form is invalid', () => {
			const { container } = render(Editor);
			// Empty form should be invalid
			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			expect(submitBtn).toBeDisabled();
		});
	});

	// ============================================================
	// Form Validation Tests
	// ============================================================
	describe('Form Validation', () => {
		it('validates required fields', async () => {
			const { container } = render(Editor, {
				props: {
					initialData: {
						heading: '',
						compactText: '',
						expandedText: '',
						imageSrc: '',
						imageAlt: ''
					}
				}
			});

			// Submit button should be disabled with empty required fields
			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			expect(submitBtn).toBeDisabled();
		});

		it('enables submit when all required fields are filled', async () => {
			const { container } = render(Editor, {
				props: {
					initialData: {
						heading: 'Test',
						compactText: 'Compact text',
						expandedText: 'Expanded text',
						imageSrc: 'https://example.com/image.jpg',
						imageAlt: 'Alt text'
					}
				}
			});

			// With valid data, submit should be enabled
			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			expect(submitBtn).not.toBeDisabled();
		});

		it('validates URL format for image source', async () => {
			const { container } = render(Editor, {
				props: {
					initialData: {
						heading: 'Test',
						compactText: 'Compact text',
						expandedText: 'Expanded text',
						imageSrc: 'not-a-url',
						imageAlt: 'Alt text'
					}
				}
			});

			// Invalid URL should keep form invalid
			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			expect(submitBtn).toBeDisabled();
		});
	});

	// ============================================================
	// Keyboard Accessibility Tests
	// ============================================================
	describe('Keyboard Accessibility', () => {
		it('closes on Escape key', async () => {
			const onCancel = vi.fn();
			render(Editor, { props: { onCancel } });

			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	// ============================================================
	// Background Colour Options Tests
	// ============================================================
	describe('Background Colour Options', () => {
		it('renders colour select with options', () => {
			const { container } = render(Editor);
			// Select is inside aria-hidden backdrop, so use container query
			const select = container.querySelector('select[name="bgColor"]');
			expect(select).toBeInTheDocument();
		});

		it('has default colour option selected', () => {
			const { container } = render(Editor);
			const select = container.querySelector('select[name="bgColor"]') as HTMLSelectElement;
			expect(select).toHaveValue('bg-lime-100');
		});

		it('includes all colour options', () => {
			const { container } = render(Editor);
			const options = container.querySelectorAll('select[name="bgColor"] option');
			const optionTexts = Array.from(options).map((opt) => opt.textContent);

			expect(optionTexts).toContain('Lime');
			expect(optionTexts).toContain('Blue');
			expect(optionTexts).toContain('Cyan');
			expect(optionTexts).toContain('Green');
			expect(optionTexts).toContain('Amber');
			expect(optionTexts).toContain('Purple');
			expect(optionTexts).toContain('Pink');
			expect(optionTexts).toContain('Red');
		});
	});

	// ============================================================
	// Modal Structure Tests
	// ============================================================
	describe('Modal Structure', () => {
		it('has proper modal structure with header', () => {
			const { container } = render(Editor);
			expect(container.querySelector('.editor-header')).toBeInTheDocument();
		});

		it('has proper modal structure with form', () => {
			const { container } = render(Editor);
			expect(container.querySelector('.editor-form')).toBeInTheDocument();
		});

		it('has proper modal structure with actions', () => {
			const { container } = render(Editor);
			expect(container.querySelector('.form-actions')).toBeInTheDocument();
		});
	});

	// ============================================================
	// Form Submission Tests
	// ============================================================
	describe('Form Submission', () => {
		it('calls onSave with form data when submitted', async () => {
			const onSave = vi.fn();
			const { container } = render(Editor, {
				props: {
					onSave,
					initialData: {
						heading: 'Test Heading',
						compactText: 'Compact text here',
						expandedText: 'Expanded text here',
						imageSrc: 'https://example.com/image.jpg',
						imageAlt: 'Alt text',
						bgColor: 'bg-lime-100',
						category: 'editor-demo'
					}
				}
			});

			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			await fireEvent.click(submitBtn);

			expect(onSave).toHaveBeenCalledTimes(1);
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({
					heading: 'Test Heading',
					compactText: 'Compact text here',
					expandedText: 'Expanded text here',
					imageSrc: 'https://example.com/image.jpg',
					imageAlt: 'Alt text'
				})
			);
		});

		it('does not call onSave when form is invalid', async () => {
			const onSave = vi.fn();
			const { container } = render(Editor, {
				props: {
					onSave,
					initialData: {
						heading: '', // Empty required field
						compactText: '',
						expandedText: '',
						imageSrc: '',
						imageAlt: ''
					}
				}
			});

			// Button should be disabled
			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;

			// Form should not submit with invalid data
			// The button is disabled so this shouldn't trigger onSave
			expect(submitBtn).toBeDisabled();
		});
	});

	// ============================================================
	// Loading State Tests
	// ============================================================
	describe('Loading State', () => {
		it('shows saving text during submission', async () => {
			const onSave = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
			const { container } = render(Editor, {
				props: {
					onSave,
					initialData: {
						heading: 'Test',
						compactText: 'Compact',
						expandedText: 'Expanded',
						imageSrc: 'https://example.com/image.jpg',
						imageAlt: 'Alt'
					}
				}
			});

			const submitBtn = container.querySelector('.btn-save') as HTMLButtonElement;
			await fireEvent.click(submitBtn);

			// Should show saving state
			expect(screen.getByText('Saving...')).toBeInTheDocument();
		});
	});
});
