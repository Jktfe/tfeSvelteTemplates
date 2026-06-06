<!--
	============================================================
	WordCloud

	🎯 WHAT IT DOES
	Frequency-weighted text-cloud primitive. N words sized
	proportionally to their `weight`, packed into a container
	using Fibonacci spiral placement with collision detection.
	At-a-glance summary of token frequency — blog tags, search
	facets, AI prompt-token frequency, sentiment, keyword analysis.

	Three layout variants share the same data shape:
	- spiral: Fibonacci golden-angle packing with collision avoid
	- organic: flex-wrap line flow
	- grid: CSS grid typographic poster

	✨ FEATURES
	• Fibonacci spiral placement (golden angle 137.5°)
	• Circle-based collision detection with push-away
	• Logarithmic weight scaling — prevents one heavy word from dominating
	• HSL colour generation — even hue distribution, deterministic
	• 3 variants — spiral / organic / grid
	• maxWords prop to cap rendering
	• Optional rotation, href, click handler
	• Hover lift on interactive words
	• prefers-reduced-motion safe

	♿ ACCESSIBILITY
	• role="list" with role="listitem" when interactive
	• Decorative mode with aria-label
	• Visually-hidden ranked table via srTable prop
	• Focus-visible ring on clickable/linked words

	📦 DEPENDENCIES
	Zero external dependencies — pure Svelte 5 + scoped CSS.

	📋 PROPS
	| Prop          | Type                   | Default      |
	|---------------|------------------------|--------------|
	| words         | WordCloudWord[]        | []           |
	| variant       | 'spiral'|'organic'|'grid' | 'spiral' |
	| rotation      | 'none'|'alternating'|'random' | 'none' |
	| minSize       | number (px)            | 14           |
	| maxSize       | number (px)            | 48           |
	| palette       | string[]               | (built-in)   |
	| seed          | number                 | 0            |
	| maxWords      | number                 | Infinity     |
	| srTable       | boolean                | false        |
	| onWordClick   | (w: WordCloudWord)→void | undefined   |
	| aria-label    | string                 | 'Word cloud'  |
	| class         | string                 | ''           |

	============================================================
-->

<script lang="ts" module>
	export type WordCloudVariant = 'spiral' | 'organic' | 'grid';
	export type WordCloudRotation = 'none' | 'alternating' | 'random';

	export interface WordCloudWord {
		text: string;
		weight: number;
		href?: string;
	}

	export interface WeightExtents {
		min: number;
		max: number;
	}

	const VALID_VARIANTS: readonly WordCloudVariant[] = ['spiral', 'organic', 'grid'];
	const VALID_ROTATIONS: readonly WordCloudRotation[] = ['none', 'alternating', 'random'];

	export const DEFAULT_PALETTE: readonly string[] = [
		'#6366f1',
		'#06b6d4',
		'#10b981',
		'#f59e0b',
		'#ef4444',
		'#8b5cf6',
		'#ec4899',
		'#14b8a6'
	];

	export function isValidVariant(name: string | undefined | null): name is WordCloudVariant {
		return typeof name === 'string' && (VALID_VARIANTS as readonly string[]).includes(name);
	}

	export function pickVariant(name: string | undefined | null): WordCloudVariant {
		return isValidVariant(name) ? name : 'spiral';
	}

	export function isValidRotationStrategy(
		name: string | undefined | null
	): name is WordCloudRotation {
		return typeof name === 'string' && (VALID_ROTATIONS as readonly string[]).includes(name);
	}

	export function pickRotationStrategy(name: string | undefined | null): WordCloudRotation {
		return isValidRotationStrategy(name) ? name : 'none';
	}

	export function clampSize(n: number | undefined | null, fallback: number): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
		if (n < 8) return 8;
		if (n > 200) return 200;
		return n;
	}

	export function hashWord(text: string): number {
		let hash = 5381;
		for (let i = 0; i < text.length; i++) {
			hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
		}
		return Math.abs(hash);
	}

	/**
	 * HSL colour from word hash — even hue distribution.
	 * Deterministic: same word always gets the same colour.
	 */
	export function hslColor(text: string, saturation = 70, lightness = 55): string {
		const hue = (hashWord(text) * 137.508) % 360;
		return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
	}

	/** Legacy palette-based colour picker — kept for backward compat. */
	export function pickPaletteColor(
		text: string,
		palette: readonly string[] | string[] | undefined | null
	): string {
		const safe =
			Array.isArray(palette) && palette.length > 0 ? palette : (DEFAULT_PALETTE as readonly string[]);
		return safe[hashWord(text) % safe.length];
	}

	/**
	 * Logarithmic weight → font-size scale.
	 * Prevents one heavy word from dominating; compresses the
	 * upper range while preserving visual differentiation.
	 */
	export function logScaleSize(
		weight: number,
		minWeight: number,
		maxWeight: number,
		minSize: number,
		maxSize: number
	): number {
		if (!Number.isFinite(weight) || !Number.isFinite(minWeight) || !Number.isFinite(maxWeight)) {
			return (minSize + maxSize) / 2;
		}
		if (maxWeight <= minWeight) return (minSize + maxSize) / 2;
		const clampedWeight = Math.max(minWeight, Math.min(maxWeight, weight));
		// Shift so minWeight maps to 1 (log(1)=0), avoiding log(0)=-Infinity
		const shifted = clampedWeight - minWeight + 1;
		const shiftedMax = maxWeight - minWeight + 1;
		const t = Math.log(shifted) / Math.log(shiftedMax);
		return minSize + t * (maxSize - minSize);
	}

	/** Legacy linear scale — kept for backward compat. */
	export function scaleSize(
		weight: number,
		minWeight: number,
		maxWeight: number,
		minSize: number,
		maxSize: number
	): number {
		if (!Number.isFinite(weight) || !Number.isFinite(minWeight) || !Number.isFinite(maxWeight)) {
			return (minSize + maxSize) / 2;
		}
		if (maxWeight <= minWeight) return (minSize + maxSize) / 2;
		const clampedWeight = Math.max(minWeight, Math.min(maxWeight, weight));
		const t = (clampedWeight - minWeight) / (maxWeight - minWeight);
		return minSize + t * (maxSize - minSize);
	}

	function seededRandom(seedInt: number): () => number {
		let s = seedInt | 0;
		return () => {
			s = (s + 0x6d2b79f5) | 0;
			let t = s;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	export function pickRotation(
		strategy: WordCloudRotation,
		index: number,
		seed = 0
	): number {
		if (strategy === 'none') return 0;
		if (strategy === 'alternating') return index % 2 === 0 ? 0 : -90;
		const rng = seededRandom(seed + index);
		const choices = [0, -90, 0, 0, 30, -30];
		return choices[Math.floor(rng() * choices.length)];
	}

	export function normaliseWords(words: readonly WordCloudWord[] | undefined | null): WordCloudWord[] {
		if (!Array.isArray(words) || words.length === 0) return [];
		const seen: Record<string, true> = Object.create(null);
		const result: WordCloudWord[] = [];
		for (const w of words) {
			if (!w || typeof w.text !== 'string' || w.text.length === 0) continue;
			const key = w.text.toLowerCase();
			if (seen[key]) continue;
			seen[key] = true;
			result.push({
				text: w.text,
				weight: typeof w.weight === 'number' && Number.isFinite(w.weight) ? w.weight : 1,
				href: w.href
			});
		}
		result.sort((a, b) => b.weight - a.weight);
		return result;
	}

	export function getWeightExtents(words: readonly WordCloudWord[]): WeightExtents {
		if (!Array.isArray(words) || words.length === 0) return { min: 0, max: 1 };
		let min = Infinity;
		let max = -Infinity;
		for (const w of words) {
			if (typeof w.weight !== 'number' || !Number.isFinite(w.weight)) continue;
			if (w.weight < min) min = w.weight;
			if (w.weight > max) max = w.weight;
		}
		if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
		return { min, max };
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}

	/** Golden angle in radians (~137.508 degrees) */
	const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

	export interface SpiralPosition {
		left: number;
		top: number;
	}

	/**
	 * Fibonacci spiral placement using the golden angle.
	 * Each word is placed at: angle = i * goldenAngle, radius = c * sqrt(i).
	 * Produces even, non-overlapping distribution for circles.
	 * Returns positions in [0, 100] percent space.
	 */
	export function spiralPosition(
		index: number,
		spacing = 10,
		aspectRatio = 0.8
	): SpiralPosition {
		if (index === 0) return { left: 50, top: 50 };
		const angle = index * GOLDEN_ANGLE;
		const radius = spacing * Math.sqrt(index);
		const left = 50 + Math.cos(angle) * radius;
		const top = 50 + Math.sin(angle) * radius * aspectRatio;
		return { left, top };
	}

	/**
	 * Legacy concentric-ring placement — kept for backward compat.
	 */
	export function polarPosition(index: number): { left: number; top: number; ring: number } {
		if (index === 0) return { left: 50, top: 50, ring: 0 };
		let ring = 1;
		let consumed = 1;
		while (true) {
			const capacity = 6 * ring;
			if (index < consumed + capacity) break;
			consumed += capacity;
			ring += 1;
		}
		const positionInRing = index - consumed;
		const ringCapacity = 6 * ring;
		const angle = (positionInRing / ringCapacity) * Math.PI * 2;
		const radiusPct = Math.min(48, ring * 14);
		const left = 50 + Math.cos(angle) * radiusPct;
		const top = 50 + Math.sin(angle) * radiusPct * 0.85;
		return { left, top, ring };
	}

	/**
	 * Collision-aware spiral placement.
	 * Places words along the Fibonacci spiral and pushes overlapping
	 * words outward. Uses circle-based bounding where each word's
	 * radius is estimated from its font size.
	 */
	export function spiralPositionWithCollision(
		words: { fontSize: number; index: number }[],
		spacing = 10,
		aspectRatio = 0.75,
		gap = 1.2
	): SpiralPosition[] {
		const positions: { left: number; top: number; r: number }[] = [];
		const maxSize = words.length > 0 ? Math.max(...words.map((w) => w.fontSize)) : 48;

		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			// Estimate bounding circle radius relative to container percentages.
			// Larger fonts need bigger radii; scale proportionally to the max font size.
			const sizeRatio = word.fontSize / maxSize;
			const wordRadius = sizeRatio * spacing * 0.55 + gap;

			// Start with golden angle position
			const baseAngle = i * GOLDEN_ANGLE;
			let spiralRadius = spacing * Math.sqrt(i + 1);
			let pos = {
				left: 50 + Math.cos(baseAngle) * spiralRadius,
				top: 50 + Math.sin(baseAngle) * spiralRadius * aspectRatio
			};

			// Iterative collision resolution: push outward along spiral until no overlap
			for (let attempt = 0; attempt < 80; attempt++) {
				let overlaps = false;
				for (const p of positions) {
					const dx = pos.left - p.left;
					const dy = (pos.top - p.top) / aspectRatio;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const minDist = wordRadius + p.r;
					if (dist < minDist) {
						overlaps = true;
						break;
					}
				}
				if (!overlaps) break;
				// Push outward along an adjusted spiral angle
				spiralRadius += spacing * 0.12;
				const angle = baseAngle + attempt * 0.18;
				pos = {
					left: 50 + Math.cos(angle) * spiralRadius,
					top: 50 + Math.sin(angle) * spiralRadius * aspectRatio
				};
			}

			positions.push({ left: pos.left, top: pos.top, r: wordRadius });
		}

		return positions;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		words?: WordCloudWord[];
		variant?: WordCloudVariant | string;
		rotation?: WordCloudRotation | string;
		minSize?: number;
		maxSize?: number;
		palette?: string[];
		seed?: number;
		maxWords?: number;
		srTable?: boolean;
		onWordClick?: (word: WordCloudWord) => void;
		class?: string;
		[key: string]: unknown;
	}

	let {
		words = [],
		variant = 'spiral',
		rotation = 'none',
		minSize = 14,
		maxSize = 48,
		palette,
		seed = 0,
		maxWords = Infinity,
		srTable = false,
		onWordClick,
		class: className = '',
		...restProps
	}: Props = $props();

	const ariaLabel = $derived(
		typeof restProps['aria-label'] === 'string' ? restProps['aria-label'] : 'Word cloud'
	);
	const resolvedVariant = $derived(pickVariant(variant));
	const resolvedRotation = $derived(pickRotationStrategy(rotation));
	const resolvedMin = $derived(clampSize(minSize, 14));
	const resolvedMax = $derived(clampSize(maxSize, 48));
	const useHsl = $derived(!Array.isArray(palette) || palette.length === 0);
	const normalisedWords = $derived(normaliseWords(words));
	const cappedWords = $derived(
		Number.isFinite(maxWords) && maxWords > 0
			? normalisedWords.slice(0, maxWords)
			: normalisedWords
	);
	const extents = $derived(getWeightExtents(cappedWords));
	const interactive = $derived(typeof onWordClick === 'function');

	let reduced = $state(false);

	onMount(() => {
		reduced = isReducedMotion();
	});

	function buildItem(word: WordCloudWord, index: number) {
		const fontSize = logScaleSize(word.weight, extents.min, extents.max, resolvedMin, resolvedMax);
		const colour = useHsl
			? hslColor(word.text)
			: pickPaletteColor(word.text, palette);
		const angle = pickRotation(resolvedRotation, index, seed);
		return { word, index, fontSize, colour, angle };
	}

	const items = $derived(cappedWords.map(buildItem));

	// Compute spiral positions with collision detection
	const spiralPositions = $derived(() =>
		resolvedVariant !== 'spiral' ? [] : spiralPositionWithCollision(
			items.map((item) => ({ fontSize: item.fontSize, index: item.index }))
		)
	);
</script>

{#if cappedWords.length === 0}
	<!-- Empty state — render nothing -->
{:else if interactive || words.some((w) => w.href)}
	<!-- List mode — proper <ul><li> semantic when items are interactive -->
	<ul
		class="wordcloud {className}"
		class:wordcloud--spiral={resolvedVariant === 'spiral'}
		class:wordcloud--organic={resolvedVariant === 'organic'}
		class:wordcloud--grid={resolvedVariant === 'grid'}
		class:wordcloud--reduced={reduced}
		aria-label={ariaLabel}
	>
		{#each items as item, i (item.word.text)}
			<li
				class="wordcloud__cell"
				style:--wc-x={resolvedVariant === 'spiral' ? `${spiralPositions()[i]?.left ?? 50}%` : ''}
				style:--wc-y={resolvedVariant === 'spiral' ? `${spiralPositions()[i]?.top ?? 50}%` : ''}
			>
				{#if item.word.href}
					<a
						href={item.word.href}
						class="wordcloud__word wordcloud__word--link"
						style:font-size="{item.fontSize}px"
						style:color={item.colour}
						style:transform="rotate({item.angle}deg)"
					>
						{item.word.text}
					</a>
				{:else if onWordClick}
					<button
						type="button"
						class="wordcloud__word wordcloud__word--button"
						onclick={() => onWordClick?.(item.word)}
						style:font-size="{item.fontSize}px"
						style:color={item.colour}
						style:transform="rotate({item.angle}deg)"
					>
						{item.word.text}
					</button>
				{:else}
					<span
						class="wordcloud__word wordcloud__word--static"
						style:font-size="{item.fontSize}px"
						style:color={item.colour}
						style:transform="rotate({item.angle}deg)"
					>
						{item.word.text}
					</span>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<!-- Decorative mode — span-only, role="group" -->
	<div
		class="wordcloud {className}"
		class:wordcloud--spiral={resolvedVariant === 'spiral'}
		class:wordcloud--organic={resolvedVariant === 'organic'}
		class:wordcloud--grid={resolvedVariant === 'grid'}
		class:wordcloud--reduced={reduced}
		role="group"
		aria-label={ariaLabel}
	>
		{#each items as item, i (item.word.text)}
			<span
				class="wordcloud__word wordcloud__word--static"
				aria-hidden={srTable ? 'true' : undefined}
				style:font-size="{item.fontSize}px"
				style:color={item.colour}
				style:transform="rotate({item.angle}deg)"
				style:--wc-x={resolvedVariant === 'spiral' ? `${spiralPositions()[i]?.left ?? 50}%` : ''}
				style:--wc-y={resolvedVariant === 'spiral' ? `${spiralPositions()[i]?.top ?? 50}%` : ''}
			>
				{item.word.text}
			</span>
		{/each}
	</div>

	{#if srTable}
		<table class="wordcloud__sr-table">
			<caption>Top words by weight</caption>
			<thead>
				<tr>
					<th scope="col">Rank</th>
					<th scope="col">Word</th>
					<th scope="col">Weight</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item, i (item.word.text)}
					<tr>
						<td>{i + 1}</td>
						<td>{item.word.text}</td>
						<td>{item.word.weight}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{/if}

<style>
	.wordcloud {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5em 0.75em;
		padding: 1.5rem;
		margin: 0;
		list-style: none;
		font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
		line-height: 1.1;
		font-weight: 600;
	}

	.wordcloud--spiral {
		display: block;
		position: relative;
		min-height: 360px;
		aspect-ratio: 4 / 3;
		max-width: 100%;
	}

	.wordcloud--grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 0.5rem 0.75rem;
		justify-items: center;
		align-items: center;
	}

	.wordcloud__cell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		list-style: none;
	}

	.wordcloud--spiral .wordcloud__cell {
		position: absolute;
		left: var(--wc-x, 50%);
		top: var(--wc-y, 50%);
		transform: translate(-50%, -50%);
	}

	.wordcloud--spiral .wordcloud__word {
		white-space: nowrap;
	}

	/* Spiral variant: decorative spans also need absolute positioning */
	.wordcloud--spiral .wordcloud__word--static {
		position: absolute;
		left: var(--wc-x, 50%);
		top: var(--wc-y, 50%);
		transform: translate(-50%, -50%);
	}

	.wordcloud__word {
		display: inline-block;
		transition:
			transform 180ms ease,
			filter 180ms ease;
		text-decoration: none;
		border: none;
		background: transparent;
		font: inherit;
		font-weight: inherit;
		padding: 0;
		cursor: default;
		user-select: none;
	}

	.wordcloud__word--link,
	.wordcloud__word--button {
		cursor: pointer;
	}

	.wordcloud__word--link:hover,
	.wordcloud__word--button:hover {
		filter: brightness(1.15);
		text-decoration: none;
	}

	.wordcloud__word--link:focus-visible,
	.wordcloud__word--button:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
		border-radius: 4px;
	}

	.wordcloud__word--link:hover,
	.wordcloud__word--button:hover {
		transform: scale(1.08);
	}

	.wordcloud--reduced .wordcloud__word,
	.wordcloud--reduced .wordcloud__word:hover {
		transition: none;
		transform: inherit;
		filter: none;
	}

	.wordcloud__sr-table {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.wordcloud__word {
			transition: none;
		}
		.wordcloud__word:hover {
			transform: inherit;
			filter: none;
		}
	}

	@container (max-width: 480px) {
		.wordcloud--spiral {
			aspect-ratio: 3 / 4;
		}
	}
</style>
