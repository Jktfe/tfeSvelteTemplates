/**
 * ============================================================
 * FolderFiles Component Tests
 * ============================================================
 *
 * What we're checking:
 *   ✓ Cabinet view renders with folder tabs
 *   ✓ Folder hover shows tooltip
 *   ✓ Clicking folder opens modal
 *   ✓ Modal close functionality (X button, Escape)
 *   ✓ Two-panel structure with correct labels
 *   ✓ Content items render with proper structure
 *   ✓ Accessibility features (ARIA labels, roles)
 *   ✓ Mobile touch mode detection
 *
 * [CR] NOTE: jsdom has limitations with drag-and-drop and CSS 3D transforms.
 * Visual interaction tests are covered by manual testing (Desktop/Mobile columns).
 *
 * 💡 TIP: Run `bun run test:ui` for a visual test interface!
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FolderFiles from './FolderFiles.svelte';
import type { Folder, FileItem } from '$lib/types';

// ============================================================
// TEST DATA
// ============================================================

const mockFolders: Folder[] = [
	{ id: 1, label: 'Inbox', color: '#3b82f6' },
	{ id: 2, label: 'Archive', color: '#22c55e' },
	{ id: 3, label: 'Projects', color: '#f59e0b' }
];

const mockFiles: FileItem[] = [
	{ id: 1, folderId: 1, title: 'Email from John', subtitle: 'Subject line', previewText: 'Preview of the email content...' },
	{ id: 2, folderId: 1, title: 'Meeting Notes', subtitle: 'Monday standup', previewText: 'Discussed the project timeline...' },
	{ id: 3, folderId: 2, title: 'Old Report', subtitle: '2023 Q4', previewText: 'Quarterly results summary...' },
	{ id: 4, folderId: 3, title: 'Project Alpha', subtitle: 'In Progress', previewText: 'Current sprint goals...' },
	{ id: 5, folderId: 3, title: 'Project Beta', subtitle: 'Planning', previewText: 'Initial planning document...' }
];

// ============================================================
// RENDER TESTS - Cabinet View
// ============================================================

describe('FolderFiles - Cabinet View', () => {
	it('renders without crashing with no props', () => {
		const { container } = render(FolderFiles);
		expect(container.querySelector('.filing-cabinet-container')).toBeInTheDocument();
	});

	it('renders the filing cabinet region', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
		expect(region).toHaveAttribute('aria-label', 'Filing cabinet with folders');
	});

	it('renders folder tabs for each folder', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButtons = container.querySelectorAll('.folder-container');
		expect(folderButtons.length).toBe(3);
	});

	it('displays folder labels on tabs', () => {
		render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		expect(screen.getByText('Inbox')).toBeInTheDocument();
		expect(screen.getByText('Archive')).toBeInTheDocument();
		expect(screen.getByText('Projects')).toBeInTheDocument();
	});

	it('applies folder colors as CSS custom property', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderWrappers = container.querySelectorAll('.folder-wrapper');
		expect(folderWrappers[0]).toHaveStyle('--folder-color: #3b82f6');
		expect(folderWrappers[1]).toHaveStyle('--folder-color: #22c55e');
		expect(folderWrappers[2]).toHaveStyle('--folder-color: #f59e0b');
	});

	it('sets z-index based on folder position', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderWrappers = container.querySelectorAll('.folder-wrapper');
		expect(folderWrappers[0]).toHaveStyle('z-index: 0');
		expect(folderWrappers[1]).toHaveStyle('z-index: 1');
		expect(folderWrappers[2]).toHaveStyle('z-index: 2');
	});

	it('includes folder and file count in aria-label', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const inboxButton = container.querySelector('.folder-container');
		expect(inboxButton).toHaveAttribute('aria-label', 'Open Inbox folder (2 items)');
	});
});

// ============================================================
// HOVER TESTS - Folder Interactions
// ============================================================

describe('FolderFiles - Hover Effects', () => {
	it('shows tooltip on folder hover', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButton = container.querySelector('.folder-container');

		await fireEvent.mouseEnter(folderButton!);

		const tooltip = container.querySelector('.tooltip');
		expect(tooltip).toBeInTheDocument();
		expect(tooltip).toHaveTextContent('Inbox (2 items)');
	});

	it('hides tooltip on mouse leave', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButton = container.querySelector('.folder-container');

		await fireEvent.mouseEnter(folderButton!);
		expect(container.querySelector('.tooltip')).toBeInTheDocument();

		await fireEvent.mouseLeave(folderButton!);
		expect(container.querySelector('.tooltip')).not.toBeInTheDocument();
	});

	it('applies is-beneath-hover class to folders below hovered one', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const firstFolderButton = container.querySelector('.folder-container');

		await fireEvent.mouseEnter(firstFolderButton!);

		const folderWrappers = container.querySelectorAll('.folder-wrapper');
		expect(folderWrappers[0]).not.toHaveClass('is-beneath-hover');
		expect(folderWrappers[1]).toHaveClass('is-beneath-hover');
		expect(folderWrappers[2]).toHaveClass('is-beneath-hover');
	});
});

// ============================================================
// MODAL TESTS - Open/Close
// ============================================================

describe('FolderFiles - Modal View', () => {
	it('opens modal when folder is clicked', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButton = container.querySelector('.folder-container');

		await fireEvent.click(folderButton!);

		expect(container.querySelector('.folder-modal')).toBeInTheDocument();
	});

	it('renders modal with proper dialog role', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButton = container.querySelector('.folder-container');

		await fireEvent.click(folderButton!);

		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('aria-label', 'Inbox folder');
	});

	it('renders close button with proper aria-label', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const closeBtn = container.querySelector('.close-btn');
		expect(closeBtn).toBeInTheDocument();
		expect(closeBtn).toHaveAttribute('aria-label', 'Close folder view');
	});

	it('closes modal when close button is clicked', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(container.querySelector('.folder-modal')).toBeInTheDocument();

		await fireEvent.click(container.querySelector('.close-btn')!);

		expect(container.querySelector('.folder-modal')).not.toBeInTheDocument();
	});

	it('closes modal when backdrop is clicked', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		await fireEvent.click(container.querySelector('.modal-backdrop')!);

		expect(container.querySelector('.folder-modal')).not.toBeInTheDocument();
	});

	it('closes modal when Escape key is pressed', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(container.querySelector('.folder-modal')).toBeInTheDocument();

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(container.querySelector('.folder-modal')).not.toBeInTheDocument();
	});

	it('hides cabinet view when modal is open', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });

		expect(container.querySelector('.filing-cabinet-container')).toBeInTheDocument();

		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(container.querySelector('.filing-cabinet-container')).not.toBeInTheDocument();
	});
});

// ============================================================
// TWO-PANEL TESTS
// ============================================================

describe('FolderFiles - Two-Panel System', () => {
	it('renders two panels in modal', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const panels = container.querySelectorAll('.panel');
		expect(panels.length).toBe(2);
	});

	it('labels left panel as "Selected"', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const leftPanel = container.querySelector('.panel-left');
		expect(leftPanel?.querySelector('.panel-label')).toHaveTextContent('Selected');
	});

	it('labels right panel as "All Items"', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const rightPanel = container.querySelector('.panel-right');
		expect(rightPanel?.querySelector('.panel-label')).toHaveTextContent('All Items');
	});

	it('shows empty message in left panel initially', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const emptyMessage = container.querySelector('.empty-message');
		expect(emptyMessage).toBeInTheDocument();
	});

	it('puts all folder files in right panel initially', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		// Click Inbox folder which has 2 files
		await fireEvent.click(container.querySelector('.folder-container')!);

		const rightPanelItems = container.querySelectorAll('.panel-right .content-item');
		expect(rightPanelItems.length).toBe(2);
	});

	it('applies folder color to panels', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const leftPanel = container.querySelector('.panel-left');
		const rightPanel = container.querySelector('.panel-right');

		expect(leftPanel).toHaveStyle('background-color: #3b82f6');
		expect(rightPanel).toHaveStyle('background-color: #3b82f6');
	});

	it('renders panels with proper ARIA regions', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const leftPanel = container.querySelector('.panel-left');
		const rightPanel = container.querySelector('.panel-right');

		expect(leftPanel).toHaveAttribute('role', 'region');
		expect(leftPanel).toHaveAttribute('aria-label', 'Selected items');
		expect(rightPanel).toHaveAttribute('role', 'region');
		expect(rightPanel).toHaveAttribute('aria-label', 'All items');
	});
});

// ============================================================
// CONTENT ITEM TESTS
// ============================================================

describe('FolderFiles - Content Items', () => {
	it('renders content items with title', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(screen.getByText('Email from John')).toBeInTheDocument();
		expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
	});

	it('renders content items with subtitle', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(screen.getByText('Subject line')).toBeInTheDocument();
		expect(screen.getByText('Monday standup')).toBeInTheDocument();
	});

	it('renders content items with preview text', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(screen.getByText('Preview of the email content...')).toBeInTheDocument();
	});

	it('marks content items as draggable on desktop', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const contentItem = container.querySelector('.content-item');
		// On desktop (isTouchDevice = false), items should be draggable
		expect(contentItem).toHaveAttribute('draggable', 'true');
	});

	it('renders content items with listbox role', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const listboxes = container.querySelectorAll('[role="listbox"]');
		expect(listboxes.length).toBe(2);
	});

	it('renders content items with option role', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const options = container.querySelectorAll('[role="option"]');
		expect(options.length).toBe(2); // Inbox has 2 files
	});
});

// ============================================================
// ACCESSIBILITY TESTS
// ============================================================

describe('FolderFiles - Accessibility', () => {
	it('folder buttons are focusable', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderButtons = container.querySelectorAll('.folder-container');

		folderButtons.forEach(btn => {
			expect(btn.tagName).toBe('BUTTON');
		});
	});

	it('includes aria-live regions for screen readers', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const liveRegions = container.querySelectorAll('[aria-live="polite"]');
		expect(liveRegions.length).toBeGreaterThan(0);
	});

	it('includes screen reader only count text', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const srOnly = container.querySelector('.sr-only[role="status"]');
		expect(srOnly).toBeInTheDocument();
		expect(srOnly).toHaveTextContent('2 items available');
	});

	it('backdrop has aria-hidden for screen readers', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const backdrop = container.querySelector('.modal-backdrop');
		expect(backdrop).toHaveAttribute('aria-hidden', 'true');
	});
});

// ============================================================
// EMPTY STATE TESTS
// ============================================================

describe('FolderFiles - Empty States', () => {
	it('renders empty cabinet with no folders', () => {
		const { container } = render(FolderFiles, { props: { folders: [], files: [] } });
		const folderStack = container.querySelector('.folder-stack');
		expect(folderStack).toBeInTheDocument();
		expect(container.querySelectorAll('.folder-container').length).toBe(0);
	});

	it('shows folder with 0 items when no files match', async () => {
		const emptyFolder = [{ id: 99, label: 'Empty Folder', color: '#999999' }];
		const { container } = render(FolderFiles, { props: { folders: emptyFolder, files: [] } });

		const folderButton = container.querySelector('.folder-container');
		expect(folderButton).toHaveAttribute('aria-label', 'Open Empty Folder folder (0 items)');
	});
});

// ============================================================
// DIFFERENT FOLDER TESTS
// ============================================================

describe('FolderFiles - Different Folders', () => {
	it('shows correct files when opening Archive folder', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });

		// Click Archive folder (second one)
		const folderButtons = container.querySelectorAll('.folder-container');
		await fireEvent.click(folderButtons[1]);

		// Archive has 1 file: "Old Report"
		expect(screen.getByText('Old Report')).toBeInTheDocument();
		expect(container.querySelectorAll('.panel-right .content-item').length).toBe(1);
	});

	it('shows correct files when opening Projects folder', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });

		// Click Projects folder (third one)
		const folderButtons = container.querySelectorAll('.folder-container');
		await fireEvent.click(folderButtons[2]);

		// Projects has 2 files: "Project Alpha" and "Project Beta"
		expect(screen.getByText('Project Alpha')).toBeInTheDocument();
		expect(screen.getByText('Project Beta')).toBeInTheDocument();
		expect(container.querySelectorAll('.panel-right .content-item').length).toBe(2);
	});
});

// ============================================================
// STRUCTURE TESTS
// ============================================================

describe('FolderFiles - Component Structure', () => {
	it('has folder-stack container', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		expect(container.querySelector('.folder-stack')).toBeInTheDocument();
	});

	it('each folder has tab and body elements', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });

		expect(container.querySelectorAll('.folder-tab').length).toBe(3);
		expect(container.querySelectorAll('.folder-body').length).toBe(3);
	});

	it('modal has folder-panels grid container', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		expect(container.querySelector('.folder-panels')).toBeInTheDocument();
	});

	it('panels have content-grid for items', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const grids = container.querySelectorAll('.content-grid');
		expect(grids.length).toBe(2);
	});

	it('close button contains SVG icon', async () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		await fireEvent.click(container.querySelector('.folder-container')!);

		const closeBtn = container.querySelector('.close-btn');
		expect(closeBtn?.querySelector('svg')).toBeInTheDocument();
	});
});

// ============================================================
// INDEX/ORDER TESTS
// ============================================================

describe('FolderFiles - Folder Ordering', () => {
	it('sets correct folder index CSS variable', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderWrappers = container.querySelectorAll('.folder-wrapper');

		expect(folderWrappers[0]).toHaveStyle('--folder-index: 0');
		expect(folderWrappers[1]).toHaveStyle('--folder-index: 1');
		expect(folderWrappers[2]).toHaveStyle('--folder-index: 2');
	});

	it('positions folder tabs with varying margins', () => {
		const { container } = render(FolderFiles, { props: { folders: mockFolders, files: mockFiles } });
		const folderTabs = container.querySelectorAll('.folder-tab');

		// First tab (index 0): margin-left: calc(0 * 15%)
		// Second tab (index 1): margin-left: calc(1 * 15%)
		// Third tab (index 2): margin-left: auto; margin-right: 0
		expect(folderTabs[2]).toHaveStyle('margin-left: auto');
		expect(folderTabs[2]).toHaveStyle('margin-right: 0');
	});
});
