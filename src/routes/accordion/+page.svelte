<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';

	const faqs = [
		{
			id: 'shipping',
			title: 'How long does shipping take?',
			content:
				'Standard delivery is 3–5 business days within the UK. Express delivery (1–2 days) is available at checkout for £4.99 extra. International shipping varies by destination — see our shipping page for full details.'
		},
		{
			id: 'returns',
			title: 'What is your returns policy?',
			content:
				'30 days, full refund, no questions asked. Return shipping is free for UK customers. Items must be unused and in original packaging. Refunds are processed within 5 working days of receiving the return.'
		},
		{
			id: 'support',
			title: 'How do I contact support?',
			content:
				'Email support@example.com or use the chat widget in the bottom-right corner of any page. Our team is available 9am–6pm GMT, Monday to Friday. Average response time is under 2 hours during business hours.'
		},
		{
			id: 'sizing',
			title: 'How do your sizes run?',
			content:
				'We follow standard UK sizing. If you are between sizes, we recommend sizing up — most customers find our fit slightly snug. Detailed measurements for each item are available on the product page.'
		}
	];

	const settings = [
		{
			id: 'general',
			title: 'General preferences',
			content:
				'Language, timezone, and date format settings. Changes apply immediately and sync across all your devices when signed in.'
		},
		{
			id: 'notifications',
			title: 'Notifications',
			content:
				'Configure email, push, and in-app notifications. You can mute specific channels during your set quiet hours.'
		},
		{
			id: 'privacy',
			title: 'Privacy & data',
			content:
				'Control how your data is used, manage cookie preferences, and download or delete your account history.'
		}
	];

	const features = [
		{
			id: 'a',
			title: 'Single mode (default)',
			content:
				'Click a header to open it; opening another closes the previous one. Great for FAQs where focus matters.'
		},
		{
			id: 'b',
			title: 'Multiple open',
			content:
				'Set the multiple prop and any number can be open at once. Useful when sections are independent.'
		},
		{
			id: 'c',
			title: 'Disabled items',
			content: 'Mark an item disabled and the trigger becomes non-interactive (also non-focusable for keyboard users).',
			disabled: true
		}
	];

	let lastEvent = $state('—');

	function logToggle(id: string, isOpen: boolean) {
		lastEvent = `${id} → ${isOpen ? 'opened' : 'closed'}`;
	}
</script>

<svelte:head>
	<title>Accordion · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🪗 Accordion</h1>
		<p>
			A stack of expandable panels. Click a header to reveal its content. Smooth grid-row animation,
			single or multiple-open modes, full ARIA wiring, zero dependencies.
		</p>
	</header>

	<section class="demo">
		<h2>FAQ — single mode (default)</h2>
		<p class="demo-note">Only one panel open at a time. Most recent event: <code>{lastEvent}</code></p>
		<Accordion items={faqs} onToggle={logToggle} ariaLabel="Frequently asked questions" />
	</section>

	<section class="demo">
		<h2>Multiple open at once</h2>
		<p class="demo-note">
			Pass <code>multiple</code> to allow several panels open simultaneously. Useful for independent
			sections.
		</p>
		<Accordion items={faqs} multiple defaultOpen={['shipping', 'returns']} />
	</section>

	<section class="demo">
		<h2>Settings panel — always one open</h2>
		<p class="demo-note">
			<code>preventCollapseLast</code> in single mode keeps at least one panel expanded — perfect
			for settings UIs where empty space looks broken.
		</p>
		<Accordion items={settings} preventCollapseLast defaultOpen={['general']} />
	</section>

	<section class="demo">
		<h2>Compact, borderless</h2>
		<p class="demo-note">
			Use <code>size="sm"</code> and <code>bordered={false}</code> for inline or sidebar contexts.
		</p>
		<Accordion items={faqs} size="sm" bordered={false} />
	</section>

	<section class="demo">
		<h2>With disabled items</h2>
		<p class="demo-note">Disabled items are non-interactive and skipped by Tab navigation.</p>
		<Accordion items={features} />
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>✅ Single (default) or multiple-open mode</li>
			<li>✅ <code>preventCollapseLast</code> for "always one open" settings panels</li>
			<li>✅ <code>defaultOpen</code> for initial state</li>
			<li>✅ Smooth expand/collapse via <code>grid-template-rows: 0fr ↔ 1fr</code> (no JS measurement)</li>
			<li>✅ Two sizes (<code>sm</code> / <code>md</code>) and an optional bordered variant</li>
			<li>✅ Honours <code>prefers-reduced-motion</code></li>
			<li>✅ Native <code>&lt;button&gt;</code> + <code>role="region"</code> with full ARIA wiring</li>
			<li>✅ Zero dependencies, fully copy-paste ready</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import Accordion from '$lib/components/Accordion.svelte';

  const faqs = [
    { id: 'shipping', title: 'How long does shipping take?', content: '3–5 business days within the UK.' },
    { id: 'returns',  title: 'Returns policy?',              content: '30 days, full refund, no questions asked.' }
  ];
</`+`script>

<!-- Single mode (FAQ-style) -->
<Accordion items={faqs} />

<!-- Multiple open at once -->
<Accordion items={faqs} multiple />

<!-- Settings panel — always one open -->
<Accordion items={faqs} preventCollapseLast defaultOpen={['shipping']} />

<!-- Compact, borderless -->
<Accordion items={faqs} size="sm" bordered={false} />`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.25rem;
		margin: 0 0 0.5rem;
	}

	.page-header p {
		color: #4b5563;
		max-width: 42rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2,
	.features h2,
	.usage h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.demo-note {
		color: #6b7280;
		font-size: 0.95rem;
		margin: 0 0 1rem;
	}

	.demo-note code,
	.features code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.features ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 0.5rem 1.25rem;
		color: #374151;
	}

	.features li {
		line-height: 1.6;
	}

	.usage pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
