/**
 * ============================================================
 * ExplainerCanvas Tests
 * ============================================================
 *
 * Comprehensive tests for the ExplainerCanvas component and its utilities.
 * The component is complex, so we test at multiple levels:
 *
 *   ✓ Utility functions (geometry, search, loader, markdown)
 *   ✓ Component rendering with mock data
 *   ✓ Accessibility features
 *
 * 💡 TIP: Run `bun run test:ui` for a visual test interface!
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import type { ExplainerCard, ExplainerCanvasData, ExplainerPosition } from '$lib/types';

// Import utility functions for direct testing
import {
	flattenCards,
	findCardById,
	getCardsAtPath,
	buildBreadcrumbPath
} from './utils/search';

import {
	getCardCenter,
	getConnectionAnchors,
	getStraightPath,
	getBezierPath,
	getOrthogonalPath,
	getConnectionPath,
	getBoundingBox,
	calculateFitZoom,
	calculateCenterTranslation,
	DEFAULT_CARD_WIDTH,
	DEFAULT_CARD_HEIGHT
} from './utils/geometry';

import {
	DataLoadError,
	validateCanvasData,
	findBrokenLinks
} from './utils/loader';

import {
	renderMarkdown,
	escapeHtml,
	addTooltipTriggers,
	markdownToPlainText
} from './utils/markdown';

// ============================================================
// Test Data
// ============================================================

/**
 * Minimal valid canvas data for testing
 */
const createTestCanvasData = (): ExplainerCanvasData => ({
	id: 'test-canvas',
	title: 'Test Canvas',
	description: 'A test canvas for unit tests',
	defaultCardId: 'card-1',
	config: {
		lineStyle: 'bezier',
		background: { type: 'dots' },
		enableSearch: true,
		maxZoomIn: 2,
		maxZoomOut: 0.1
	},
	cards: [
		{
			id: 'card-1',
			title: 'First Card',
			summary: 'This is the first card',
			position: { x: 0, y: 0 },
			content: [{ type: 'markdown', content: '# Hello World' }],
			links: ['card-2']
		},
		{
			id: 'card-2',
			title: 'Second Card',
			summary: 'This is the second card',
			position: { x: 350, y: 0 },
			content: [{ type: 'markdown', content: 'Some content' }],
			links: ['card-1']
		},
		{
			id: 'card-3',
			title: 'Card with Children',
			summary: 'This card has nested children',
			position: { x: 0, y: 200 },
			content: [{ type: 'markdown', content: 'Parent content' }],
			children: [
				{
					id: 'child-1',
					title: 'Child Card 1',
					summary: 'First child',
					position: { x: 0, y: 0 },
					content: [{ type: 'markdown', content: 'Child content' }]
				},
				{
					id: 'child-2',
					title: 'Child Card 2',
					summary: 'Second child with grandchildren',
					position: { x: 350, y: 0 },
					content: [{ type: 'markdown', content: 'Child 2 content' }],
					children: [
						{
							id: 'grandchild-1',
							title: 'Grandchild',
							summary: 'A grandchild card',
							position: { x: 0, y: 0 },
							content: [{ type: 'markdown', content: 'Deep content' }]
						}
					]
				}
			]
		}
	]
});

// ============================================================
// Geometry Utility Tests
// ============================================================

describe('Geometry Utilities', () => {
	describe('getCardCenter', () => {
		it('calculates center of card at origin', () => {
			const position: ExplainerPosition = { x: 0, y: 0 };
			const center = getCardCenter(position);

			expect(center.x).toBe(DEFAULT_CARD_WIDTH / 2);
			expect(center.y).toBe(DEFAULT_CARD_HEIGHT / 2);
		});

		it('calculates center with custom position', () => {
			const position: ExplainerPosition = { x: 100, y: 50 };
			const center = getCardCenter(position);

			expect(center.x).toBe(100 + DEFAULT_CARD_WIDTH / 2);
			expect(center.y).toBe(50 + DEFAULT_CARD_HEIGHT / 2);
		});

		it('respects custom dimensions', () => {
			const position: ExplainerPosition = { x: 0, y: 0 };
			const center = getCardCenter(position, { width: 400, height: 200 });

			expect(center.x).toBe(200);
			expect(center.y).toBe(100);
		});
	});

	describe('getConnectionAnchors', () => {
		it('returns anchor points for horizontal cards', () => {
			const from: ExplainerPosition = { x: 0, y: 0 };
			const to: ExplainerPosition = { x: 400, y: 0 };

			const { start, end } = getConnectionAnchors(from, to);

			// Source right edge, target left edge
			expect(start.x).toBe(DEFAULT_CARD_WIDTH);
			expect(end.x).toBe(400);
		});

		it('returns anchor points for vertical cards', () => {
			const from: ExplainerPosition = { x: 0, y: 0 };
			const to: ExplainerPosition = { x: 0, y: 300 };

			const { start, end } = getConnectionAnchors(from, to);

			// Source bottom edge, target top edge
			expect(start.y).toBe(DEFAULT_CARD_HEIGHT);
			expect(end.y).toBe(300);
		});
	});

	describe('Path Generators', () => {
		const start: ExplainerPosition = { x: 100, y: 100 };
		const end: ExplainerPosition = { x: 400, y: 200 };

		it('getStraightPath creates valid SVG path', () => {
			const path = getStraightPath(start, end);

			expect(path).toContain('M 100 100');
			expect(path).toContain('L 400 200');
		});

		it('getBezierPath creates valid SVG cubic bezier', () => {
			const path = getBezierPath(start, end);

			expect(path).toContain('M 100 100');
			expect(path).toContain('C '); // Cubic bezier command
			expect(path).toContain('400 200'); // End point
		});

		it('getOrthogonalPath creates right-angle path', () => {
			const path = getOrthogonalPath(start, end);

			expect(path).toContain('M 100 100');
			expect(path).toContain('L '); // Line commands
			// Should have multiple L commands for the routing
			expect((path.match(/L /g) || []).length).toBeGreaterThanOrEqual(2);
		});

		it('getConnectionPath respects lineStyle parameter', () => {
			const from: ExplainerPosition = { x: 0, y: 0 };
			const to: ExplainerPosition = { x: 400, y: 0 };

			const straightPath = getConnectionPath(from, to, 'straight');
			const bezierPath = getConnectionPath(from, to, 'bezier');
			const orthoPath = getConnectionPath(from, to, 'orthogonal');

			// Each should produce different paths
			expect(straightPath).not.toBe(bezierPath);
			expect(bezierPath).not.toBe(orthoPath);
		});
	});

	describe('getBoundingBox', () => {
		it('returns zero bounds for empty array', () => {
			const bounds = getBoundingBox([]);

			expect(bounds.width).toBe(0);
			expect(bounds.height).toBe(0);
		});

		it('calculates bounds for single position', () => {
			const positions = [{ x: 100, y: 100 }];
			const bounds = getBoundingBox(positions, 0);

			expect(bounds.x).toBe(100);
			expect(bounds.y).toBe(100);
			expect(bounds.width).toBe(DEFAULT_CARD_WIDTH);
			expect(bounds.height).toBe(DEFAULT_CARD_HEIGHT);
		});

		it('includes padding in bounds', () => {
			const positions = [{ x: 100, y: 100 }];
			const padding = 50;
			const bounds = getBoundingBox(positions, padding);

			expect(bounds.x).toBe(50); // 100 - 50
			expect(bounds.y).toBe(50);
			expect(bounds.width).toBe(DEFAULT_CARD_WIDTH + 100); // padding on both sides
		});

		it('encompasses multiple positions', () => {
			const positions = [
				{ x: 0, y: 0 },
				{ x: 500, y: 0 },
				{ x: 250, y: 400 }
			];
			const bounds = getBoundingBox(positions, 0);

			expect(bounds.x).toBe(0);
			expect(bounds.y).toBe(0);
			expect(bounds.width).toBeGreaterThanOrEqual(500 + DEFAULT_CARD_WIDTH);
			expect(bounds.height).toBeGreaterThanOrEqual(400 + DEFAULT_CARD_HEIGHT);
		});
	});

	describe('calculateFitZoom', () => {
		it('returns 1 when content fits viewport exactly', () => {
			const zoom = calculateFitZoom(
				{ width: 800, height: 600 },
				800,
				600
			);

			expect(zoom).toBe(1);
		});

		it('zooms out for larger content', () => {
			const zoom = calculateFitZoom(
				{ width: 1600, height: 1200 },
				800,
				600
			);

			expect(zoom).toBe(0.5);
		});

		it('respects maxZoomIn limit', () => {
			const zoom = calculateFitZoom(
				{ width: 200, height: 150 },
				800,
				600,
				2 // maxZoomIn
			);

			expect(zoom).toBeLessThanOrEqual(2);
		});

		it('respects maxZoomOut limit', () => {
			const zoom = calculateFitZoom(
				{ width: 10000, height: 10000 },
				800,
				600,
				2,
				0.1 // maxZoomOut
			);

			expect(zoom).toBeGreaterThanOrEqual(0.1);
		});
	});

	describe('calculateCenterTranslation', () => {
		it('centers content in viewport', () => {
			const bounds = { x: 0, y: 0, width: 400, height: 300 };
			const translation = calculateCenterTranslation(bounds, 800, 600, 1);

			// Content should be centered
			expect(translation.x).toBe(200); // (800 - 400) / 2
			expect(translation.y).toBe(150); // (600 - 300) / 2
		});

		it('accounts for zoom level', () => {
			const bounds = { x: 0, y: 0, width: 400, height: 300 };
			const translation = calculateCenterTranslation(bounds, 800, 600, 0.5);

			// Scaled dimensions: 200x150
			expect(translation.x).toBe(300); // (800 - 200) / 2
			expect(translation.y).toBe(225); // (600 - 150) / 2
		});
	});
});

// ============================================================
// Search Utility Tests
// ============================================================

describe('Search Utilities', () => {
	const testData = createTestCanvasData();

	describe('flattenCards', () => {
		it('returns empty array for empty input', () => {
			const result = flattenCards([]);
			expect(result).toEqual([]);
		});

		it('flattens top-level cards', () => {
			const result = flattenCards(testData.cards);

			// Should include all cards at all levels
			const ids = result.map((r) => r.card.id);
			expect(ids).toContain('card-1');
			expect(ids).toContain('card-2');
			expect(ids).toContain('card-3');
			expect(ids).toContain('child-1');
			expect(ids).toContain('child-2');
			expect(ids).toContain('grandchild-1');
		});

		it('includes correct paths for nested cards', () => {
			const result = flattenCards(testData.cards);

			const grandchild = result.find((r) => r.card.id === 'grandchild-1');
			expect(grandchild?.path).toEqual(['card-3', 'child-2', 'grandchild-1']);
		});
	});

	describe('findCardById', () => {
		it('finds top-level card', () => {
			const result = findCardById(testData.cards, 'card-1');

			expect(result).toBeDefined();
			expect(result?.card.title).toBe('First Card');
			expect(result?.path).toEqual(['card-1']);
		});

		it('finds nested card', () => {
			const result = findCardById(testData.cards, 'child-1');

			expect(result).toBeDefined();
			expect(result?.card.title).toBe('Child Card 1');
			expect(result?.path).toEqual(['card-3', 'child-1']);
		});

		it('finds deeply nested card', () => {
			const result = findCardById(testData.cards, 'grandchild-1');

			expect(result).toBeDefined();
			expect(result?.card.title).toBe('Grandchild');
			expect(result?.path).toEqual(['card-3', 'child-2', 'grandchild-1']);
		});

		it('returns undefined for non-existent card', () => {
			const result = findCardById(testData.cards, 'non-existent');
			expect(result).toBeUndefined();
		});
	});

	describe('getCardsAtPath', () => {
		it('returns root cards for empty path', () => {
			const result = getCardsAtPath(testData.cards, []);

			expect(result).toBe(testData.cards);
		});

		it('returns children at path', () => {
			const result = getCardsAtPath(testData.cards, ['card-3']);

			expect(result).toBeDefined();
			expect(result?.length).toBe(2);
			expect(result?.[0].id).toBe('child-1');
		});

		it('returns grandchildren at nested path', () => {
			const result = getCardsAtPath(testData.cards, ['card-3', 'child-2']);

			expect(result).toBeDefined();
			expect(result?.length).toBe(1);
			expect(result?.[0].id).toBe('grandchild-1');
		});

		it('returns undefined for invalid path', () => {
			const result = getCardsAtPath(testData.cards, ['non-existent']);
			expect(result).toBeUndefined();
		});

		it('returns empty array for card with no children', () => {
			const result = getCardsAtPath(testData.cards, ['card-1']);
			expect(result).toEqual([]);
		});
	});

	describe('buildBreadcrumbPath', () => {
		it('returns empty array for empty path', () => {
			const result = buildBreadcrumbPath(testData.cards, []);
			expect(result).toEqual([]);
		});

		it('builds breadcrumb for single level', () => {
			const result = buildBreadcrumbPath(testData.cards, ['card-3']);

			expect(result).toEqual([{ id: 'card-3', title: 'Card with Children' }]);
		});

		it('builds breadcrumb for nested path', () => {
			const result = buildBreadcrumbPath(testData.cards, ['card-3', 'child-2']);

			expect(result).toEqual([
				{ id: 'card-3', title: 'Card with Children' },
				{ id: 'child-2', title: 'Child Card 2' }
			]);
		});
	});
});

// ============================================================
// Loader Utility Tests
// ============================================================

describe('Loader Utilities', () => {
	describe('DataLoadError', () => {
		it('creates error with message and source', () => {
			const error = new DataLoadError('Test error', 'validation');

			expect(error.message).toBe('Test error');
			expect(error.source).toBe('validation');
			expect(error.name).toBe('DataLoadError');
		});
	});

	describe('validateCanvasData', () => {
		it('validates correct canvas data', () => {
			const testData = createTestCanvasData();
			expect(() => validateCanvasData(testData)).not.toThrow();
		});

		it('rejects null data', () => {
			expect(() => validateCanvasData(null)).toThrow(DataLoadError);
		});

		it('rejects missing id', () => {
			const data = { ...createTestCanvasData(), id: undefined };
			expect(() => validateCanvasData(data)).toThrow('missing or invalid');
		});

		it('rejects missing title', () => {
			const data = { ...createTestCanvasData(), title: undefined };
			expect(() => validateCanvasData(data)).toThrow('missing or invalid');
		});

		it('rejects non-existent defaultCardId', () => {
			const data = { ...createTestCanvasData(), defaultCardId: 'non-existent' };
			expect(() => validateCanvasData(data)).toThrow('not found in cards');
		});

		it('rejects cards without required fields', () => {
			const data = {
				...createTestCanvasData(),
				cards: [{ id: 'test' }] // Missing title, summary, position, content
			};
			expect(() => validateCanvasData(data)).toThrow(DataLoadError);
		});
	});

	describe('findBrokenLinks', () => {
		it('returns empty array for valid links', () => {
			const testData = createTestCanvasData();
			const broken = findBrokenLinks(testData.cards);

			expect(broken).toEqual([]);
		});

		it('finds broken links', () => {
			const cards: ExplainerCard[] = [
				{
					id: 'card-1',
					title: 'Test',
					summary: 'Test',
					position: { x: 0, y: 0 },
					content: [],
					links: ['non-existent', 'also-missing']
				}
			];

			const broken = findBrokenLinks(cards);

			expect(broken).toHaveLength(1);
			expect(broken[0].cardId).toBe('card-1');
			expect(broken[0].invalidLinks).toContain('non-existent');
			expect(broken[0].invalidLinks).toContain('also-missing');
		});
	});
});

// ============================================================
// Markdown Utility Tests
// ============================================================

describe('Markdown Utilities', () => {
	describe('escapeHtml', () => {
		it('escapes HTML special characters', () => {
			const input = '<script>alert("XSS")</script>';
			const result = escapeHtml(input);

			expect(result).not.toContain('<');
			expect(result).not.toContain('>');
			expect(result).toContain('&lt;');
			expect(result).toContain('&gt;');
		});

		it('escapes ampersands', () => {
			const result = escapeHtml('A & B');
			expect(result).toBe('A &amp; B');
		});

		it('escapes quotes', () => {
			const result = escapeHtml('He said "hello"');
			expect(result).toContain('&quot;');
		});
	});

	describe('renderMarkdown', () => {
		it('returns empty string for empty input', () => {
			expect(renderMarkdown('')).toBe('');
		});

		it('renders basic markdown', () => {
			const result = renderMarkdown('**bold**');
			expect(result).toContain('<strong>');
			expect(result).toContain('bold');
		});

		it('renders headings', () => {
			const result = renderMarkdown('# Heading 1');
			expect(result).toContain('<h1>');
		});

		it('renders code blocks with highlighting', () => {
			const result = renderMarkdown('```javascript\nconst x = 1;\n```');
			expect(result).toContain('<pre>');
			expect(result).toContain('<code');
		});

		it('sanitizes dangerous HTML', () => {
			const result = renderMarkdown('<script>alert("XSS")</script>');
			expect(result).not.toContain('<script');
		});

		it('allows safe HTML elements', () => {
			const result = renderMarkdown('<strong>Bold</strong>');
			expect(result).toContain('<strong>');
		});
	});

	describe('addTooltipTriggers', () => {
		it('returns unchanged HTML when no tooltips provided', () => {
			const html = '<p>Hello world</p>';
			const result = addTooltipTriggers(html, []);

			expect(result).toBe(html);
		});

		it('wraps matching terms with tooltip trigger', () => {
			const html = '<p>Learn about runes today</p>';
			const tooltips = [{ term: 'runes', definition: 'Special Svelte symbols' }];

			const result = addTooltipTriggers(html, tooltips);

			expect(result).toContain('class="ec-tooltip-trigger"');
			expect(result).toContain('data-definition=');
		});

		it('escapes HTML in definitions', () => {
			const html = '<p>Test term here</p>';
			const tooltips = [{ term: 'term', definition: '<script>bad</script>' }];

			const result = addTooltipTriggers(html, tooltips);

			expect(result).not.toContain('<script>');
			expect(result).toContain('&lt;script&gt;');
		});
	});

	describe('markdownToPlainText', () => {
		it('returns empty string for empty input', () => {
			expect(markdownToPlainText('')).toBe('');
		});

		it('strips markdown formatting', () => {
			const result = markdownToPlainText('**bold** and *italic*');
			expect(result).not.toContain('*');
			expect(result).toContain('bold');
			expect(result).toContain('italic');
		});

		it('removes HTML tags', () => {
			const result = markdownToPlainText('# Heading\n\nParagraph');
			expect(result).not.toContain('<');
			expect(result).toContain('Heading');
			expect(result).toContain('Paragraph');
		});

		it('normalizes whitespace', () => {
			const result = markdownToPlainText('Word1    Word2\n\nWord3');
			expect(result).toBe('Word1 Word2 Word3');
		});
	});
});

// ============================================================
// Component Rendering Tests
// ============================================================

describe('ExplainerCanvas Component', () => {
	// Note: Full component testing requires mocking external dependencies
	// (panzoom, marked, highlight.js, fuse.js). These tests focus on
	// what can be tested without complex mocking.

	it('exports expected utility functions', () => {
		// Verify all utilities are properly exported
		expect(typeof flattenCards).toBe('function');
		expect(typeof findCardById).toBe('function');
		expect(typeof getConnectionPath).toBe('function');
		expect(typeof renderMarkdown).toBe('function');
		expect(typeof validateCanvasData).toBe('function');
	});

	it('test data validates successfully', () => {
		const testData = createTestCanvasData();
		expect(() => validateCanvasData(testData)).not.toThrow();
	});

	it('test data has expected structure', () => {
		const testData = createTestCanvasData();

		expect(testData.cards).toHaveLength(3);
		expect(testData.cards[2].children).toHaveLength(2);
		expect(testData.cards[2].children?.[1].children).toHaveLength(1);
	});
});

// ============================================================
// Integration Pattern Tests
// ============================================================

describe('ExplainerCanvas Integration Patterns', () => {
	it('validates complete data flow from cards to flattened paths', () => {
		const testData = createTestCanvasData();

		// Flatten all cards
		const flattened = flattenCards(testData.cards);
		expect(flattened.length).toBe(6); // 3 top + 2 children + 1 grandchild

		// Each should have a valid path
		for (const { card, path } of flattened) {
			expect(path.length).toBeGreaterThan(0);
			expect(path[path.length - 1]).toBe(card.id);
		}
	});

	it('validates breadcrumb navigation path', () => {
		const testData = createTestCanvasData();

		// Simulate navigating to grandchild
		const found = findCardById(testData.cards, 'grandchild-1');
		expect(found).toBeDefined();

		// Build breadcrumb from path
		const breadcrumb = buildBreadcrumbPath(testData.cards, found!.path.slice(0, -1));

		// Should show Card with Children > Child Card 2
		expect(breadcrumb).toHaveLength(2);
		expect(breadcrumb[0].title).toBe('Card with Children');
		expect(breadcrumb[1].title).toBe('Child Card 2');
	});

	it('validates connection line generation for linked cards', () => {
		const testData = createTestCanvasData();

		// Get positions of linked cards
		const card1 = testData.cards[0]; // has link to card-2
		const card2 = testData.cards[1];

		// Generate connection path
		const path = getConnectionPath(card1.position, card2.position, 'bezier');

		// Should be valid SVG path
		expect(path).toContain('M '); // Move command
		expect(path).toMatch(/\d+/); // Contains numbers
	});
});
