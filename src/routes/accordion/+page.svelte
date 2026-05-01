<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Accordion from '$lib/components/Accordion.svelte';

	const shell = catalogShellPropsForSlug('/accordion')!;

	const faqs = [
		{
			id: 'shipping',
			title: 'How long does shipping take?',
			content:
				'Standard delivery is 3–5 business days within the UK. Express delivery (1–2 days) is available at checkout for £4.99 extra. International shipping varies by destination.'
		},
		{
			id: 'returns',
			title: 'What is your returns policy?',
			content:
				'30 days, full refund, no questions asked. Return shipping is free for UK customers. Items must be unused and in original packaging. Refunds are processed within 5 working days.'
		},
		{
			id: 'support',
			title: 'How do I contact support?',
			content:
				'Email support@example.com or use the chat widget in the bottom-right corner of any page. Available 9am–6pm GMT, Monday to Friday.'
		}
	];

	const settings = [
		{
			id: 'general',
			title: 'General preferences',
			content: 'Language, timezone, and date format settings. Changes apply immediately and sync across devices.'
		},
		{
			id: 'notifications',
			title: 'Notifications',
			content: 'Configure email, push, and in-app notifications. You can mute specific channels during quiet hours.'
		},
		{
			id: 'privacy',
			title: 'Privacy & data',
			content: 'Control how your data is used, manage cookie preferences, and download or delete your account history.'
		}
	];

	const features = [
		{
			id: 'a',
			title: 'Single mode (default)',
			content: 'Click a header to open it; opening another closes the previous one.'
		},
		{
			id: 'b',
			title: 'Multiple open',
			content: 'Set the multiple prop and any number can be open at once.'
		},
		{
			id: 'c',
			title: 'Disabled items',
			content: 'Mark an item disabled and the trigger becomes non-interactive.',
			disabled: true
		}
	];

	let lastEvent = $state('—');

	function logToggle(id: string, isOpen: boolean) {
		lastEvent = `${id} → ${isOpen ? 'opened' : 'closed'}`;
	}

	const codeExplanation =
		'The expand/collapse animation uses a CSS-only grid trick: each panel is a single grid row that animates between grid-template-rows: 0fr and 1fr. Because the inner content is auto-sized at 1fr, you get a real "open to fit content" animation without measuring heights in JavaScript or hard-coding max-height. Triggers are real buttons with aria-expanded and aria-controls so screen readers announce state correctly.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Keyboard', 'CSS-only', 'Disclosure']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="acc-demo">
			<section>
				<h3>FAQ — single mode</h3>
				<p class="note">Only one panel open at a time. Most recent event: <code>{lastEvent}</code></p>
				<Accordion items={faqs} onToggle={logToggle} ariaLabel="Frequently asked questions" />
			</section>

			<section>
				<h3>Multiple open at once</h3>
				<p class="note">
					Pass <code>multiple</code> to allow several panels open simultaneously.
				</p>
				<Accordion items={faqs} multiple defaultOpen={['shipping', 'returns']} />
			</section>

			<section>
				<h3>Settings — always one open</h3>
				<p class="note">
					<code>preventCollapseLast</code> in single mode keeps at least one panel expanded.
				</p>
				<Accordion items={settings} preventCollapseLast defaultOpen={['general']} />
			</section>

			<section>
				<h3>Compact, borderless</h3>
				<p class="note">
					<code>size="sm"</code> + <code>bordered={false}</code> for sidebar contexts.
				</p>
				<Accordion items={faqs} size="sm" bordered={false} />
			</section>

			<section>
				<h3>With disabled items</h3>
				<p class="note">Disabled items are non-interactive and skipped by Tab navigation.</p>
				<Accordion items={features} />
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>items</code></td>
					<td><code>AccordionItem[]</code></td>
					<td>—</td>
					<td>Required. Each item has <code>id</code>, <code>title</code>, <code>content</code>, optional <code>disabled</code>.</td>
				</tr>
				<tr>
					<td><code>multiple</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Allow more than one panel open at once.</td>
				</tr>
				<tr>
					<td><code>defaultOpen</code></td>
					<td><code>string[]</code></td>
					<td><code>[]</code></td>
					<td>IDs that should start expanded.</td>
				</tr>
				<tr>
					<td><code>preventCollapseLast</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>In single mode, prevents closing the last open panel.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md'</code></td>
					<td><code>'md'</code></td>
					<td>Header padding and font size.</td>
				</tr>
				<tr>
					<td><code>bordered</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Outer border around the accordion.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Accordion'</code></td>
					<td>Group label for assistive tech.</td>
				</tr>
				<tr>
					<td><code>onToggle</code></td>
					<td><code>(id, isOpen) =&gt; void</code></td>
					<td>—</td>
					<td>Fires whenever a panel opens or closes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.acc-demo {
		display: grid;
		gap: 2rem;
	}

	.acc-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.45rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.85rem;
		color: var(--fg-2);
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.note code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
