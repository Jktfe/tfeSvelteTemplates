<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';

	let broken = $state(false);
	let liveSrc = $derived(
		broken ? 'https://broken.example/nope.png' : 'https://i.pravatar.cc/150?img=12'
	);
</script>

<div class="page">
	<header class="page-header">
		<h1>Avatar</h1>
		<p class="lede">
			Single user identity element. Renders a photo when <code>src</code> is provided, with
			automatic fallback to initials on a deterministically-coloured background derived from the
			name. Same name → same colour, everywhere.
		</p>
	</header>

	<section class="demo">
		<h2>Photo avatars</h2>
		<p class="hint">Default circle, medium size, no status dot.</p>
		<div class="card row">
			<Avatar src="https://i.pravatar.cc/150?img=1" name="Ada Lovelace" />
			<Avatar src="https://i.pravatar.cc/150?img=5" name="Grace Hopper" />
			<Avatar src="https://i.pravatar.cc/150?img=9" name="Margaret Hamilton" />
			<Avatar src="https://i.pravatar.cc/150?img=15" name="Katherine Johnson" />
			<Avatar src="https://i.pravatar.cc/150?img=20" name="Karen Spärck Jones" />
		</div>
	</section>

	<section class="demo">
		<h2>Initials fallback</h2>
		<p class="hint">No <code>src</code> → initials in a deterministic colour from the name.</p>
		<div class="card row">
			<Avatar name="Ada Lovelace" />
			<Avatar name="Grace Hopper" />
			<Avatar name="Margaret Hamilton" />
			<Avatar name="Katherine Johnson" />
			<Avatar name="Karen Spärck Jones" />
			<Avatar name="Linus Torvalds" />
			<Avatar name="Tim Berners-Lee" />
		</div>
	</section>

	<section class="demo">
		<h2>Three sizes</h2>
		<p class="hint">sm = 32px, md = 48px (default), lg = 72px.</p>
		<div class="card row baseline">
			<Avatar name="Ada Lovelace" size="sm" />
			<Avatar name="Ada Lovelace" size="md" />
			<Avatar name="Ada Lovelace" size="lg" />
		</div>
	</section>

	<section class="demo">
		<h2>Three shapes</h2>
		<p class="hint">Circle (default), rounded (square with 8px radius), square (no radius).</p>
		<div class="card row">
			<Avatar name="Ada Lovelace" shape="circle" size="lg" />
			<Avatar name="Ada Lovelace" shape="rounded" size="lg" />
			<Avatar name="Ada Lovelace" shape="square" size="lg" />
		</div>
	</section>

	<section class="demo">
		<h2>Status dot</h2>
		<p class="hint">Bottom-right dot in one of four states.</p>
		<div class="card row">
			<div class="labelled">
				<Avatar name="Ada Lovelace" status="online" size="lg" />
				<small>online</small>
			</div>
			<div class="labelled">
				<Avatar name="Grace Hopper" status="away" size="lg" />
				<small>away</small>
			</div>
			<div class="labelled">
				<Avatar name="Margaret Hamilton" status="busy" size="lg" />
				<small>busy</small>
			</div>
			<div class="labelled">
				<Avatar name="Katherine Johnson" status="offline" size="lg" />
				<small>offline</small>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Live broken-src auto-fallback</h2>
		<p class="hint">Toggle the URL to a broken one — <code>onerror</code> flips the avatar to initials.</p>
		<div class="card">
			<div class="row">
				<Avatar src={liveSrc} name="Ada Lovelace" size="lg" />
				<button onclick={() => (broken = !broken)}>
					{broken ? 'Restore image' : 'Break image'}
				</button>
				<code class="src-display">{liveSrc}</code>
			</div>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: 800px;
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
	.hint code,
	.demo code {
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

	.row {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.row.baseline {
		align-items: baseline;
	}

	.labelled {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
	}
	.labelled small {
		color: #475569;
		font-size: 0.75rem;
	}

	.src-display {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	button {
		padding: 0.4rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1px solid #e2e8f0;
		background: #fff;
		border-radius: 0.375rem;
		cursor: pointer;
	}
	button:hover {
		background: #f8fafc;
	}
</style>
