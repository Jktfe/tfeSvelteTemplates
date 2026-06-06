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
	.evidence-card {
		display: grid;
		gap: 14px;
		padding: 18px;
		border: 1px solid var(--ev-border, #d9dde5);
		border-left-width: 4px;
		border-radius: 6px;
		background: var(--surface, #fff);
		color: var(--fg-1, #111827);
	}

	.evidence-card--good { --ev-accent: #15803d; --ev-bg: #dcfce7; --ev-border: #86efac; }
	.evidence-card--bad { --ev-accent: #b91c1c; --ev-bg: #fee2e2; --ev-border: #fca5a5; }
	.evidence-card--warn { --ev-accent: #92400e; --ev-bg: #fef3c7; --ev-border: #fcd34d; }
	.evidence-card--neutral { --ev-accent: #315f9f; --ev-bg: #dbeafe; --ev-border: #93c5fd; }

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
		color: var(--fg-2, #4b5563);
		font-size: 12px;
	}

	.ev-meta b {
		color: var(--fg-1, #111827);
	}

	.ev-meta a,
	.ev-items a {
		color: var(--ev-accent);
		font-weight: 700;
	}

	.ev-summary {
		margin: 0;
		color: var(--fg-2, #4b5563);
	}

	.ev-items {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 8px;
		margin: 0;
	}

	.ev-items div {
		padding: 10px;
		border: 1px solid var(--border, #d9dde5);
		background: var(--surface-2, #f8fafc);
	}

	.ev-items dt {
		margin-bottom: 4px;
		color: var(--fg-3, #6b7280);
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
		border: 1px solid var(--border, #d9dde5);
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
