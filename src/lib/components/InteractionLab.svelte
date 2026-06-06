<script lang="ts" module>
	export type InteractionMode = 'hover' | 'press' | 'drag' | 'keyboard';

	export interface InteractionScenario {
		id: string;
		label: string;
		mode: InteractionMode;
		durationMs: number;
		easing: string;
		risk: 'low' | 'medium' | 'high';
	}

	export function clampDuration(durationMs: number): number {
		return Math.min(1200, Math.max(80, Math.round(durationMs)));
	}

	export function motionReadiness(scenario: InteractionScenario, reducedMotion = false): string {
		if (reducedMotion && scenario.durationMs > 0) return 'Needs reduced-motion fallback';
		if (scenario.mode === 'drag' && scenario.risk !== 'low') return 'Needs pointer edge-case tests';
		if (scenario.durationMs > 700) return 'Review timing';
		return 'Ready';
	}

	export function modeCount(
		scenarios: InteractionScenario[]
	): Record<InteractionMode, number> {
		return scenarios.reduce(
			(counts, scenario) => {
				counts[scenario.mode] += 1;
				return counts;
			},
			{ hover: 0, press: 0, drag: 0, keyboard: 0 } satisfies Record<InteractionMode, number>
		);
	}
</script>

<script lang="ts">
	interface Props {
		scenarios: InteractionScenario[];
		title?: string;
		class?: string;
	}

	let { scenarios, title = 'Interaction lab', class: extraClass = '' }: Props = $props();

	let activeId = $state('');
	let reducedMotion = $state(false);

	$effect(() => {
		if (!activeId && scenarios[0]) activeId = scenarios[0].id;
	});

	const active = $derived(scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0]);
	const counts = $derived(modeCount(scenarios));
</script>

<section class="interaction-lab {extraClass}" aria-labelledby="interaction-lab-title">
	<header>
		<div>
			<p>Interaction QA</p>
			<h2 id="interaction-lab-title">{title}</h2>
		</div>
		<label>
			<input bind:checked={reducedMotion} type="checkbox" />
			<span>Reduced motion</span>
		</label>
	</header>

	<div class="il-layout">
		<nav aria-label="Interaction scenarios">
			{#each scenarios as scenario (scenario.id)}
				<button
					type="button"
					class:active={scenario.id === active?.id}
					onclick={() => (activeId = scenario.id)}
				>
					<span>{scenario.mode}</span>
					{scenario.label}
				</button>
			{/each}
		</nav>

		{#if active}
			<article class="il-stage">
				<div
					class="il-target il-target--{active.mode}"
					style={`--duration: ${reducedMotion ? 80 : clampDuration(active.durationMs)}ms; --ease: ${active.easing}`}
				>
					<span>{active.mode}</span>
				</div>
				<div class="il-detail">
					<h3>{active.label}</h3>
					<p>{motionReadiness(active, reducedMotion)}</p>
					<dl>
						<div><dt>Duration</dt><dd>{clampDuration(active.durationMs)}ms</dd></div>
						<div><dt>Easing</dt><dd>{active.easing}</dd></div>
						<div><dt>Risk</dt><dd>{active.risk}</dd></div>
					</dl>
				</div>
			</article>
		{/if}
	</div>

	<footer aria-label="Mode counts">
		{#each (['hover', 'press', 'drag', 'keyboard'] as InteractionMode[]) as mode (mode)}
			<span>{mode}: <b>{counts[mode]}</b></span>
		{/each}
	</footer>
</section>

<style>
	.interaction-lab {
		display: grid;
		gap: 18px;
	}

	.interaction-lab header {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		align-items: end;
	}

	.interaction-lab header p {
		margin: 0 0 6px;
		color: #6d28d9;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.interaction-lab h2,
	.interaction-lab h3 {
		margin: 0;
		font-family: var(--font-display, Georgia, serif);
	}

	.interaction-lab h2 {
		font-size: clamp(1.7rem, 3vw, 2.5rem);
		line-height: 1;
	}

	.interaction-lab header label {
		display: flex;
		gap: 8px;
		align-items: center;
		font-weight: 800;
	}

	.il-layout {
		display: grid;
		grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
		gap: 14px;
	}

	.il-layout nav {
		display: grid;
		gap: 8px;
	}

	.il-layout button {
		display: grid;
		gap: 5px;
		padding: 11px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.il-layout button.active {
		border-color: #6d28d9;
		box-shadow: 0 0 0 2px rgba(109, 40, 217, 0.14);
	}

	.il-layout button span,
	.interaction-lab footer span,
	.il-detail dt {
		color: var(--fg-3, #6b7280);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.il-stage {
		display: grid;
		grid-template-columns: minmax(220px, 1fr) minmax(220px, 0.85fr);
		gap: 14px;
		align-items: stretch;
		padding: 16px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: #fafafa;
	}

	.il-target {
		display: grid;
		min-height: 240px;
		place-items: center;
		border-radius: 6px;
		background: #111827;
		color: white;
		transition:
			transform var(--duration) var(--ease),
			background var(--duration) var(--ease);
	}

	.il-target span {
		padding: 9px 12px;
		border: 1px solid rgba(255, 255, 255, 0.28);
		border-radius: 4px;
		font: 900 12px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.il-target--hover:hover { transform: translateY(-8px); background: #0f766e; }
	.il-target--press:hover { transform: scale(0.96); background: #9f1239; }
	.il-target--drag:hover { transform: translateX(18px) rotate(2deg); background: #b45309; }
	.il-target--keyboard:focus-within,
	.il-target--keyboard:hover { transform: scale(1.03); background: #2563eb; }

	.il-detail {
		display: grid;
		align-content: start;
		gap: 12px;
	}

	.il-detail p {
		margin: 0;
		color: #6d28d9;
		font-weight: 850;
	}

	.il-detail dl {
		display: grid;
		gap: 8px;
		margin: 0;
	}

	.il-detail dd {
		margin: 3px 0 0;
		font-weight: 800;
	}

	.interaction-lab footer {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.interaction-lab footer span {
		padding: 7px 9px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 4px;
	}

	@media (max-width: 780px) {
		.interaction-lab header,
		.il-layout,
		.il-stage {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>
