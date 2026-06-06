<script lang="ts">
	import AgentLaneBoard from '$lib/components/AgentLaneBoard.svelte';
	import type { AgentLane } from '$lib/components/AgentLaneBoard.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/agentlaneboard')!;

	const lanes: AgentLane[] = [
		{
			id: 'batch-1',
			title: 'Batch 1 catalogue operations',
			owner: '@tfecodex',
			status: 'done',
			gate: 'Routes, docs, tests, screenshots, check, build, E2E',
			files: [
				'src/lib/components/ComponentHealthMatrix.svelte',
				'src/lib/components/EvidenceCard.svelte',
				'src/lib/components/CopyPasteComposer.svelte',
				'src/lib/components/ThemeTokenInspector.svelte'
			],
			evidence: ['1017 focused tests passed', 'Browser proof for four routes']
		},
		{
			id: 'batch-2',
			title: 'Room delivery visibility',
			owner: '@tfecodex',
			status: 'active',
			gate: 'AgentLaneBoard + RoutePreviewRail live with screenshot proof',
			eta: 'Tonight',
			files: [
				'src/lib/components/AgentLaneBoard.svelte',
				'src/lib/components/RoutePreviewRail.svelte'
			]
		},
		{
			id: 'qa',
			title: 'Claude QA sweep',
			owner: '@claude',
			status: 'review',
			gate: 'Audit visible routes, source contracts, and missing test debt',
			eta: 'Morning'
		},
		{
			id: 'visual-lab',
			title: 'Interaction lab follow-on',
			owner: '@tfecodex',
			status: 'active',
			gate: 'Motion/debug routes ship after operations components are clean',
			eta: 'Morning'
		}
	];

const usageSnippet = `<script lang="ts">
  import AgentLaneBoard from '$lib/components/AgentLaneBoard.svelte';
</${'script'}>

<AgentLaneBoard
  lanes={[
    {
      id: 'qa',
      title: 'Claude QA sweep',
      owner: '@claude',
      status: 'review',
      gate: 'Audit visible routes and test evidence'
    }
  ]}
/>`;
</script>

<svelte:head>
	<title>{shell.item.name} - TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Delivery', 'Agents', 'QA']}
	codeExplanation="AgentLaneBoard keeps delivery state explicit: each lane has one owner, one status, one acceptance gate, and optional files/evidence. Blocked lanes are raised first so room operators can act before review stalls."
>
	{#snippet demo()}
		<AgentLaneBoard {lanes} title="TFE morning delivery board" />
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>lanes</code></td><td><code>AgentLane[]</code></td><td>Delivery lanes with owner, status, gate, files, and evidence.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Board heading.</td></tr>
				<tr><td><code>subtitle</code></td><td><code>string</code></td><td>Context text below the heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
