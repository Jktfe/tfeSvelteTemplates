<!--
	============================================================
	TfeFooter
	============================================================

	WHAT
	The editorial ink-slab footer used across every TFE Svelte
	Templates page. Replaces the legacy "Built with..." strip.

	WHY
	Every route gets the same closing chrome — brand block on
	the left, then "The kit / Source / Built by" link columns,
	with a final lockup bar of company info.

	ACCESSIBILITY
	• Single <footer> landmark
	• External links carry rel="noopener noreferrer"

	USAGE
	<TfeFooter />

	PROPS
	None — links are hard-coded to the canonical TFE/Jktfe
	destinations. If a fork needs different links, swap the
	relevant <a> hrefs directly.
-->

<script lang="ts">
	const SITE_BASE = '/';
</script>

<footer class="t-foot">
	<div class="t-wrap">
		<div class="t-foot__top">
			<div class="t-foot__brand">
				<img src="/tfe/tfe-logo-white.svg" alt="TFE logo" width="56" height="56" />
				<h3>There For Everything.</h3>
				<p>Photography, finance, code, coaching. If I can do it well, the answer’s yes.</p>
				<div class="t-foot__brand-actions">
					<a
						class="t-btn t-btn--ghost t-btn--sm"
						href="https://tfeltd.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						tfeltd.com <span aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
			<div class="t-foot__col">
				<h4>The kit</h4>
				<ul>
					<li><a href={SITE_BASE + '#components'}>All components</a></li>
					<li><a href="/gsap-suite">GSAP suite</a></li>
					<li><a href={SITE_BASE + '#how'}>How to use</a></li>
					<li>
						<a
							href="https://github.com/Jktfe/tfeSvelteTemplates/issues"
							target="_blank"
							rel="noopener noreferrer">Request a part</a
						>
					</li>
				</ul>
			</div>
			<div class="t-foot__col">
				<h4>Source</h4>
				<ul>
					<li>
						<a
							href="https://github.com/Jktfe/tfeSvelteTemplates"
							target="_blank"
							rel="noopener noreferrer">GitHub repo</a
						>
					</li>
					<li><a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte 5</a></li>
					<li>
						<a href="https://kit.svelte.dev" target="_blank" rel="noopener noreferrer">SvelteKit</a>
					</li>
					<li>
						<a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"
							>TypeScript</a
						>
					</li>
				</ul>
			</div>
			<div class="t-foot__col">
				<h4>Built by</h4>
				<ul>
					<li>
						<a href="https://github.com/Jktfe" target="_blank" rel="noopener noreferrer">@Jktfe</a>
					</li>
					<li>
						<a href="https://tfeltd.com" target="_blank" rel="noopener noreferrer">TFE Ltd</a>
					</li>
					<li>With help from Claude</li>
					<li>Patient, mostly.</li>
				</ul>
			</div>
		</div>
		<div class="t-foot__bottom">
			<span>© TFE Ltd · A British limited company</span>
			<span>Built with Svelte 5 · SvelteKit · TypeScript</span>
		</div>
	</div>
</footer>

<style>
	.t-foot {
		background: var(--tfe-ink);
		color: #c8cbcd;
		padding: 96px 0 32px;
		font-family: var(--font-sans);
	}
	.t-wrap {
		width: 100%;
		max-width: var(--container, 1320px);
		margin: 0 auto;
		padding: 0 32px;
		box-sizing: border-box;
	}
	.t-foot__top {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr 1fr;
		gap: 56px;
		padding-bottom: 56px;
		border-bottom: 1px solid #2a2d31;
	}
	.t-foot__brand img {
		width: 56px;
		height: auto;
		margin-bottom: 16px;
		display: block;
	}
	.t-foot__brand h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 28px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0 0 8px;
		color: #f6f5f1;
	}
	.t-foot__brand p {
		font-size: 14px;
		color: #8a8e92;
		margin: 0 0 16px;
		max-width: 36ch;
		line-height: 1.55;
	}
	.t-foot__brand-actions {
		display: flex;
		gap: 12px;
		margin-top: 12px;
	}
	.t-foot__col h4 {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8a8e92;
		margin: 0 0 16px;
		font-weight: 500;
	}
	.t-foot__col ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 10px;
		font-size: 14px;
	}
	.t-foot__col a {
		color: #c8cbcd;
		text-decoration: none;
		transition: color var(--dur-fast);
	}
	.t-foot__col a:hover {
		color: #f6f5f1;
	}
	.t-foot__bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 32px;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #6a6e72;
	}
	.t-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 22px;
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.02em;
		border-radius: var(--r-2);
		border: 1px solid transparent;
		text-decoration: none;
		transition: all var(--dur-fast) var(--ease-std);
	}
	.t-btn--sm {
		padding: 10px 16px;
		font-size: 13px;
	}
	.t-btn--ghost {
		background: transparent;
		color: #f6f5f1;
		border-color: #3a3e43;
	}
	.t-btn--ghost:hover {
		background: #1a1c1f;
		border-color: #f6f5f1;
	}

	@media (max-width: 880px) {
		.t-foot__top {
			grid-template-columns: 1fr 1fr;
			gap: 32px;
		}
		.t-foot__bottom {
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
		}
	}
	@media (max-width: 720px) {
		.t-wrap {
			padding: 0 20px;
		}
		.t-foot__top {
			grid-template-columns: 1fr;
		}
	}
</style>
