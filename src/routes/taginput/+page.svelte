<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TagInput from '$lib/components/TagInput.svelte';

	const shell = catalogShellPropsForSlug('/taginput')!;

	// Variant 1 — basic, bindable, with a live state strip.
	let skills = $state<string[]>(['Svelte', 'TypeScript']);

	// Variant 2 — capped at 5 to demonstrate the limit hint.
	let topics = $state<string[]>(['design', 'a11y']);

	// Variant 3 — custom validate(): only lowercase letters and dashes.
	let slugs = $state<string[]>(['hero-banner']);
	const slugRule = (tag: string) => /^[a-z][a-z0-9-]*$/.test(tag);

	// Variant 4 — case-sensitive dedupe so "JS" and "js" both survive.
	let codes = $state<string[]>(['JS', 'CSS']);

	const codeExplanation =
		'TagInput wraps a chip list and a text input in a single role="group". Enter or comma commits the draft through one tryAdd() gate that trims, dedupes (case-insensitive by default), checks the max cap, and runs your optional validate(tag). Backspace on an empty input arms then removes the last chip — a two-step gesture that protects fast typists. Pasting a comma- or newline-separated list splits and adds each piece, and every rejection is announced through a polite aria-live region.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-deps', 'Bindable']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ti-demo">
			<section class="ti-section">
				<h3>Basic · bindable value</h3>
				<p class="ti-hint">
					Type and press Enter or comma. Backspace on the empty box removes the last chip.
				</p>
				<TagInput bind:value={skills} ariaLabel="Skills" placeholder="Add a skill…" />
				<p class="ti-state">
					value = <code>[{skills.map((s) => `"${s}"`).join(', ')}]</code>
				</p>
			</section>

			<section class="ti-section">
				<h3>Capped · max five</h3>
				<p class="ti-hint">
					Adds are refused once five tags exist; try pasting <code>x, y, z, w, v, u</code>.
				</p>
				<TagInput bind:value={topics} max={5} ariaLabel="Topics" placeholder="Add a topic…" />
			</section>

			<section class="ti-section">
				<h3>Validated · slug format only</h3>
				<p class="ti-hint">
					Only lowercase slugs pass <code>validate()</code>; "Hero Banner" is rejected, "hero-banner" is fine.
				</p>
				<TagInput
					bind:value={slugs}
					validate={slugRule}
					ariaLabel="Slugs"
					placeholder="lowercase-slug…"
				/>
			</section>

			<section class="ti-section">
				<h3>Case-sensitive dedupe</h3>
				<p class="ti-hint">
					With <code>caseSensitive</code>, "JS" and "js" are treated as distinct tags.
				</p>
				<TagInput
					bind:value={codes}
					caseSensitive
					ariaLabel="Codes"
					placeholder="Add a code…"
				/>
			</section>

			<section class="ti-section">
				<h3>Disabled</h3>
				<p class="ti-hint">Read-only state — no editing or removal.</p>
				<TagInput value={['locked', 'archived']} disabled ariaLabel="Locked tags" />
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
					<td><code>value</code></td>
					<td><code>string[]</code> (bindable)</td>
					<td><code>[]</code></td>
					<td>The committed tags; flows both ways via <code>bind:value</code>.</td>
				</tr>
				<tr>
					<td><code>placeholder</code></td>
					<td><code>string</code></td>
					<td><code>'Add a tag…'</code></td>
					<td>Placeholder for the text input (hidden at capacity).</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>Infinity</code></td>
					<td>Maximum number of tags allowed.</td>
				</tr>
				<tr>
					<td><code>caseSensitive</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Treat differently-cased tags as distinct when deduping.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disable the whole control.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Tags'</code></td>
					<td>Accessible name for the group and the add-input.</td>
				</tr>
				<tr>
					<td><code>validate</code></td>
					<td><code>(tag: string) =&gt; boolean</code></td>
					<td><code>() =&gt; true</code></td>
					<td>Return <code>false</code> to reject a candidate tag.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ti-demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.ti-section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		max-width: 32rem;
	}

	.ti-section h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.ti-hint {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.ti-state {
		margin: 0;
		font-size: 0.82rem;
		opacity: 0.85;
	}

	.ti-state code,
	.ti-hint code {
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
		background: rgba(127, 127, 127, 0.15);
		font-size: 0.8rem;
	}

	@media (max-width: 640px) {
		.ti-demo {
			gap: 1.5rem;
		}
	}
</style>
