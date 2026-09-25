<!--
  ============================================================
  EvidenceCard — Proof-of-Work Summary Card
  ============================================================
  WHAT — A card summarising the evidence for a piece of work: owner,
  timestamp, key/value facts, command results with truncated output, an
  optional screenshot link and an overall pass/fail status.

  WHY — Drop into review threads, PR dashboards or agent reports when
  "it works" needs receipts.

  FEATURES
  - Five statuses: pass / fail / running / blocked / info, each with a tone
  - Overall status derived from commands when not supplied
    (any fail → fail, then blocked, then running, all pass → pass)
  - Command output trimmed to 220 characters with an ellipsis
  - Optional linked evidence items and screenshot link
  - Pure helpers exported: statusLabel, statusTone, truncateOutput,
    overallEvidenceStatus

  ACCESSIBILITY
  - <article> with an aria-label naming the evidence
  - Status always written as text, never colour alone
  - Facts use a <dl>; command list is labelled
  - No motion

  DEPENDENCIES — Zero. Pure Svelte 5 runes and scoped CSS.

  PERFORMANCE — Static render; truncation keeps long logs cheap.

  USAGE
      <EvidenceCard
        title="Docs gate"
        owner="Agent B"
        commands={[{ command: 'bun run check', status: 'pass', duration: '41s' }]}
      />

  PROPS
  | Prop          | Type              | Default      | Description |
  |---------------|-------------------|--------------|-------------|
  | title         | string            | required     | Card heading |
  | owner         | string            | 'Unassigned' | Who owns the work |
  | status        | EvidenceStatus    | derived      | Overrides the status derived from commands |
  | summary       | string            | ''           | Short summary paragraph |
  | timestamp     | string            | ''           | When the evidence was captured |
  | commands      | EvidenceCommand[] | []           | Commands with status, duration and output |
  | items         | EvidenceItem[]    | []           | Label/value facts, optionally linked |
  | screenshotHref| string            | —            | Link to screenshot proof |
  | class         | string            | ''           | Extra classes on the article |
  ============================================================
-->
<script lang="ts" module>
	export type EvidenceStatus = 'pass' | 'fail' | 'running' | 'blocked' | 'info';

	export interface EvidenceItem {
		label: string;
		value: string;
		href?: string;
	}

	export interface EvidenceCommand {
		command: string;
		status: EvidenceStatus;
		duration?: string;
		output?: string;
	}

	export function statusLabel(status: EvidenceStatus): string {
		const labels: Record<EvidenceStatus, string> = {
			pass: 'Pass',
			fail: 'Fail',
			running: 'Running',
			blocked: 'Blocked',
			info: 'Info'
		};
		return labels[status];
	}

	export function statusTone(status: EvidenceStatus): 'good' | 'bad' | 'warn' | 'neutral' {
		if (status === 'pass') return 'good';
		if (status === 'fail') return 'bad';
		if (status === 'blocked') return 'warn';
		return 'neutral';
	}

	export function truncateOutput(output = '', maxLength = 220): string {
		const trimmed = output.trim();
		if (trimmed.length <= maxLength) return trimmed;
		return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
	}

	export function overallEvidenceStatus(commands: EvidenceCommand[]): EvidenceStatus {
		if (commands.some((command) => command.status === 'fail')) return 'fail';
		if (commands.some((command) => command.status === 'blocked')) return 'blocked';
		if (commands.some((command) => command.status === 'running')) return 'running';
		if (commands.length > 0 && commands.every((command) => command.status === 'pass')) return 'pass';
		return 'info';
	}
</script>

<script lang="ts">
	interface Props {
		title: string;
		owner?: string;
		status?: EvidenceStatus;
		summary?: string;
		timestamp?: string;
		commands?: EvidenceCommand[];
		items?: EvidenceItem[];
		screenshotHref?: string;
		class?: string;
	}

	let {
		title,
		owner = 'Unassigned',
		status,
		summary = '',
		timestamp = '',
		commands = [],
		items = [],
		screenshotHref,
		class: extraClass = ''
	}: Props = $props();

	const resolvedStatus = $derived(status ?? overallEvidenceStatus(commands));
	const tone = $derived(statusTone(resolvedStatus));
</script>

<article class="evidence-card evidence-card--{tone} {extraClass}" aria-label={`${title} evidence`}>
	<header class="ev-head">
		<div>
			<p class="ev-kicker">Evidence</p>
			<h3>{title}</h3>
		</div>
		<span class="ev-status ev-status--{tone}">{statusLabel(resolvedStatus)}</span>
	</header>

	<div class="ev-meta">
		<span><b>Owner</b> {owner}</span>
		{#if timestamp}<span><b>When</b> {timestamp}</span>{/if}
		{#if screenshotHref}<a href={screenshotHref}>Screenshot</a>{/if}
	</div>

	{#if summary}
		<p class="ev-summary">{summary}</p>
	{/if}

	{#if items.length}
		<dl class="ev-items">
			{#each items as item (item.label)}
				<div>
					<dt>{item.label}</dt>
					<dd>
						{#if item.href}
							<a href={item.href}>{item.value}</a>
						{:else}
							{item.value}
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
	{/if}

	{#if commands.length}
		<div class="ev-commands" aria-label="Command evidence">
			{#each commands as command (command.command)}
				<section class="ev-command ev-command--{statusTone(command.status)}">
					<header>
						<code>{command.command}</code>
						<span>{statusLabel(command.status)}{command.duration ? ` · ${command.duration}` : ''}</span>
					</header>
					{#if command.output}
						<pre>{truncateOutput(command.output)}</pre>
					{/if}
				</section>
			{/each}
		</div>
	{/if}
</article>

<style>
	/*
	 * THEMING — see docs/THEMING.md. Chrome tokens read the host's shared
	 * tokens (--fg-1, --surface, --border, ...) first and fall back to
	 * built-in light/dark values, so the component works standalone too.
	 * Status tones are semantic: each keeps its hue on both schemes and only
	 * lightens its text / deepens its tint in dark mode for legibility.
	 */
	.evidence-card {
		--evc-fg-1: var(--fg-1, #111827);
		--evc-fg-2: var(--fg-2, #4b5563);
		--evc-fg-3: var(--fg-3, #6b7280);
		--evc-border: var(--border, #d9dde5);
		--evc-surface: var(--surface, #fff);
		--evc-surface-2: var(--surface-2, #f8fafc);
		--evc-good-accent: #15803d;
		--evc-good-bg: #dcfce7;
		--evc-good-border: #86efac;
		--evc-bad-accent: #b91c1c;
		--evc-bad-bg: #fee2e2;
		--evc-bad-border: #fca5a5;
		--evc-warn-accent: #92400e;
		--evc-warn-bg: #fef3c7;
		--evc-warn-border: #fcd34d;
		--evc-neutral-accent: #315f9f;
		--evc-neutral-bg: #dbeafe;
		--evc-neutral-border: #93c5fd;
	}

	@media (prefers-color-scheme: dark) {
		.evidence-card {
			--evc-fg-1: var(--fg-1, #f3f4f6);
			--evc-fg-2: var(--fg-2, #cbd5e1);
			--evc-fg-3: var(--fg-3, #94a3b8);
			--evc-border: var(--border, #334155);
			--evc-surface: var(--surface, #111827);
			--evc-surface-2: var(--surface-2, #1f2937);
			--evc-good-accent: #86efac;
			--evc-good-bg: rgba(22, 163, 74, 0.2);
			--evc-good-border: #166534;
			--evc-bad-accent: #fca5a5;
			--evc-bad-bg: rgba(220, 38, 38, 0.2);
			--evc-bad-border: #991b1b;
			--evc-warn-accent: #fcd34d;
			--evc-warn-bg: rgba(245, 158, 11, 0.18);
			--evc-warn-border: #92400e;
			--evc-neutral-accent: #93c5fd;
			--evc-neutral-bg: rgba(37, 99, 235, 0.22);
			--evc-neutral-border: #1e40af;
		}
	}

	.evidence-card {
		display: grid;
		gap: 14px;
		padding: 18px;
		border: 1px solid var(--ev-border, var(--evc-border));
		border-left-width: 4px;
		border-radius: 6px;
		background: var(--evc-surface);
		color: var(--evc-fg-1);
	}

	.evidence-card--good { --ev-accent: var(--evc-good-accent); --ev-bg: var(--evc-good-bg); --ev-border: var(--evc-good-border); }
	.evidence-card--bad { --ev-accent: var(--evc-bad-accent); --ev-bg: var(--evc-bad-bg); --ev-border: var(--evc-bad-border); }
	.evidence-card--warn { --ev-accent: var(--evc-warn-accent); --ev-bg: var(--evc-warn-bg); --ev-border: var(--evc-warn-border); }
	.evidence-card--neutral { --ev-accent: var(--evc-neutral-accent); --ev-bg: var(--evc-neutral-bg); --ev-border: var(--evc-neutral-border); }

	.ev-head {
		display: flex;
		justify-content: space-between;
		gap: 14px;
		align-items: start;
	}

	.ev-kicker {
		margin: 0 0 5px;
		font: 800 10px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ev-accent);
	}

	.ev-head h3 {
		margin: 0;
		font: 800 1.15rem/1.05 var(--font-display, Georgia, serif);
	}

	.ev-status {
		flex: 0 0 auto;
		padding: 5px 8px;
		border-radius: 4px;
		background: var(--ev-bg);
		color: var(--ev-accent);
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.ev-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 14px;
		color: var(--evc-fg-2);
		font-size: 12px;
	}

	.ev-meta b {
		color: var(--evc-fg-1);
	}

	.ev-meta a,
	.ev-items a {
		color: var(--ev-accent);
		font-weight: 700;
	}

	.ev-summary {
		margin: 0;
		color: var(--evc-fg-2);
	}

	.ev-items {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 8px;
		margin: 0;
	}

	.ev-items div {
		padding: 10px;
		border: 1px solid var(--evc-border);
		background: var(--evc-surface-2);
	}

	.ev-items dt {
		margin-bottom: 4px;
		color: var(--evc-fg-3);
		font: 800 10px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.ev-items dd {
		margin: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.ev-commands {
		display: grid;
		gap: 8px;
	}

	.ev-command {
		border: 1px solid var(--evc-border);
		background: #0d1117;
		color: #e5edf5;
	}

	.ev-command header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 9px 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.ev-command code {
		font: 700 12px/1.3 var(--font-mono, ui-monospace, monospace);
	}

	.ev-command header span {
		flex: 0 0 auto;
		color: #a7f3d0;
		font: 800 10px/1.3 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.ev-command--bad header span { color: #fca5a5; }
	.ev-command--warn header span { color: #fcd34d; }
	.ev-command--neutral header span { color: #bfdbfe; }

	.ev-command pre {
		margin: 0;
		padding: 10px;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: #c9d1d9;
		font: 500 12px/1.45 var(--font-mono, ui-monospace, monospace);
	}

	@media (max-width: 640px) {
		.ev-head,
		.ev-command header {
			display: grid;
		}
	}
</style>
