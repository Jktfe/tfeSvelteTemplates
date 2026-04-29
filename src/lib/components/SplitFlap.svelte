<script lang="ts" module>
	// ============================================================
	// SplitFlap — pure helpers + types
	//
	// Exported via module-script so the test suite can assert
	// charset selection, traversal direction, stagger maths, and
	// motion-gate behaviour without rendering a component.
	// ============================================================

	export type CharsetName = 'digits' | 'alpha' | 'alnum' | 'solari';

	export interface SplitFlapCharset {
		name: CharsetName;
		chars: string;
	}

	const CHARSETS: Record<CharsetName, string> = {
		digits: '0123456789',
		alpha: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		alnum: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		solari: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:!?-+/'
	};

	const CHARSET_NAMES = Object.keys(CHARSETS) as CharsetName[];

	/**
	 * Resolve a charset by name. Falls back to `alnum` on unknown
	 * input so consumers passing user data never crash.
	 */
	export function pickCharset(name: string): SplitFlapCharset {
		if ((CHARSET_NAMES as string[]).includes(name)) {
			const n = name as CharsetName;
			return { name: n, chars: CHARSETS[n] };
		}
		return { name: 'alnum', chars: CHARSETS.alnum };
	}

	export type FlipDirection = 'forward' | 'shortest';

	/**
	 * Step one position toward the target index inside a charset.
	 * `forward` always cycles through the charset in ascending
	 * order — the classic Solari-board feel where every change
	 * costs a full traversal. `shortest` picks whichever direction
	 * is fewer ticks, which feels snappier for clocks/counters.
	 */
	export function nextCharIndex(
		currentIdx: number,
		targetIdx: number,
		length: number,
		direction: FlipDirection = 'forward'
	): number {
		if (length <= 0) return 0;
		const cur = ((currentIdx % length) + length) % length;
		const tgt = ((targetIdx % length) + length) % length;
		if (cur === tgt) return cur;
		if (direction === 'forward') {
			return (cur + 1) % length;
		}
		const forward = (tgt - cur + length) % length;
		const backward = (cur - tgt + length) % length;
		if (forward <= backward) {
			return (cur + 1) % length;
		}
		return (cur - 1 + length) % length;
	}

	/**
	 * Per-character delay before the first flip kicks off.
	 * Multiplied by `intensity` so a single prop scales the whole
	 * cascade (>1 longer wave, <1 punchier wave, never below 0).
	 */
	export function frameDelay(index: number, baseStagger: number, intensity = 1): number {
		const safeIntensity = Math.max(0, intensity);
		const safeStagger = Math.max(0, baseStagger);
		return Math.max(0, index * safeStagger * safeIntensity);
	}

	/**
	 * Build the ordered sequence of intermediate glyphs a single
	 * cell will tick through to land on `to`. The final entry is
	 * always `to`. If either glyph is outside the charset, the
	 * sequence is `[to]` so callers always make progress.
	 */
	export function buildTickSequence(
		from: string,
		to: string,
		charset: string,
		direction: FlipDirection = 'forward'
	): string[] {
		if (from === to) return [];
		const fromIdx = charset.indexOf(from);
		const toIdx = charset.indexOf(to);
		if (fromIdx < 0 || toIdx < 0) return [to];
		const seq: string[] = [];
		let cur = fromIdx;
		const length = charset.length;
		// Hard cap: at most one full charset traversal so a malformed
		// direction can never spin a cell forever.
		for (let guard = 0; guard < length; guard++) {
			cur = nextCharIndex(cur, toIdx, length, direction);
			seq.push(charset[cur]);
			if (cur === toIdx) break;
		}
		return seq;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';

	type Props = {
		value: string;
		charset?: CharsetName;
		stagger?: number;
		flipDuration?: number;
		intensity?: number;
		direction?: FlipDirection;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	};

	const {
		value,
		charset = 'alnum',
		stagger = 60,
		flipDuration = 320,
		intensity = 1,
		direction = 'forward',
		size = 'md',
		class: extraClass = ''
	}: Props = $props();

	const resolvedCharset = $derived(pickCharset(charset));
	const upperChars = $derived(value.toUpperCase());
	const cells = $derived(upperChars.split(''));

	let displayed = $state<string[]>([]);
	let flipping = $state<boolean[]>([]);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let mounted = $state(false);
	let prefersReduced = $state(false);

	function clearTimers() {
		for (const t of timers) clearTimeout(t);
		timers = [];
	}

	function scheduleCell(idx: number, from: string, to: string) {
		if (from === to) return;
		const reduced = prefersReduced;
		if (reduced) {
			displayed[idx] = to;
			return;
		}
		const sequence = buildTickSequence(from, to, resolvedCharset.chars, direction);
		const startDelay = frameDelay(idx, stagger, intensity);

		sequence.forEach((char, step) => {
			const t = setTimeout(
				() => {
					displayed[idx] = char;
					flipping[idx] = true;
					const settle = setTimeout(() => {
						flipping[idx] = false;
					}, flipDuration);
					timers.push(settle);
				},
				startDelay + step * flipDuration
			);
			timers.push(t);
		});
	}

	function syncCells(targets: string[]) {
		const len = targets.length;
		const prev = untrack(() => displayed);
		const newDisplayed = new Array<string>(len);
		const newFlipping = new Array<boolean>(len).fill(false);
		for (let i = 0; i < len; i++) {
			newDisplayed[i] = prev[i] ?? targets[i];
		}
		displayed = newDisplayed;
		flipping = newFlipping;
		for (let i = 0; i < len; i++) {
			scheduleCell(i, newDisplayed[i], targets[i]);
		}
	}

	onMount(() => {
		prefersReduced = isReducedMotion();
		const mq =
			typeof window !== 'undefined' && window.matchMedia
				? window.matchMedia('(prefers-reduced-motion: reduce)')
				: null;
		const onChange = (e: MediaQueryListEvent) => {
			prefersReduced = e.matches;
		};
		mq?.addEventListener?.('change', onChange);
		mounted = true;
		return () => {
			clearTimers();
			mq?.removeEventListener?.('change', onChange);
		};
	});

	$effect(() => {
		if (!mounted) return;
		clearTimers();
		syncCells(cells);
	});

	const allSettled = $derived(flipping.every((f) => !f));

	function isFlipping(idx: number): boolean {
		return flipping[idx] === true;
	}
</script>

<div
	class="sf-root sf-size-{size} {extraClass}"
	role="group"
	aria-live="polite"
	aria-busy={!allSettled}
	aria-label={value}
	data-charset={resolvedCharset.name}
>
	{#each cells as cellTarget, idx (idx)}
		{@const char = mounted ? (displayed[idx] ?? cellTarget) : cellTarget}
		<span
			class="sf-cell"
			class:sf-flipping={isFlipping(idx)}
			data-char={char}
			style:--sf-duration="{flipDuration}ms"
			aria-hidden="true"
		>
			<span class="sf-half sf-top">{char}</span>
			<span class="sf-half sf-bottom">{char}</span>
			<span class="sf-flap sf-flap-top">{char}</span>
			<span class="sf-flap sf-flap-bottom">{char}</span>
			<span class="sf-divider"></span>
		</span>
	{/each}
</div>

<style>
	.sf-root {
		--sf-bg: #0f172a;
		--sf-bg-hi: #1e293b;
		--sf-fg: #f8fafc;
		--sf-radius: 0.35rem;
		--sf-gap: 0.25rem;
		--sf-cell-w: 0.7em;
		--sf-cell-h: 1em;
		--sf-divider: rgba(0, 0, 0, 0.55);
		display: inline-flex;
		gap: var(--sf-gap);
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono',
			monospace;
		font-weight: 700;
		line-height: 1;
		color: var(--sf-fg);
		perspective: 800px;
		user-select: none;
	}

	.sf-size-sm {
		font-size: 1.5rem;
	}
	.sf-size-md {
		font-size: 2.25rem;
	}
	.sf-size-lg {
		font-size: 4rem;
	}

	.sf-cell {
		position: relative;
		display: inline-block;
		width: var(--sf-cell-w);
		height: var(--sf-cell-h);
		background: var(--sf-bg);
		border-radius: var(--sf-radius);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.06),
			0 2px 4px rgba(0, 0, 0, 0.35);
		overflow: hidden;
		transform-style: preserve-3d;
	}

	.sf-half {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 50%;
		overflow: hidden;
		pointer-events: none;
	}
	.sf-top {
		top: 0;
		align-items: flex-end;
	}
	.sf-top :global(*),
	.sf-top {
		line-height: 1;
	}
	.sf-bottom {
		bottom: 0;
		align-items: flex-start;
	}
	.sf-half {
		/* shift the glyph so each half shows the matching slice */
		font-size: 1em;
	}
	.sf-top {
		padding-top: 0.04em;
	}
	.sf-bottom {
		padding-bottom: 0.04em;
	}
	.sf-bottom {
		background: linear-gradient(180deg, var(--sf-bg-hi) 0%, var(--sf-bg) 100%);
	}
	.sf-top {
		background: linear-gradient(180deg, var(--sf-bg) 0%, var(--sf-bg-hi) 100%);
	}
	.sf-divider {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: var(--sf-divider);
		pointer-events: none;
	}

	.sf-flap {
		position: absolute;
		left: 0;
		right: 0;
		height: 50%;
		display: flex;
		justify-content: center;
		overflow: hidden;
		backface-visibility: hidden;
		transform-style: preserve-3d;
		pointer-events: none;
		opacity: 0;
	}
	.sf-flap-top {
		top: 0;
		align-items: flex-end;
		padding-top: 0.04em;
		background: linear-gradient(180deg, var(--sf-bg) 0%, var(--sf-bg-hi) 100%);
		transform-origin: bottom center;
	}
	.sf-flap-bottom {
		bottom: 0;
		align-items: flex-start;
		padding-bottom: 0.04em;
		background: linear-gradient(180deg, var(--sf-bg-hi) 0%, var(--sf-bg) 100%);
		transform-origin: top center;
		transform: rotateX(90deg);
	}

	.sf-flipping .sf-flap-top {
		opacity: 1;
		animation: sf-flap-down var(--sf-duration, 320ms) ease-in forwards;
	}
	.sf-flipping .sf-flap-bottom {
		opacity: 1;
		animation: sf-flap-up var(--sf-duration, 320ms) ease-out forwards;
	}

	@keyframes sf-flap-down {
		0% {
			transform: rotateX(0deg);
		}
		100% {
			transform: rotateX(-90deg);
		}
	}
	@keyframes sf-flap-up {
		0% {
			transform: rotateX(90deg);
		}
		100% {
			transform: rotateX(0deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sf-flipping .sf-flap-top,
		.sf-flipping .sf-flap-bottom {
			animation: none;
			opacity: 0;
		}
	}
</style>
