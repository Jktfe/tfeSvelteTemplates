<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import BadgePill from '$lib/components/BadgePill.svelte';

	const shell = catalogShellPropsForSlug('/badgepill')!;

	let tags = $state(['Frontend', 'TypeScript', 'Svelte', 'Accessibility']);
	function removeTag(tag: string) { tags = tags.filter((t) => t !== tag); }
	function resetTags() { tags = ['Frontend', 'TypeScript', 'Svelte', 'Accessibility']; }

	const tones = ['neutral', 'info', 'success', 'warning', 'danger', 'brand'] as const;
	const variants = ['soft', 'solid', 'outline'] as const;
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Status', 'Tags', 'Theme-aware']}
	codeExplanation="BadgePill is one component, fifty-four looks: three variants (soft / solid / outline), six semantic tones (neutral / info / success / warning / danger / brand), and three sizes. Pass dot for a leading status indicator, dismissible for a × button. Children can be a snippet for richer content (icons, bold sub-strings, counters). All colour combinations meet WCAG AA contrast and the dismiss button is fully keyboard accessible."
>
	{#snippet demo()}
		<div class="bp-stack">
			<section class="bp-card">
				<h3 class="bp-h3">Variant × Tone matrix</h3>
				{#each variants as variant (variant)}
					<div class="bp-row">
						<span class="bp-row-label">{variant}</span>
						<div class="bp-row-pills">
							{#each tones as tone (tone)}
								<BadgePill label={tone} {tone} {variant} />
							{/each}
						</div>
					</div>
				{/each}
			</section>

			<section class="bp-card">
				<h3 class="bp-h3">Sizes</h3>
				<div class="bp-row-pills">
					<BadgePill label="Small" tone="info" size="sm" />
					<BadgePill label="Medium (default)" tone="info" size="md" />
					<BadgePill label="Large" tone="info" size="lg" />
				</div>
			</section>

			<section class="bp-card">
				<h3 class="bp-h3">Status indicators</h3>
				<div class="bp-row-pills">
					<BadgePill label="Active" tone="success" dot />
					<BadgePill label="Pending" tone="warning" dot />
					<BadgePill label="Failed" tone="danger" dot />
					<BadgePill label="Draft" tone="neutral" dot />
					<BadgePill label="Beta" tone="brand" dot variant="solid" />
					<BadgePill label="Reviewing" tone="info" dot variant="outline" />
				</div>
			</section>

			<section class="bp-card">
				<h3 class="bp-h3">Dismissible tag picker</h3>
				<div class="bp-row-pills">
					{#each tags as tag (tag)}
						<BadgePill label={tag} tone="info" dismissible onDismiss={() => removeTag(tag)} />
					{/each}
					{#if tags.length === 0}
						<span class="bp-empty">All tags dismissed.</span>
					{/if}
				</div>
				<button class="bp-reset" type="button" onclick={resetTags}>Reset tags</button>
			</section>

			<section class="bp-card">
				<h3 class="bp-h3">In context · pull request row</h3>
				<div class="bp-pr">
					<span class="bp-pr-num">#1247</span>
					<span class="bp-pr-title">feat: add BadgePill component to library</span>
					<BadgePill label="ready" tone="success" dot size="sm" />
					<BadgePill label="frontend" tone="info" variant="outline" size="sm" />
					<BadgePill label="needs-review" tone="warning" size="sm" />
					<BadgePill label="+12 / -3" tone="neutral" variant="outline" size="sm" />
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Pill text — required if you don't pass a children snippet.</td>
				</tr>
				<tr>
					<td><code>tone</code></td>
					<td><code>"neutral" | "info" | "success" | "warning" | "danger" | "brand"</code></td>
					<td><code>"neutral"</code></td>
					<td>Semantic colour family.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>"soft" | "solid" | "outline"</code></td>
					<td><code>"soft"</code></td>
					<td>Fill style.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>Padding and font scale.</td>
				</tr>
				<tr>
					<td><code>dot</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render a leading status dot in the tone colour.</td>
				</tr>
				<tr>
					<td><code>dismissible</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render a trailing × button.</td>
				</tr>
				<tr>
					<td><code>onDismiss</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Callback fired when × is pressed.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Custom inner content (overrides label).</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.bp-stack { display: grid; gap: 16px; }
	.bp-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.bp-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.bp-row {
		display: grid;
		gap: 6px;
	}
	.bp-row-label {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		color: var(--fg-3);
		letter-spacing: 0.08em;
	}
	.bp-row-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.bp-empty {
		font: italic 13px var(--font-sans);
		color: var(--fg-3);
	}
	.bp-reset {
		justify-self: start;
		padding: 0;
		background: transparent;
		border: 0;
		color: var(--accent);
		font: 500 13px var(--font-sans);
		cursor: pointer;
	}
	.bp-reset:hover { text-decoration: underline; }
	.bp-pr {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.bp-pr-num { font: 600 13px var(--font-mono); color: var(--fg-1); }
	.bp-pr-title { font-size: 13px; color: var(--fg-2); }
</style>
