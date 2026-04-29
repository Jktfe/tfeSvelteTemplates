<!--
  ============================================================
  WordCloud

  🎯 WHAT IT DOES
  Frequency-weighted text-cloud primitive. N words sized
  proportionally to their `weight`, packed into a container,
  optionally rotated, coloured deterministically from a palette.
  At-a-glance summary of token frequency in a corpus —
  blog tags, search facets, AI prompt-token frequency,
  customer-feedback sentiment, code-keyword analysis.

  Pure CSS layout — no canvas, no D3, no rAF. Three variants
  — organic flex-wrap, CSS-grid, polar radial — each shares
  the same data shape (`{text, weight, href?}`).

  ✨ FEATURES
  • 3 variants — organic / grid / radial — each with its own
    placement grammar; data shape is identical
  • Linear weight→font-size scale clamped to [minSize, maxSize]
  • Deterministic palette colour via hashed word text — same
    word → same colour across renders, no flicker
  • Optional rotation per word — none / alternating
    (every 2nd at -90deg) / random (deterministic from seed)
  • Optional `href` per word wraps it as an anchor; with
    `onWordClick` it becomes a button; otherwise a span
  • Hover lift (scale + translateZ) on interactive words
  • Edge fade not needed — the cloud is bounded by its container

  ♿ ACCESSIBILITY
  • Outer wrapper is `role="list"` with `role="listitem"`
    children when interactive — screen readers see each
    word as a list element
  • When decorative-only (no clicks/links) the wrapper carries
    an `aria-label` summary; individual words are `aria-hidden`
  • Visually-hidden top-N table emitted when `srTable` is
    set — screen readers get an ordered ranked list
  • Focus-visible ring on clickable / linked words
  • `prefers-reduced-motion: reduce` → hover scale disabled

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • Single render pass — no measurement loop, no resize
    observer, no rAF
  • Polar coordinates for radial variant computed once per
    word at render time (cheap — sin/cos × N words)
  • Hover scale is GPU-composited (transform only)

  🎨 USAGE
  <WordCloud
    words={[
      { text: 'svelte', weight: 42 },
      { text: 'rune',   weight: 28 },
      { text: 'store',  weight: 18 }
    ]}
  />

  <WordCloud
    words={topics}
    variant="radial"
    rotation="alternating"
    minSize={16}
    maxSize={64}
    palette={['#6366f1', '#06b6d4', '#10b981']}
    onWordClick={(w) => console.log(w.text)}
  />

  📋 PROPS
  | Prop          | Type                   | Default      |
  |---------------|------------------------|--------------|
  | words         | WordCloudWord[]        | []           |
  | variant       | 'organic'\|'grid'\|'radial' | 'organic'|
  | rotation      | 'none'\|'alternating'\|'random' | 'none' |
  | minSize       | number (px)            | 14           |
  | maxSize       | number (px)            | 48           |
  | palette       | string[]               | (built-in)   |
  | seed          | number                 | 0            |
  | onWordClick   | (w: WordCloudWord)→void | undefined   |
  | aria-label    | string                 | 'Word cloud' |
  | class         | string                 | ''           |

  ============================================================
-->

<script lang="ts" module>
	export type WordCloudVariant = 'organic' | 'grid' | 'radial';
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

	const VALID_VARIANTS: readonly WordCloudVariant[] = ['organic', 'grid', 'radial'];
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
		return isValidVariant(name) ? name : 'organic';
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

	/**
	 * Deterministic 32-bit string hash. Same input → same output, every time.
	 * Used to map a word to a palette index without needing externally-provided
	 * colour fields — feed the same corpus twice, you get the same colours.
	 */
	export function hashWord(text: string): number {
		let hash = 5381;
		for (let i = 0; i < text.length; i++) {
			hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
		}
		return Math.abs(hash);
	}

	export function pickPaletteColor(
		text: string,
		palette: readonly string[] | string[] | undefined | null
	): string {
		const safe =
			Array.isArray(palette) && palette.length > 0 ? palette : (DEFAULT_PALETTE as readonly string[]);
		return safe[hashWord(text) % safe.length];
	}

	/**
	 * Linear scale from a weight value to a pixel font-size, clamped to
	 * [minSize, maxSize]. When all words share the same weight we collapse
	 * to the midpoint — no division-by-zero, no tiny text.
	 */
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

	/**
	 * Mulberry32 — tiny seeded PRNG. We use it for the 'random' rotation
	 * strategy so re-renders with the same seed produce the same angles.
	 * Deterministic > pretty.
	 */
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

	/**
	 * Pick a rotation angle (degrees) for the word at `index` under the given
	 * strategy. 'none' → 0, 'alternating' → 0/-90 swap, 'random' → seeded
	 * pick from a small set so words still read horizontally most of the time.
	 */
	export function pickRotation(
		strategy: WordCloudRotation,
		index: number,
		seed = 0
	): number {
		if (strategy === 'none') return 0;
		if (strategy === 'alternating') return index % 2 === 0 ? 0 : -90;
		// 'random' — deterministic from seed + index
		const rng = seededRandom(seed + index);
		const choices = [0, -90, 0, 0, 30, -30];
		return choices[Math.floor(rng() * choices.length)];
	}

	/**
	 * Sort words by weight (desc) and deduplicate by lowercase text.
	 * The first occurrence wins on duplicates. Stable enough for typical
	 * tag-cloud usage where input is already mostly clean.
	 */
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

	/**
	 * Compute polar (x%, y%) for the word at `index` for the radial variant.
	 * Word 0 sits at the centre; subsequent words fan out in concentric rings
	 * of 6 → 12 → 18 → 24… Every position is in the [0, 100] percent space
	 * so the cloud scales with its container.
	 */
	export function polarPosition(index: number): { left: number; top: number; ring: number } {
		if (index === 0) return { left: 50, top: 50, ring: 0 };
		// Determine ring by accumulating capacities: 6, 12, 18, 24…
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
		srTable?: boolean;
		onWordClick?: (word: WordCloudWord) => void;
		'aria-label'?: string;
		class?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props -- 'aria-label' is destructured to ariaLabel and used in template; rule false-positive on hyphenated keys
	let {
		words = [],
		variant = 'organic',
		rotation = 'none',
		minSize = 14,
		maxSize = 48,
		palette = DEFAULT_PALETTE as string[],
		seed = 0,
		srTable = false,
		onWordClick,
		'aria-label': ariaLabel = 'Word cloud',
		class: className = ''
	}: Props = $props();

	const resolvedVariant = $derived(pickVariant(variant));
	const resolvedRotation = $derived(pickRotationStrategy(rotation));
	const resolvedMin = $derived(clampSize(minSize, 14));
	const resolvedMax = $derived(clampSize(maxSize, 48));
	const safePalette = $derived(
		Array.isArray(palette) && palette.length > 0 ? palette : (DEFAULT_PALETTE as string[])
	);
	const normalisedWords = $derived(normaliseWords(words));
	const extents = $derived(getWeightExtents(normalisedWords));
	const interactive = $derived(typeof onWordClick === 'function');

	let reduced = $state(false);

	onMount(() => {
		reduced = isReducedMotion();
	});

	function buildItem(word: WordCloudWord, index: number) {
		const fontSize = scaleSize(word.weight, extents.min, extents.max, resolvedMin, resolvedMax);
		const colour = pickPaletteColor(word.text, safePalette);
		const angle = pickRotation(resolvedRotation, index, seed);
		return { word, index, fontSize, colour, angle };
	}

	const items = $derived(normalisedWords.map(buildItem));
</script>

{#if normalisedWords.length === 0}
	<!-- Empty state — render nothing. The container would just be blank padding. -->
{:else if interactive || words.some((w) => w.href)}
	<!-- List mode — proper <ul><li> semantic when items are interactive -->
	<ul
		class="wordcloud {className}"
		class:wordcloud--organic={resolvedVariant === 'organic'}
		class:wordcloud--grid={resolvedVariant === 'grid'}
		class:wordcloud--radial={resolvedVariant === 'radial'}
		class:wordcloud--reduced={reduced}
		aria-label={ariaLabel}
	>
		{#each items as item (item.word.text)}
			<li
				class="wordcloud__cell"
				style:--wc-x={resolvedVariant === 'radial' ? `${polarPosition(item.index).left}%` : ''}
				style:--wc-y={resolvedVariant === 'radial' ? `${polarPosition(item.index).top}%` : ''}
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
		class:wordcloud--organic={resolvedVariant === 'organic'}
		class:wordcloud--grid={resolvedVariant === 'grid'}
		class:wordcloud--radial={resolvedVariant === 'radial'}
		class:wordcloud--reduced={reduced}
		role="group"
		aria-label={ariaLabel}
	>
		{#each items as item (item.word.text)}
			<span
				class="wordcloud__word wordcloud__word--static"
				aria-hidden={srTable ? 'true' : undefined}
				style:font-size="{item.fontSize}px"
				style:color={item.colour}
				style:transform="rotate({item.angle}deg)"
				style:--wc-x={resolvedVariant === 'radial' ? `${polarPosition(item.index).left}%` : ''}
				style:--wc-y={resolvedVariant === 'radial' ? `${polarPosition(item.index).top}%` : ''}
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

	.wordcloud--grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 0.5rem 0.75rem;
		justify-items: center;
		align-items: center;
	}

	.wordcloud--radial {
		display: block;
		position: relative;
		min-height: 360px;
		aspect-ratio: 4 / 3;
		max-width: 100%;
	}

	.wordcloud__cell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		list-style: none;
	}

	.wordcloud--radial .wordcloud__cell {
		position: absolute;
		left: var(--wc-x, 50%);
		top: var(--wc-y, 50%);
		transform: translate(-50%, -50%);
	}

	.wordcloud--radial .wordcloud__word {
		white-space: nowrap;
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
</style>
