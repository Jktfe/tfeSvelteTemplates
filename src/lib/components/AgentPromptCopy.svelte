<!--
  ============================================================
  AgentPromptCopy
  ============================================================

  WHAT
  Generates a structured, click-to-copy "Copy this for your local
  agent" block for any component on the site. Drop it once on a
  component's demo route and a visitor (or another AI agent) gets
  a self-contained instruction block they can paste verbatim into
  their own coding agent to install + use the component.

  WHY
  TFE Svelte Templates is increasingly used as a "click and ship"
  catalogue, including by other agents. The prompt block is the
  bridge between this site and another agent's repo.

  FEATURES
  • Renders a structured prompt: deps, save paths, props, usage
  • One-click copy with success feedback
  • Pure CSS, zero external icon library
  • Respects reduced-motion preferences
  • Works without JS (the <pre> is selectable + readable)

  ACCESSIBILITY
  • Button: real <button>, aria-live region for "Copied!" state
  • Keyboard: Enter/Space copies, focus ring visible
  • Screen readers: code block has role="region" + aria-label

  USAGE
  <AgentPromptCopy
    name="ShineBorder"
    componentPath="src/lib/components/ShineBorder.svelte"
    demoPath="src/routes/shineborder/+page.svelte"
    deps={[]}
    propsSignature="{ borderRadius?: number; shineColor?: string; duration?: number }"
    usage={`<ShineBorder borderRadius={12}>\n  <button>Click me</button>\n</ShineBorder>`}
  />
  ============================================================
-->

<script lang="ts" module>
	export interface AgentPromptCopyProps {
		/** Component name as it should be imported (PascalCase) */
		name: string;
		/** One-sentence description so the agent knows the intent */
		summary?: string;
		/** Source file path relative to project root, defaults to src/lib/components/<name>.svelte */
		componentPath?: string;
		/** Demo route source path, defaults to src/routes/<slug>/+page.svelte */
		demoPath?: string;
		/** bun add deps required, e.g. ["gsap", "three"] */
		deps?: string[];
		/** TypeScript signature string for the props object */
		propsSignature?: string;
		/** A working <Component .../> example. Multi-line OK. */
		usage?: string;
		/** Inspiration / provenance line, e.g. "GreenSock pen xxmaNYj" */
		inspiredBy?: string;
		/** Notes for the receiving agent (e.g. "Client-only — wrap in onMount") */
		notes?: string;
		/**
		 * When `true`, drop the outer chrome (background, border, "For your agent"
		 * chip, "Copy this prompt to install …" heading) and render only the
		 * copyable prompt block + a single Copy button. Use when the parent
		 * already owns the section header — e.g. inside ComponentPageShell's
		 * sidebar.
		 */
		compact?: boolean;
	}

	export function buildAgentPrompt(input: AgentPromptCopyProps): string {
		const {
			name,
			summary,
			componentPath = `src/lib/components/${name}.svelte`,
			demoPath,
			deps = [],
			propsSignature,
			usage,
			inspiredBy,
			notes
		} = input;

		const lines: string[] = [];
		lines.push(`# Install ${name} into my Svelte 5 project`);
		if (summary) lines.push('', summary);
		lines.push('', '## 1. Install dependencies');
		lines.push(deps.length ? `bun add ${deps.join(' ')}` : '# No external dependencies');
		lines.push('', '## 2. Save component source');
		lines.push(
			`Copy the file at https://github.com/Jktfe/tfeSvelteTemplates/blob/main/${componentPath}`,
			`to ${componentPath} in your project.`
		);
		if (demoPath) {
			lines.push('', '## 3. (Optional) Save demo route');
			lines.push(`Copy https://github.com/Jktfe/tfeSvelteTemplates/blob/main/${demoPath} to ${demoPath}.`);
		}
		if (propsSignature) {
			lines.push('', '## 4. Props');
			lines.push('```ts', propsSignature.trim(), '```');
		}
		if (usage) {
			lines.push('', '## 5. Usage');
			lines.push('```svelte', usage.trim(), '```');
		}
		if (notes) {
			lines.push('', '## Notes');
			lines.push(notes.trim());
		}
		if (inspiredBy) {
			lines.push('', `_Inspired by ${inspiredBy}._`);
		}
		return lines.join('\n');
	}
</script>

<script lang="ts">
	import '$lib/styles/gsap-tokens.css';

	let {
		name,
		summary,
		componentPath,
		demoPath,
		deps = [],
		propsSignature,
		usage,
		inspiredBy,
		notes,
		compact = false
	}: AgentPromptCopyProps = $props();

	const prompt = $derived(
		buildAgentPrompt({ name, summary, componentPath, demoPath, deps, propsSignature, usage, inspiredBy, notes })
	);

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	function fallbackCopy(text: string): boolean {
		if (typeof document === 'undefined') return false;
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.left = '-9999px';
		textarea.style.top = '0';
		document.body.appendChild(textarea);
		textarea.select();

		try {
			return document.execCommand('copy');
		} catch {
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}

	async function copy() {
		let didCopy = false;
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(prompt);
				didCopy = true;
			}
		} catch {
			didCopy = false;
		}

		if (!didCopy) {
			didCopy = fallbackCopy(prompt);
		}

		copied = didCopy;
		if (didCopy) {
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2200);
		}
	}
</script>

{#if compact}
	<div class="agent-prompt agent-prompt--compact">
		<button
			type="button"
			class="agent-prompt__copy agent-prompt__copy--compact"
			onclick={copy}
			aria-live="polite"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{#if copied}
					<polyline points="3 8 7 12 13 4" />
				{:else}
					<rect x="4" y="4" width="9" height="9" rx="1.5" />
					<path d="M2.5 11V3a1 1 0 0 1 1-1h8" />
				{/if}
			</svg>
			<span>{copied ? 'Copied' : 'Copy install prompt'}</span>
		</button>
		<pre class="agent-prompt__body" role="region" aria-label="Agent install prompt"><code>{prompt}</code></pre>
	</div>
{:else}
	<section class="agent-prompt" aria-label="Copy this for your local agent">
		<header class="agent-prompt__header">
			<div class="agent-prompt__title">
				<span class="agent-prompt__chip">For your agent</span>
				<h3>Copy this prompt to install <code>{name}</code></h3>
			</div>
			<button type="button" class="agent-prompt__copy" onclick={copy} aria-live="polite">
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					{#if copied}
						<polyline points="3 8 7 12 13 4" />
					{:else}
						<rect x="4" y="4" width="9" height="9" rx="1.5" />
						<path d="M2.5 11V3a1 1 0 0 1 1-1h8" />
					{/if}
				</svg>
				<span>{copied ? 'Copied' : 'Copy prompt'}</span>
			</button>
		</header>

		<pre class="agent-prompt__body" role="region" aria-label="Agent install prompt"><code>{prompt}</code></pre>
	</section>
{/if}

<style>
	.agent-prompt {
		display: grid;
		gap: var(--gsap-space-3);
		box-sizing: border-box;
		min-width: 0;
		max-width: 100%;
		padding: var(--gsap-space-5);
		border: 1px solid var(--gsap-border-strong);
		border-radius: var(--gsap-radius-md);
		background: var(--gsap-surface-1);
		color: var(--gsap-fg);
		font-family: var(--gsap-font-sans);
		container-type: inline-size;
	}

	/*
	 * Compact variant — strip the outer chrome (no padding, no border,
	 * no background) so the parent container (e.g. ComponentPageShell's
	 * sidebar card) owns the framing. Renders only the code body and a
	 * single full-width copy button so the "For your agent" section
	 * doesn't double-up its title.
	 */
	.agent-prompt--compact {
		display: grid;
		gap: 8px;
		padding: 0;
		border: 0;
		background: transparent;
		font-family: var(--font-sans, var(--gsap-font-sans));
	}
	.agent-prompt__copy--compact {
		justify-self: stretch;
		width: 100%;
		justify-content: center;
		padding: 8px 12px;
		font-size: 12px;
		border-radius: var(--r-2, 4px);
		background: var(--accent, var(--gsap-accent));
		color: #fff;
		border-color: transparent;
	}
	.agent-prompt__copy--compact:hover {
		background: var(--accent-strong, var(--gsap-accent-hover));
		transform: none;
		box-shadow: none;
	}

	.agent-prompt__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--gsap-space-3);
		flex-wrap: wrap;
	}

	.agent-prompt__title {
		display: grid;
		gap: var(--gsap-space-2);
		min-width: 0;
	}

	.agent-prompt__chip {
		justify-self: start;
		padding: 2px 10px;
		border-radius: var(--gsap-radius-pill);
		background: var(--gsap-accent-soft);
		color: var(--gsap-accent);
		font-size: var(--gsap-text-xs);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.agent-prompt__title h3 {
		margin: 0;
		font-size: var(--gsap-text-md);
		font-weight: 700;
		color: var(--gsap-fg-strong);
		line-height: 1.3;
	}

	.agent-prompt__title code {
		padding: 0 6px;
		border-radius: var(--gsap-radius-xs);
		background: var(--gsap-surface-2);
		font-family: var(--gsap-font-mono);
		font-size: 0.95em;
	}

	.agent-prompt__copy {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid transparent;
		border-radius: var(--gsap-radius-pill);
		background: var(--gsap-accent);
		color: var(--gsap-accent-ink);
		font: inherit;
		font-size: var(--gsap-text-sm);
		font-weight: 600;
		cursor: pointer;
		transition:
			background var(--gsap-duration-fast) var(--gsap-ease-out),
			transform var(--gsap-duration-fast) var(--gsap-ease-out),
			box-shadow var(--gsap-duration-fast) var(--gsap-ease-out);
	}

	.agent-prompt__copy:hover {
		background: var(--gsap-accent-hover);
		transform: translateY(-1px);
		box-shadow: var(--gsap-shadow-glow);
	}

	.agent-prompt__copy:focus-visible {
		outline: 2px solid var(--gsap-accent);
		outline-offset: 2px;
	}

	.agent-prompt__body {
		box-sizing: border-box;
		min-width: 0;
		max-width: 100%;
		margin: 0;
		padding: var(--gsap-space-4);
		border-radius: var(--gsap-radius-sm);
		background: var(--gsap-surface-ink);
		color: var(--gsap-fg-on-ink);
		font-family: var(--gsap-font-mono);
		font-size: 0.82rem;
		line-height: 1.55;
		overflow-x: auto;
		white-space: pre;
		max-height: 360px;
		overflow-y: auto;
		scrollbar-color: color-mix(in srgb, var(--gsap-accent), transparent 35%) var(--gsap-surface-ink-1);
		scrollbar-width: thin;
	}

	.agent-prompt__body code {
		display: block;
		min-width: max-content;
		font: inherit;
		color: inherit;
	}

	.agent-prompt__body::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	.agent-prompt__body::-webkit-scrollbar-track {
		background: var(--gsap-surface-ink-1);
		border-radius: var(--gsap-radius-pill);
	}

	.agent-prompt__body::-webkit-scrollbar-thumb {
		border: 2px solid var(--gsap-surface-ink-1);
		border-radius: var(--gsap-radius-pill);
		background: color-mix(in srgb, var(--gsap-accent), var(--gsap-fg-on-ink) 18%);
	}

	.agent-prompt__body::-webkit-scrollbar-thumb:hover {
		background: var(--gsap-accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.agent-prompt__copy {
			transition: none;
		}
		.agent-prompt__copy:hover {
			transform: none;
		}
	}

	@container (max-width: 520px) {
		.agent-prompt__header {
			flex-direction: column;
		}
		.agent-prompt__copy {
			align-self: flex-start;
		}
	}
</style>
