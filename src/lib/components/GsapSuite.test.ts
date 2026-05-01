import { describe, expect, it } from 'vitest';
import { revealOffset } from './GsapRevealSequence.svelte';
import { distanceFromOrigin, splitTextForShock } from './VariableShockText.svelte';
import { clampParticleCount, stepKineticParticle, type KineticParticle } from './KineticCanvasField.svelte';
import { deckTransform, normalizeIndex } from './FanDeckCarousel.svelte';
import {
	filterFlipGridItems,
	normalizeFlipGridFilters,
	normalizeFlipGridItems,
	orderFlipGridItems
} from './GsapFlipGrid.svelte';
import {
	normalizeSplitTextMode,
	splitTextModeConfig,
	splitTextModeOptions
} from './GsapSplitTextHero.svelte';

describe('GSAP suite helpers', () => {
	it('computes reveal offsets by axis', () => {
		expect(revealOffset('x', 24)).toEqual({ x: 24, y: 0 });
		expect(revealOffset('y', 18)).toEqual({ x: 0, y: 18 });
	});

	it('splits text into accessible glyph metadata', () => {
		expect(splitTextForShock('A B')).toEqual([
			{ id: 'A-0', value: 'A', isSpace: false },
			{ id: ' -1', value: ' ', isSpace: true },
			{ id: 'B-2', value: 'B', isSpace: false }
		]);
		expect(distanceFromOrigin(5, 2)).toBe(3);
	});

	it('clamps particle budgets and steps particle physics', () => {
		expect(clampParticleCount(2)).toBe(8);
		expect(clampParticleCount(500)).toBe(260);

		const particle: KineticParticle = {
			x: 0,
			y: 0,
			vx: 10,
			vy: 0,
			life: 1,
			maxLife: 1,
			size: 4,
			hue: 200
		};
		const next = stepKineticParticle(particle, 0.1);
		expect(next.x).toBeGreaterThan(0);
		expect(next.vy).toBeGreaterThan(0);
		expect(next.life).toBeCloseTo(0.9);
	});

	it('normalises carousel indexes and centres selected cards', () => {
		expect(normalizeIndex(-1, 4)).toBe(3);
		expect(normalizeIndex(5, 4)).toBe(1);
		expect(deckTransform(2, 2, 5)).toMatchObject({
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1
		});
		expect(deckTransform(4, 2, 5).x).toBeGreaterThan(0);
	});

	it('prepares Flip grid rows for filtering and promotion', () => {
		const items = normalizeFlipGridItems([
			{ id: '', title: 'Beta', description: 'Second', filter: 'motion' },
			{ id: 'alpha', title: 'Alpha', description: 'First', tags: ['motion'] },
			{ id: 'blank', title: '   ', description: 'Ignored' }
		]);

		expect(items).toHaveLength(2);
		expect(items[0].id).toBe('beta-0');
		expect(normalizeFlipGridFilters([{ id: 'motion', label: 'Motion' }])).toEqual([
			{ id: 'all', label: 'All' },
			{ id: 'motion', label: 'Motion' }
		]);
		expect(filterFlipGridItems(items, 'motion').map((item) => item.title)).toEqual(['Beta', 'Alpha']);
		expect(orderFlipGridItems(items, 'alpha', 'alpha').map((item) => item.title)).toEqual([
			'Alpha',
			'Beta'
		]);
	});

	it('maps SplitText hero modes to focused split configs', () => {
		expect(splitTextModeOptions.map((option) => option.id)).toEqual(['chars', 'words', 'lines']);
		expect(normalizeSplitTextMode('words')).toBe('words');
		expect(normalizeSplitTextMode('unknown')).toBe('chars');
		expect(splitTextModeConfig('chars')).toMatchObject({
			type: 'chars,words',
			target: 'chars',
			autoSplit: false
		});
		expect(splitTextModeConfig('lines')).toMatchObject({
			type: 'lines,words',
			target: 'lines',
			autoSplit: true,
			mask: 'lines'
		});
	});
});
