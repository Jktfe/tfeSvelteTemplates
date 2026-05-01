<!--
	============================================================
	ComponentPageShell
	============================================================

	WHAT
	The canonical layout shell for every TFE component demo page.
	Renders a consistent header + sidebar shell so all 100+
	component routes share the same anatomy:

	  ┌──────────────────────────────────────────────────┐
	  │  Components / <Category> / <Name>               │   breadcrumb
	  │  <NAME>                                          │   Anton title
	  │  Short description of what this component does.  │   Plex lede
	  ├───────────────────────────┬──────────────────────┤
	  │  Live Demo                │  Installation        │
	  │  ▢▢▢ (slot: demo)         │  Dependencies        │
	  │  Implementation           │  Agent Instructions  │
	  │  ```svelte                │  Resources           │
	  │  <Component ... />        │  Tags                │
	  │  ``` (slot: code)         │                      │
	  │  Code explanation prose   │                      │
	  │  API table (slot: api)    │                      │
	  └───────────────────────────┴──────────────────────┘

	WHY
	The .pen design (tfeconcepts.pen) defines this anatomy as the
	standard. Existing demo pages can adopt the shell by wrapping
	their content with named snippets. No rewrite required —
	everything you don't pass is simply omitted.

	ACCESSIBILITY
	• Each section is a real <section> with an aria-labelledby
	• Headings step h1 → h2 → h3 in document order
	• Code blocks have role="region" + aria-label

	USAGE
	<ComponentPageShell
	  name="MagicCard"
	  category="Cards & Layout"
	  description="Cards with mouse-tracking spotlight effects."
	  install="cp src/lib/components/MagicCard.svelte ./src/lib"
	  dependencies={['Svelte 5+', 'Zero external dependencies']}
	  source="src/lib/components/MagicCard.svelte"
	  demoPath="src/routes/magiccard/+page.svelte"
	  agentSteps={[
	    'Copy MagicCard.svelte into your project.',
	    'Import and wrap any element to add a spotlight.',
	    'Tune gradientColor as an RGBA hex string.'
	  ]}
	  tags={['Svelte 5', 'Hover', 'CSS', 'Theme-aware']}
	  resources={[
	    { label: 'Source', href: '...' },
	    { label: 'Tests', href: '...' }
	  ]}
	  usageSnippet={`<MagicCard gradientColor="#D9F99D40" />`}
	  codeExplanation="Tracks pointer position…"
	>
	  {#snippet demo()}<MagicCardDemo />{/snippet}
	  {#snippet api()}<table>…</table>{/snippet}
	</ComponentPageShell>

	PROPS
	| name             | required | what                                   |
	|------------------|----------|----------------------------------------|
	| name             | yes      | Component display name (PascalCase ok) |
	| category         | yes      | Category label, e.g. 'Cards & Layout'  |
	| description      | yes      | One-sentence summary                   |
	| install          | no       | Shell command shown in install card    |
	| dependencies     | no       | List of strings                        |
	| source           | no       | Path to source file (auto-resources)   |
	| demoPath         | no       | Path to demo file                      |
	| agentSteps       | no       | Numbered prose for the agent card      |
	| tags             | no       | Chip strings                           |
	| resources        | no       | { label, href }[]                      |
	| usageSnippet     | no       | Code inside the implementation block   |
	| codeExplanation  | no       | Prose paragraph beneath the code       |

	SNIPPETS
	| name | what                                              |
	|------|---------------------------------------------------|
	| demo | The interactive demo (required-ish)              |
	| api  | The API/props table or list                       |

	The agent prompt block wraps the existing AgentPromptCopy
	component so identical install instructions render across
	the whole site.
-->

<script lang="ts" module>
	export interface ResourceLink {
		label: string;
		href: string;
	}

	export interface ComponentPageShellProps {
		name: string;
		category: string;
		description: string;
		install?: string;
		dependencies?: string[];
		source?: string;
		demoPath?: string;
		agentSteps?: string[];
		tags?: string[];
		resources?: ResourceLink[];
		usageSnippet?: string;
		codeExplanation?: string;
		/** Override the filename CodeBlock displays in its title bar (defaults to `${name}.svelte`) */
		codeFileName?: string;
		/** Override the syntax language for the Implementation snippet (defaults to 'svelte') */
		codeLanguage?: string;
		demo?: import('svelte').Snippet;
		api?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	import AgentPromptCopy from './AgentPromptCopy.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import CopyButton from './CopyButton.svelte';

	let {
		name,
		category,
		description,
		install,
		dependencies = [],
		source,
		demoPath,
		agentSteps = [],
		tags = [],
		resources = [],
		usageSnippet,
		codeExplanation,
		codeFileName,
		codeLanguage = 'svelte',
		demo,
		api
	}: ComponentPageShellProps = $props();

	const resolvedFileName = $derived(codeFileName ?? `${name}.svelte`);
</script>

<article class="cp-page">
	<div class="cp-wrap">
		<!-- ===== Header ===== -->
		<header class="cp-head">
			<div class="cp-crumb">
				<a href="/">Components</a> <span aria-hidden="true">/</span>
				<a href="/#components">{category}</a> <span aria-hidden="true">/</span>
				<b>{name}</b>
			</div>
			<h1 class="cp-title">{name}</h1>
			<p class="cp-desc">{description}</p>
		</header>

		<!-- ===== Two-col body ===== -->
		<div class="cp-body">
			<div class="cp-main">
				<!-- Live Demo -->
				<section class="cp-card cp-demo" aria-labelledby="cp-demo-title">
					<header class="cp-card__head">
						<h2 id="cp-demo-title">Live demo</h2>
						<span class="cp-eyebrow">01</span>
					</header>
					<div class="cp-demo__shell">
						{#if demo}{@render demo()}{:else}
							<div class="cp-demo__placeholder">
								<p>Drop your interactive demo into this slot.</p>
							</div>
						{/if}
					</div>
				</section>

				<!-- Implementation -->
				{#if usageSnippet || codeExplanation}
					<section class="cp-card" aria-labelledby="cp-impl-title">
						<header class="cp-card__head">
							<h2 id="cp-impl-title">Implementation</h2>
							<span class="cp-eyebrow">02</span>
						</header>
						{#if usageSnippet}
							<CodeBlock
								code={usageSnippet}
								variant="titled"
								size="md"
								language={codeLanguage}
								fileName={resolvedFileName}
								copyable
							/>
						{/if}
						{#if codeExplanation}
							<p class="cp-prose">{codeExplanation}</p>
						{/if}
					</section>
				{/if}

				<!-- API -->
				{#if api}
					<section class="cp-card" aria-labelledby="cp-api-title">
						<header class="cp-card__head">
							<h2 id="cp-api-title">API</h2>
							<span class="cp-eyebrow">03</span>
						</header>
						<div class="cp-api">{@render api()}</div>
					</section>
				{/if}
			</div>

			<!-- ===== Sidebar ===== -->
			<aside class="cp-side" aria-label="Component metadata">
				{#if install}
					<section class="cp-card cp-card--side" aria-labelledby="cp-install-title">
						<header class="cp-card__head">
							<h3 id="cp-install-title">Installation</h3>
							<CopyButton value={install} variant="icon" size="sm" ariaLabel="Copy install command" />
						</header>
						<pre class="cp-install"><code>{install}</code></pre>
					</section>
				{/if}

				{#if dependencies.length}
					<section class="cp-card cp-card--side" aria-labelledby="cp-deps-title">
						<header class="cp-card__head">
							<h3 id="cp-deps-title">Dependencies</h3>
						</header>
						<ul class="cp-list">
							{#each dependencies as dep}
								<li>{dep}</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if agentSteps.length || source}
					<section class="cp-card cp-card--side cp-card--agent" aria-labelledby="cp-agent-title">
						<header class="cp-card__head">
							<h3 id="cp-agent-title">For your agent</h3>
						</header>
						{#if agentSteps.length}
							<ol class="cp-steps">
								{#each agentSteps as step, i}
									<li><b>{String(i + 1).padStart(2, '0')}</b><span>{step}</span></li>
								{/each}
							</ol>
						{/if}
						<AgentPromptCopy
							{name}
							summary={description}
							componentPath={source}
							demoPath={demoPath}
							deps={[]}
							usage={usageSnippet}
						/>
					</section>
				{/if}

				{#if resources.length}
					<section class="cp-card cp-card--side" aria-labelledby="cp-res-title">
						<header class="cp-card__head">
							<h3 id="cp-res-title">Resources</h3>
						</header>
						<ul class="cp-list cp-list--links">
							{#each resources as r}
								<li>
									<a href={r.href} rel={r.href.startsWith('http') ? 'noopener noreferrer' : undefined} target={r.href.startsWith('http') ? '_blank' : undefined}>
										{r.label}
										{#if r.href.startsWith('http')}<span aria-hidden="true">↗</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if tags.length}
					<section class="cp-card cp-card--side" aria-labelledby="cp-tags-title">
						<header class="cp-card__head">
							<h3 id="cp-tags-title">Tags</h3>
						</header>
						<div class="cp-chips">
							{#each tags as tag}
								<span class="cp-chip">{tag}</span>
							{/each}
						</div>
					</section>
				{/if}
			</aside>
		</div>
	</div>
</article>

<style>
	.cp-page {
		background: var(--bg);
		color: var(--fg);
		font-family: var(--font-sans);
		padding: 56px 0 96px;
	}
	.cp-wrap {
		max-width: var(--container, 1320px);
		margin: 0 auto;
		padding: 0 32px;
	}

	/* ===== Header ===== */
	.cp-head {
		border-bottom: 1px solid var(--border);
		padding-bottom: 32px;
		margin-bottom: 40px;
	}
	.cp-crumb {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	.cp-crumb a {
		color: var(--fg-3);
		text-decoration: none;
		transition: color var(--dur-fast);
	}
	.cp-crumb a:hover {
		color: var(--fg-1);
	}
	.cp-crumb b {
		color: var(--fg-1);
		font-weight: 500;
	}
	.cp-title {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(48px, 6vw, 96px);
		line-height: 0.95;
		text-transform: uppercase;
		letter-spacing: 0.005em;
		margin: 0 0 16px;
		color: var(--fg-1);
	}
	.cp-desc {
		font-size: 18px;
		line-height: 1.55;
		color: var(--fg-2);
		max-width: 64ch;
		margin: 0;
	}

	/* ===== Body ===== */
	.cp-body {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 32px;
		align-items: start;
	}
	.cp-main {
		display: grid;
		gap: 24px;
		min-width: 0;
	}
	.cp-side {
		display: grid;
		gap: 16px;
		position: sticky;
		top: 96px;
	}

	/* ===== Card ===== */
	.cp-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-3);
		padding: 24px;
		min-width: 0;
	}
	.cp-card--side {
		padding: 18px 20px;
	}
	.cp-card__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}
	.cp-card__head h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 28px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		line-height: 1;
		color: var(--fg-1);
	}
	.cp-card__head h3 {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin: 0;
		color: var(--fg-3);
		font-weight: 500;
	}
	.cp-eyebrow {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		color: var(--fg-3);
		text-transform: uppercase;
	}

	/* ===== Demo shell ===== */
	.cp-demo {
		padding: 24px 24px 28px;
	}
	.cp-demo__shell {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 24px;
		min-height: 320px;
	}
	.cp-demo__placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 280px;
		color: var(--fg-3);
		font-style: italic;
	}

	/* ===== Code blocks ===== */
	/* Install command — small inline pre, copy is handled by <CopyButton /> in the header */
	.cp-install {
		margin: 0;
		padding: 12px 14px;
		background: var(--tfe-ink);
		color: var(--fg-on-dark, #f6f5f1);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.5;
		border-radius: var(--r-2);
		overflow-x: auto;
		white-space: pre;
	}
	.cp-install code {
		font: inherit;
		color: inherit;
	}

	.cp-prose {
		margin: 16px 0 0;
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.6;
	}

	/* ===== API ===== */
	.cp-api :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.cp-api :global(th),
	.cp-api :global(td) {
		text-align: left;
		padding: 12px 14px;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}
	.cp-api :global(th) {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
		background: var(--surface-2);
	}
	.cp-api :global(code) {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
	}

	/* ===== Sidebar lists ===== */
	.cp-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 8px;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}
	.cp-list--links a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.cp-list--links a:hover {
		color: var(--accent-strong);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.cp-steps {
		list-style: none;
		padding: 0;
		margin: 0 0 16px;
		display: grid;
		gap: 8px;
	}
	.cp-steps li {
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 10px;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}
	.cp-steps li b {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		color: var(--accent);
		letter-spacing: 0.06em;
	}

	/* ===== Chips ===== */
	.cp-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cp-chip {
		padding: 4px 10px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border: 1px solid var(--border-strong);
		border-radius: var(--r-pill);
		color: var(--fg-2);
		background: var(--surface-2);
	}

	/* ===== Responsive ===== */
	@media (max-width: 1024px) {
		.cp-body {
			grid-template-columns: 1fr;
		}
		.cp-side {
			position: static;
		}
	}
	@media (max-width: 720px) {
		.cp-wrap {
			padding: 0 20px;
		}
		.cp-page {
			padding: 32px 0 64px;
		}
		.cp-card {
			padding: 18px;
		}
		.cp-card--side {
			padding: 16px 18px;
		}
		.cp-title {
			font-size: clamp(40px, 9vw, 64px);
		}
	}
</style>
