<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import BackToTop from '$lib/components/BackToTop.svelte';

	const shell = catalogShellPropsForSlug('/backtotop')!;

	// Each demo scopes BackToTop to its OWN scrollable container (not the window)
	// so the position:fixed button anchors to the isolated stage — never the page.
	// The listener target is the inner scroll element; the stage is the containing block.
	let scrollRightEl = $state<HTMLElement>();
	let scrollLeftEl = $state<HTMLElement>();
	let scrollLabelEl = $state<HTMLElement>();

	const filler = Array.from({ length: 12 }, (_, i) => i + 1);

	const codeExplanation =
		'BackToTop attaches a single passive, requestAnimationFrame-throttled scroll listener to its target and flips a boolean once scrollTop passes the threshold. While hidden the button is not rendered at all, so it is never a phantom tab stop; when shown it flies in with a transition whose duration collapses to zero under prefers-reduced-motion. On click it calls target.scrollTo({ top: 0, behavior }) where behavior is smooth only when requested AND motion is allowed, otherwise instant.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'rAF', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="btt-demo">
			<p class="btt-lede">
				Each stage below is its own scroll container with the button scoped to it, so the
				<code>position: fixed</code> control anchors to the framed area rather than hijacking this page.
				Scroll inside a frame to make the button appear, then click it to glide back to the top.
			</p>

			<section class="btt-section">
				<h4>Default — bottom-right, threshold 300, smooth</h4>
				<div class="btt-stage">
					<div class="btt-scroll" bind:this={scrollRightEl}>
						{#each filler as n (n)}
							<article>
								<h5>Paragraph {n}</h5>
								<p>
									Long-form content is exactly where a return-to-top control earns its keep. Keep
									scrolling — once you pass 300px the button fades into the bottom-right corner of
									this frame.
								</p>
							</article>
						{/each}
					</div>
					{#if scrollRightEl}
						<BackToTop target={scrollRightEl} threshold={300} />
					{/if}
				</div>
			</section>

			<section class="btt-section">
				<h4>Bottom-left, low threshold (120px)</h4>
				<div class="btt-stage">
					<div class="btt-scroll" bind:this={scrollLeftEl}>
						{#each filler as n (n)}
							<article>
								<h5>Row {n}</h5>
								<p>
									A lower threshold means the button shows up sooner. This one anchors to the
									bottom-left corner instead — handy when the right edge is busy with other chrome.
								</p>
							</article>
						{/each}
					</div>
					{#if scrollLeftEl}
						<BackToTop target={scrollLeftEl} threshold={120} position="bottom-left" />
					{/if}
				</div>
			</section>

			<section class="btt-section">
				<h4>Labelled + instant scroll (smooth=false)</h4>
				<div class="btt-stage">
					<div class="btt-scroll" bind:this={scrollLabelEl}>
						{#each filler as n (n)}
							<article>
								<h5>Entry {n}</h5>
								<p>
									With <code>showLabel</code> the aria-label doubles as visible text, and
									<code>smooth=false</code> jumps instantly to the top — the same behaviour readers
									get automatically under prefers-reduced-motion.
								</p>
							</article>
						{/each}
					</div>
					{#if scrollLabelEl}
						<BackToTop
							target={scrollLabelEl}
							threshold={200}
							smooth={false}
							showLabel
							label="Top"
						/>
					{/if}
				</div>
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
					<td><code>threshold</code></td>
					<td><code>number</code></td>
					<td><code>300</code></td>
					<td>Pixels scrolled before the button appears.</td>
				</tr>
				<tr>
					<td><code>smooth</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Smooth-scroll on click. Ignored (instant) under prefers-reduced-motion.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Back to top'</code></td>
					<td>Accessible name, and the visible text when <code>showLabel</code> is set.</td>
				</tr>
				<tr>
					<td><code>showLabel</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render <code>label</code> as visible text beside the icon.</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'bottom-right' | 'bottom-left'</code></td>
					<td><code>'bottom-right'</code></td>
					<td>Which corner the button sits in.</td>
				</tr>
				<tr>
					<td><code>target</code></td>
					<td><code>Window | HTMLElement | string</code></td>
					<td><code>window</code></td>
					<td>Scroll source — window, an element reference, or a CSS selector.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra classes forwarded to the button.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.btt-demo {
		display: grid;
		gap: 24px;
	}
	.btt-lede {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.btt-lede code,
	.btt-section p code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.btt-section {
		display: grid;
		gap: 10px;
	}
	.btt-section h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}

	/*
	 * CSS-isolated stage — the containing-block trick. `contain` + a
	 * translateZ(0) transform make this element the containing block for
	 * its position:fixed descendant, so BackToTop anchors HERE, not to
	 * the viewport. Without this the button would float over the whole page.
	 */
	.btt-stage {
		position: relative;
		contain: layout paint;
		transform: translateZ(0);
		height: 320px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
		background: var(--surface);
	}
	.btt-scroll {
		height: 100%;
		overflow-y: auto;
		padding: 16px;
		display: grid;
		gap: 12px;
	}
	.btt-scroll article {
		padding: 12px 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
	}
	.btt-scroll h5 {
		margin: 0 0 6px;
		font-family: var(--font-display, var(--font-mono));
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-1);
	}
	.btt-scroll p {
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
		color: var(--fg-2);
	}
</style>
