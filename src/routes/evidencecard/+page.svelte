<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import EvidenceCard from '$lib/components/EvidenceCard.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/evidencecard')!;

const usageSnippet = `<script lang="ts">
  import EvidenceCard from '$lib/components/EvidenceCard.svelte';
</${'script'}>

<EvidenceCard
  title="Release gate"
  owner="@tfecodex"
  commands={[
    { command: 'bun run check', status: 'pass', output: '0 errors, 0 warnings' },
    { command: 'bun run test', status: 'pass', output: '3,790 tests passed' }
  ]}
/>`;
</script>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'QA', 'Evidence', 'Delivery']}
	codeExplanation="EvidenceCard turns raw proof into a compact reportable surface: command status, output excerpts, owner, timestamp, linked files, and screenshot proof. Failed commands dominate the overall status, so the card can be dropped into dashboards without extra glue code."
>
	{#snippet demo()}
		<div class="ev-demo">
			<EvidenceCard
				title="Trust gates restored"
				owner="@tfecodex"
				timestamp="2026-06-05 23:58"
				summary="Quality gates are back to a usable baseline after Svelte diagnostics, Vitest, and E2E updates."
				items={[
					{ label: 'Route', value: '/componenthealthmatrix', href: '/componenthealthmatrix' },
					{ label: 'Files changed', value: 'Component, docs, route, tests' }
				]}
				commands={[
					{ command: 'bun run check', status: 'pass', duration: '15.8s', output: 'svelte-check found 0 errors and 0 warnings' },
					{ command: 'bun run test', status: 'pass', duration: '13.3s', output: '126 test files passed; 3,790 tests passed' },
					{ command: 'bun run test:e2e -- tests/home.spec.ts', status: 'pass', duration: '1.2m', output: '16 passed' }
				]}
			/>

			<EvidenceCard
				title="External dependency review"
				owner="@claude"
				status="blocked"
				summary="Waiting on screenshot proof from a mobile viewport before marking visual QA complete."
				commands={[
					{ command: 'browser screenshot /evidencecard', status: 'blocked', output: 'No screenshot attached yet.' }
				]}
			/>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Card heading.</td></tr>
				<tr><td><code>commands</code></td><td><code>EvidenceCommand[]</code></td><td>Command/status/output evidence.</td></tr>
				<tr><td><code>items</code></td><td><code>EvidenceItem[]</code></td><td>Label/value facts with optional links.</td></tr>
				<tr><td><code>status</code></td><td><code>EvidenceStatus</code></td><td>Optional manual overall status.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ev-demo {
		display: grid;
		gap: 16px;
	}
</style>
