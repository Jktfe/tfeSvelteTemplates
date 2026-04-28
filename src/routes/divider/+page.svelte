<script lang="ts">
	import Divider from '$lib/components/Divider.svelte';
</script>

<div class="page">
	<header class="page-header">
		<h1>Divider</h1>
		<p class="lede">
			Structural section separator with optional label, horizontal &amp; vertical orientation,
			three thicknesses, three line styles, and proper ARIA semantics.
		</p>
	</header>

	<section class="demo">
		<h2>Plain horizontal</h2>
		<p class="hint">Native <code>&lt;hr&gt;</code> — browsers expose <code>role="separator"</code> for free.</p>
		<div class="card">
			<p>Content above the divider.</p>
			<Divider />
			<p>Content below the divider.</p>
		</div>
	</section>

	<section class="demo">
		<h2>With centred label</h2>
		<p class="hint">Renders as <code>&lt;div role="separator"&gt;</code> with two flanking lines around the label.</p>
		<div class="card login-card">
			<button class="auth-btn">Continue with Google</button>
			<button class="auth-btn">Continue with GitHub</button>
			<Divider label="OR" />
			<input type="email" placeholder="you@example.com" class="email" />
			<button class="auth-btn primary">Send magic link</button>
		</div>
	</section>

	<section class="demo">
		<h2>Left-aligned section header</h2>
		<p class="hint">Use <code>labelPosition="left"</code> for visual section breaks in long content.</p>
		<div class="card">
			<Divider label="Recently active" labelPosition="left" />
			<ul class="list">
				<li>Alex Morgan — 2 min ago</li>
				<li>Jamie Chen — 14 min ago</li>
				<li>Priya Patel — 1 hr ago</li>
			</ul>
			<Divider label="Last week" labelPosition="left" />
			<ul class="list">
				<li>Sam O'Brien — 3 days ago</li>
				<li>Riley Fox — 6 days ago</li>
			</ul>
		</div>
	</section>

	<section class="demo">
		<h2>Three thicknesses</h2>
		<p class="hint">Pick a weight to match the visual hierarchy.</p>
		<div class="card stack">
			<div>
				<small>thin (1 px)</small>
				<Divider thickness="thin" />
			</div>
			<div>
				<small>medium (2 px)</small>
				<Divider thickness="medium" />
			</div>
			<div>
				<small>thick (4 px)</small>
				<Divider thickness="thick" />
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Line styles</h2>
		<p class="hint">Solid, dashed, or dotted — useful for differentiating optional vs. required breaks.</p>
		<div class="card stack">
			<div>
				<small>solid</small>
				<Divider lineStyle="solid" />
			</div>
			<div>
				<small>dashed</small>
				<Divider lineStyle="dashed" thickness="medium" />
			</div>
			<div>
				<small>dotted</small>
				<Divider lineStyle="dotted" thickness="medium" />
			</div>
			<div>
				<small>brand colour</small>
				<Divider thickness="thick" lineStyle="dashed" colour="#146ef5" />
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Vertical between toolbar groups</h2>
		<p class="hint">
			<code>orientation="vertical"</code> with <code>aria-orientation</code> set automatically.
		</p>
		<div class="card">
			<div class="toolbar">
				<button class="tool">Bold</button>
				<button class="tool">Italic</button>
				<button class="tool">Underline</button>
				<Divider orientation="vertical" />
				<button class="tool">Link</button>
				<button class="tool">Code</button>
				<Divider orientation="vertical" thickness="medium" colour="#94a3b8" />
				<button class="tool">Image</button>
				<button class="tool">Video</button>
			</div>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #0f172a;
	}

	.page-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0 0 2rem;
		color: #475569;
		line-height: 1.6;
	}

	.demo {
		margin: 0 0 2.5rem;
	}
	.demo h2 {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}
	.hint {
		margin: 0 0 0.875rem;
		color: #64748b;
		font-size: 0.875rem;
	}
	.hint code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.25rem;
	}
	.card p {
		margin: 0.25rem 0;
		color: #334155;
	}

	.stack > div {
		margin: 0 0 1rem;
	}
	.stack small {
		display: block;
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.375rem;
	}

	.login-card {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.auth-btn {
		padding: 0.625rem 1rem;
		border: 1px solid #e2e8f0;
		background: #fff;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		text-align: center;
	}
	.auth-btn.primary {
		background: #0f172a;
		color: #fff;
		border-color: #0f172a;
	}
	.email {
		padding: 0.625rem 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-family: inherit;
	}

	.list {
		margin: 0.625rem 0;
		padding: 0 0 0 1.125rem;
		color: #475569;
		font-size: 0.9375rem;
		line-height: 1.7;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-wrap: wrap;
	}
	.tool {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		background: #fff;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}
</style>
