<script lang="ts">
	import Typewriter from '$lib/components/Typewriter.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	const heroLines = [
		'Build beautiful interfaces.',
		'Ship with confidence.',
		'Zero dependencies.',
		'Pure Svelte 5 runes.'
	];

	const greetings = [
		'Hello, World!',
		'Bonjour, le monde!',
		'Hola, Mundo!',
		'こんにちは世界！'
	];

	const codeSnippets = [
		'const app = new SvelteKit()',
		'bun run dev',
		'git push origin main'
	];

	const usageExample = `<script lang="ts">
  import Typewriter from '$lib/components/Typewriter.svelte';

  const phrases = [
    'Build beautiful UIs.',
    'Ship with confidence.',
    'Zero dependencies.'
  ];
</${'script'}>

<h1>
  <Typewriter {phrases} typeSpeed={80} deleteSpeed={50} />
</h1>`;
</script>

<svelte:head>
	<title>Typewriter | TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Typewriter</h1>
		<p class="subtitle">
			Animated text that types out characters one-by-one with a blinking cursor,
			cycling through multiple phrases. Zero external dependencies.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</header>

	<!-- Hero demo -->
	<section class="demo-section">
		<h2>Hero Example</h2>
		<div class="demo-card hero-demo">
			<span class="hero-text">
				<Typewriter phrases={heroLines} typeSpeed={70} pauseDuration={2500} />
			</span>
		</div>
	</section>

	<!-- Greetings demo -->
	<section class="demo-section">
		<h2>Multilingual Greetings</h2>
		<div class="demo-card">
			<span class="greeting-text">
				<Typewriter phrases={greetings} typeSpeed={100} deleteSpeed={60} pauseDuration={1500} />
			</span>
		</div>
	</section>

	<!-- Code demo -->
	<section class="demo-section">
		<h2>Terminal Style</h2>
		<div class="demo-card terminal-card">
			<span class="terminal-prompt">$&nbsp;</span>
			<span class="terminal-text">
				<Typewriter
					phrases={codeSnippets}
					typeSpeed={60}
					deleteSpeed={30}
					pauseDuration={3000}
					cursorChar="_"
				/>
			</span>
		</div>
	</section>

	<!-- Single phrase, no loop -->
	<section class="demo-section">
		<h2>Single Phrase (No Loop)</h2>
		<div class="demo-card">
			<span class="single-text">
				<Typewriter
					phrases={['This types once and stops.']}
					typeSpeed={60}
					loop={false}
					startDelay={500}
				/>
			</span>
		</div>
	</section>

	<!-- Features -->
	<section class="demo-section">
		<h2>Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<span class="feature-icon">⌨️</span>
				<h3>Character-by-Character</h3>
				<p>Configurable type speed, delete speed, and pause between phrases.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">✨</span>
				<h3>Blinking Cursor</h3>
				<p>Pure CSS cursor animation. Customisable character — pipe, underscore, or block.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">🔄</span>
				<h3>Phrase Cycling</h3>
				<p>Loops through an array of strings with smooth delete-then-retype transitions.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">♿</span>
				<h3>Accessible</h3>
				<p>Full phrase in aria-label for screen readers. Respects prefers-reduced-motion.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">📦</span>
				<h3>Zero Dependencies</h3>
				<p>Pure Svelte 5 $effect state machine. Copy-paste portable.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">⚙️</span>
				<h3>Configurable</h3>
				<p>Loop or single-pass, start delay, custom cursor, and more.</p>
			</div>
		</div>
	</section>

	<!-- Usage -->
	<section class="demo-section">
		<h2>Usage</h2>
		<pre class="code-block"><code>{usageExample}</code></pre>
	</section>
</div>

<style>
	.page-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #64748b;
		font-size: 1.05rem;
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.demo-section {
		margin-bottom: 2.5rem;
	}

	.demo-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.75rem;
	}

	.demo-card {
		padding: 2rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		text-align: center;
	}

	.hero-demo {
		padding: 3rem 2rem;
		background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
	}

	.hero-text {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1e293b;
	}

	.greeting-text {
		font-size: 1.5rem;
		font-weight: 600;
		color: #475569;
	}

	.terminal-card {
		background: #1e293b;
		text-align: left;
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}

	.terminal-prompt {
		color: #10b981;
		font-size: 1rem;
	}

	.terminal-text {
		color: #e2e8f0;
		font-size: 1rem;
	}

	.single-text {
		font-size: 1.25rem;
		color: #64748b;
	}

	/* Features grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.feature-card {
		padding: 1.25rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
	}

	.feature-icon {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.feature-card h3 {
		font-size: 0.9rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem;
	}

	.feature-card p {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	/* Code block */
	.code-block {
		padding: 1.25rem;
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 10px;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.code-block code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
</style>
