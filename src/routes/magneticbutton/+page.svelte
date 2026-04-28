<script lang="ts">
	import MagneticButton from '$lib/components/MagneticButton.svelte';
</script>

<svelte:head>
	<title>MagneticButton Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="High-end magnetic attraction button effect. Buttons drift towards the cursor with configurable strength, radius, and damping. Respects reduced motion and touch."
	/>
</svelte:head>

<div class="page-shell">
	<section class="intro">
		<div>
			<p class="eyebrow">Buttons & CTAs</p>
			<h1>MagneticButton</h1>
			<p>
				A wrapper that gives any button or link a subtle magnetic pull towards the cursor.
				Tunable strength, radius, and damping; pure CSS transforms; zero dependencies.
				Falls back to no movement on touch devices and when reduced motion is requested.
			</p>
		</div>
		<div class="intro-stats" aria-label="Component capabilities">
			<div><strong>0</strong><span>runtime deps</span></div>
			<div><strong>3</strong><span>tunable props</span></div>
			<div><strong>2</strong><span>auto fallbacks</span></div>
		</div>
	</section>

	<section class="example-grid">
		<article class="example-panel">
			<h2>Default</h2>
			<p>strength 0.3 · radius 100 · damping 0.1</p>
			<div class="stage">
				<MagneticButton>
					<button class="cta primary" type="button">Hover me</button>
				</MagneticButton>
			</div>
		</article>

		<article class="example-panel">
			<h2>Strong &amp; wide</h2>
			<p>strength 0.6 · radius 180</p>
			<div class="stage">
				<MagneticButton strength={0.6} radius={180}>
					<button class="cta secondary" type="button">Pulls harder</button>
				</MagneticButton>
			</div>
		</article>

		<article class="example-panel">
			<h2>Subtle &amp; quick</h2>
			<p>strength 0.15 · damping 0.05</p>
			<div class="stage">
				<MagneticButton strength={0.15} damping={0.05}>
					<button class="cta ghost" type="button">Barely moves</button>
				</MagneticButton>
			</div>
		</article>

		<article class="example-panel">
			<h2>Wraps a link</h2>
			<p>Any element works — semantics stay on the child.</p>
			<div class="stage">
				<MagneticButton>
					<a class="cta link" href="#docs">Docs &amp; API ↗</a>
				</MagneticButton>
			</div>
		</article>
	</section>

	<section class="notes">
		<h2>Behavioural notes</h2>
		<ul>
			<li><strong>Reduced motion:</strong> If the OS reports <code>prefers-reduced-motion: reduce</code>, the cursor tracker is disabled and the child never translates.</li>
			<li><strong>Touch / coarse pointer:</strong> On devices without a fine pointer the wrapper is a no-op — the child sits exactly where you placed it.</li>
			<li><strong>Click semantics:</strong> The wrapper never intercepts clicks. Whatever you put inside (button, link, custom element) keeps its own focus, role, and keyboard handling.</li>
			<li><strong>SSR safe:</strong> All <code>window.matchMedia</code> access is inside <code>onMount</code>, so the component renders cleanly on the server.</li>
		</ul>
	</section>

	<section class="code-panel">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import MagneticButton from '$lib/components/MagneticButton.svelte';
	</script>

<MagneticButton strength={0.3} radius={120}>
  <button type="button">Click me</button>
</MagneticButton>`}</code></pre>
	</section>
</div>

<style>
	.page-shell {
		width: min(1180px, calc(100vw - 2rem));
		margin: 0 auto;
		padding: 3rem 0 4rem;
		color: #172033;
	}

	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 2rem;
		align-items: end;
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		color: #2563eb;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1, h2, p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.2rem, 1.8rem + 2vw, 4rem);
		line-height: 0.98;
		color: #0f172a;
	}

	.intro p {
		max-width: 48rem;
		margin-top: 1rem;
		color: #546179;
		line-height: 1.65;
	}

	.intro-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(6rem, 1fr));
		gap: 0.6rem;
	}

	.intro-stats div,
	.example-panel,
	.notes,
	.code-panel {
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
	}

	.intro-stats div {
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem;
	}

	.intro-stats strong {
		color: #0f172a;
		font-size: 1.45rem;
		line-height: 1;
	}

	.intro-stats span {
		color: #64748b;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.example-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: 1rem;
	}

	.example-panel {
		padding: 1.4rem 1.4rem 2rem;
		display: grid;
		gap: 0.75rem;
	}

	.example-panel h2 {
		color: #0f172a;
		font-size: 1.05rem;
	}

	.example-panel p {
		color: #64748b;
		font-size: 0.9rem;
	}

	.stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 7rem;
		padding: 1rem;
		border-radius: 10px;
		background: linear-gradient(135deg, #f8fafc, #eef2ff);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.6rem;
		border-radius: 999px;
		border: 1px solid transparent;
		font-weight: 700;
		font-size: 0.95rem;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
	}

	.cta.primary {
		background: #2563eb;
		color: white;
	}
	.cta.primary:hover { background: #1d4ed8; }

	.cta.secondary {
		background: #0f172a;
		color: white;
	}
	.cta.secondary:hover { background: #1e293b; }

	.cta.ghost {
		background: transparent;
		color: #0f172a;
		border-color: rgba(15, 23, 42, 0.25);
	}
	.cta.ghost:hover { background: rgba(15, 23, 42, 0.06); }

	.cta.link {
		background: white;
		color: #2563eb;
		border-color: rgba(37, 99, 235, 0.3);
	}
	.cta.link:hover { color: #1d4ed8; border-color: #2563eb; }

	.notes {
		margin-top: 2rem;
		padding: 1.4rem;
	}

	.notes h2 {
		margin-bottom: 0.8rem;
		color: #0f172a;
		font-size: 1.05rem;
	}

	.notes ul {
		display: grid;
		gap: 0.55rem;
		margin: 0;
		padding-left: 1.2rem;
	}

	.notes li {
		color: #475569;
		line-height: 1.55;
	}

	.notes code {
		background: rgba(15, 23, 42, 0.06);
		padding: 0.05rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.code-panel {
		margin-top: 1.5rem;
		padding: 1.1rem;
	}

	.code-panel h2 {
		margin-bottom: 0.55rem;
		color: #0f172a;
		font-size: 1.05rem;
	}

	pre {
		overflow-x: auto;
		margin: 0;
		padding: 1rem;
		border-radius: 8px;
		background: #111827;
		color: #e5e7eb;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	@media (max-width: 900px) {
		.intro {
			grid-template-columns: 1fr;
		}
	}
</style>
