<script lang="ts">
	import ScratchToReveal from '$lib/components/ScratchToReveal.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/scratchtoreveal')!;

	let copiedCouponCode = $state(false);

	function copyCouponCode() {
		navigator.clipboard.writeText('SAVE50');
		copiedCouponCode = true;
		setTimeout(() => (copiedCouponCode = false), 2000);
	}

	const usageSnippet = `<script>
  import ScratchToReveal from '$lib/components/ScratchToReveal.svelte';
<\/script>

<ScratchToReveal
  scratchText="Scratch Here!"
  showProgress={true}
  revealThreshold={70}
  width={400}
  height={300}
>
  <div class="prize">
    <h3>Congratulations!</h3>
    <p>You've revealed the hidden message.</p>
  </div>
</ScratchToReveal>`;

	const codeExplanation =
		'ScratchToReveal layers an HTML5 canvas above a Svelte snippet. Pointer events sample alpha pixels each frame to track scratched percentage; when it crosses revealThreshold the canvas fades out. Pointer/touch/pen all share a single pointer-event path so mobile is first-class.';
</script>

<svelte:head>
	<title>ScratchToReveal — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive scratch-off component revealing hidden content with HTML5 Canvas and zero dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Canvas', 'Pointer events', 'Touch', 'Zero deps']}
>
	{#snippet demo()}
		<div class="str-grid">
			<div class="str-card">
				<h3>Basic text reveal</h3>
				<p>Auto-reveals at 70% scratched, with progress bar.</p>
				<div class="str-stage">
					<ScratchToReveal
						scratchText="Scratch Here!"
						showProgress={true}
						revealThreshold={70}
						width={400}
						height={300}
					>
						<div class="str-prize">
							<div class="str-prize__emoji">🎉</div>
							<h4>Congratulations!</h4>
							<p>You've revealed the hidden message!</p>
						</div>
					</ScratchToReveal>
				</div>
			</div>

			<div class="str-card">
				<h3>Lottery card</h3>
				<p>Solid grey surface, large brush, custom text.</p>
				<div class="str-stage">
					<ScratchToReveal
						scratchText="🎰 SCRATCH TO WIN 🎰"
						scratchColor="#c0c0c0"
						scratchTextColor="#333333"
						scratchTextSize="20px"
						brushSize={50}
						width={400}
						height={300}
					>
						<div class="str-lottery">
							<div class="str-lottery__header">🎊 WINNER! 🎊</div>
							<div class="str-lottery__prize">£50</div>
							<div class="str-lottery__sub">Prize Money</div>
						</div>
					</ScratchToReveal>
				</div>
			</div>

			<div class="str-card">
				<h3>Coupon code</h3>
				<p>Marketing reveal with copy interaction.</p>
				<div class="str-stage">
					<ScratchToReveal
						scratchText="SCRATCH FOR DISCOUNT!"
						scratchColor="#ff6b6b"
						scratchTextColor="#ffffff"
						scratchTextSize="18px"
						width={400}
						height={300}
					>
						<div class="str-coupon">
							<div class="str-coupon__badge">50% OFF</div>
							<div class="str-coupon__code">SAVE50</div>
							<p class="str-coupon__text">Limited Time Offer</p>
							<button class="str-copy" onclick={copyCouponCode}>
								{copiedCouponCode ? '✓ Copied!' : 'Copy Code'}
							</button>
						</div>
					</ScratchToReveal>
				</div>
			</div>

			<div class="str-card">
				<h3>Customisation</h3>
				<p>Brush shape, brush size, manual reveal.</p>
				<div class="str-mini-grid">
					<ScratchToReveal scratchText="Easy Mode!" brushSize={60} width={220} height={160}>
						<div class="str-mini">
							<p style="font-size: 1.5rem;">🌟</p>
							<p>Revealed!</p>
						</div>
					</ScratchToReveal>
					<ScratchToReveal
						scratchText="Pixelated"
						brushShape="square"
						brushSize={40}
						width={220}
						height={160}
					>
						<div class="str-mini">
							<p style="font-size: 1.5rem;">⬛</p>
							<p>Blocky!</p>
						</div>
					</ScratchToReveal>
					<ScratchToReveal
						scratchColor="#8b5cf6"
						scratchText="Purple!"
						scratchTextColor="#ffffff"
						width={220}
						height={160}
					>
						<div class="str-mini">
							<p style="font-size: 1.5rem;">💜</p>
							<p>Violet</p>
						</div>
					</ScratchToReveal>
					<ScratchToReveal
						scratchText="No Auto!"
						autoReveal={false}
						showProgress={true}
						width={220}
						height={160}
					>
						<div class="str-mini">
							<p style="font-size: 1.5rem;">⏸️</p>
							<p>Manual</p>
						</div>
					</ScratchToReveal>
				</div>
			</div>
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
					<td><code>scratchColor</code></td>
					<td><code>string</code></td>
					<td><code>'#999999'</code></td>
					<td>Scratch surface colour.</td>
				</tr>
				<tr>
					<td><code>scratchImage</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Optional texture image URL for the surface.</td>
				</tr>
				<tr>
					<td><code>scratchText</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Overlay text drawn on the surface.</td>
				</tr>
				<tr>
					<td><code>brushSize</code></td>
					<td><code>number</code></td>
					<td><code>40</code></td>
					<td>Scratch brush radius in pixels.</td>
				</tr>
				<tr>
					<td><code>brushShape</code></td>
					<td><code>'circle' | 'square'</code></td>
					<td><code>'circle'</code></td>
					<td>Brush shape.</td>
				</tr>
				<tr>
					<td><code>revealThreshold</code></td>
					<td><code>number</code></td>
					<td><code>70</code></td>
					<td>Percentage scratched before auto-reveal.</td>
				</tr>
				<tr>
					<td><code>autoReveal</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Automatically clear the canvas at the threshold.</td>
				</tr>
				<tr>
					<td><code>showProgress</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Show a progress bar.</td>
				</tr>
				<tr>
					<td><code>onReveal</code></td>
					<td><code>() =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Callback fired once when revealed.</td>
				</tr>
				<tr>
					<td><code>onProgress</code></td>
					<td><code>(p: number) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Callback fired with scratch percentage (0–100).</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.str-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 16px;
	}
	.str-card {
		display: grid;
		gap: 8px;
		padding: 18px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
	.str-card h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.str-card p {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
		line-height: 1.5;
	}
	.str-stage {
		display: grid;
		place-items: center;
		padding: 24px;
		border-radius: var(--r-2);
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}
	.str-mini-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
		padding: 16px;
		border-radius: var(--r-2);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.str-prize,
	.str-lottery,
	.str-coupon,
	.str-mini {
		text-align: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		border-radius: 12px;
		color: white;
	}
	.str-prize {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	.str-prize__emoji {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}
	.str-prize h4 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
	}
	.str-prize p {
		margin: 0;
		opacity: 0.9;
	}

	.str-lottery {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}
	.str-lottery__header {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}
	.str-lottery__prize {
		font-size: 3rem;
		font-weight: 900;
	}

	.str-coupon {
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
	}
	.str-coupon__badge {
		background: rgba(255, 255, 255, 0.3);
		border: 2px solid white;
		border-radius: 50px;
		padding: 0.4rem 1.25rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
	}
	.str-coupon__code {
		font-size: 2.25rem;
		font-weight: 900;
		letter-spacing: 0.1em;
		font-family: 'Courier New', monospace;
		margin: 0.25rem 0;
	}
	.str-coupon__text {
		margin: 0.25rem 0 0.75rem;
	}
	.str-copy {
		background: white;
		color: #fa709a;
		border: none;
		border-radius: 8px;
		padding: 0.6rem 1.5rem;
		font-weight: 600;
		cursor: pointer;
	}
	.str-copy:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.str-mini {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
		color: #1f2937;
	}
	.str-mini p {
		margin: 0;
		font-weight: 600;
	}
</style>
