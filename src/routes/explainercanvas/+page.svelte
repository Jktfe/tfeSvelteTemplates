<script lang="ts">
	import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
	import { FALLBACK_EXPLAINER_CANVAS_DATA } from '$lib/constants';

	// Use fallback data for demo
	const canvasData = FALLBACK_EXPLAINER_CANVAS_DATA;
</script>

<svelte:head>
	<title>Explainer Canvas - TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Explainer Canvas</h1>
		<p class="subtitle">Interactive knowledge visualization with nested hierarchies</p>
	</header>

	<section class="demo-section">
		<h2>Interactive Demo</h2>
		<p class="instructions">
			<strong>Click</strong> any card to expand it and see detailed content.
			<strong>Click links</strong> to navigate between related cards.
			Cards with a <strong>grid icon</strong> have nested content - click "Explore nested content" to dive in.
			Use <strong>Ctrl+F</strong> to search. <strong>Pan</strong> and <strong>scroll</strong> to zoom.
		</p>

		<div class="demo-container">
			<ExplainerCanvas
				data={canvasData}
				onNavigate={(cardId, path) => console.log('Navigated to:', cardId, path)}
				onExpand={(cardId) => console.log('Expanded:', cardId)}
				onCollapse={(cardId) => console.log('Collapsed:', cardId)}
			/>
		</div>
	</section>

	<section class="documentation-section">
		<h2>Features</h2>
		<ul class="feature-list">
			<li>
				<strong>Pan & Zoom:</strong> Navigate large canvases with mouse drag and scroll wheel
			</li>
			<li>
				<strong>Expand/Collapse Cards:</strong> Click cards to reveal detailed content with markdown
				support
			</li>
			<li>
				<strong>Nested Hierarchies:</strong> Dive into cards that contain sub-canvases for unlimited
				depth
			</li>
			<li>
				<strong>Connection Lines:</strong> Visual links between related cards with hover highlights
			</li>
			<li>
				<strong>Fuzzy Search:</strong> Find cards by title, summary, or content across all levels
			</li>
			<li>
				<strong>Breadcrumb Navigation:</strong> Track your path and navigate back through nested levels
			</li>
			<li>
				<strong>Tooltips:</strong> Define terms that show explanations on hover
			</li>
			<li>
				<strong>Responsive:</strong> Simplified mobile view with accordion-style cards
			</li>
			<li>
				<strong>Accessible:</strong> Keyboard navigation, ARIA labels, screen reader support
			</li>
		</ul>

		<h2>Data Structure</h2>
		<p>The component accepts structured data defining the canvas and its cards:</p>

		<div class="code-block">
			<pre><code>{`const canvasData = {
  id: 'my-canvas',
  title: 'My Knowledge Base',
  defaultCardId: 'intro',  // Card to center on load
  config: {
    lineStyle: 'bezier',   // 'straight' | 'bezier' | 'orthogonal'
    background: { type: 'dots', color: '#00000010', gap: 24 },
    enableSearch: true,
    maxZoomOut: 0.1,
    maxZoomIn: 2
  },
  cards: [
    {
      id: 'intro',
      title: 'Introduction',
      summary: 'Brief overview shown when collapsed',
      position: { x: 0, y: 0 },
      content: [
        { type: 'markdown', content: '## Hello World\\n...' },
        { type: 'image', src: '/diagram.png', alt: 'Diagram' }
      ],
      links: ['concept-a', 'concept-b'],  // IDs of related cards
      tooltips: [
        { term: 'example', definition: 'Shown on hover' }
      ],
      children: [  // Nested sub-canvas
        {
          id: 'detail-1',
          title: 'Detail 1',
          summary: '...',
          position: { x: 0, y: 0 },
          content: [{ type: 'markdown', content: '...' }]
        }
      ]
    }
  ]
};`}</code></pre>
		</div>

		<h2>Usage Examples</h2>

		<h3>Direct Data</h3>
		<div class="code-block">
			<pre><code>{`${'<'}script>
  import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
  import { myCanvasData } from './data';
${'<'}/script>

<ExplainerCanvas data={myCanvasData} />`}</code></pre>
		</div>

		<h3>Load from JSON</h3>
		<div class="code-block">
			<pre><code>&lt;ExplainerCanvas src="/data/canvas.json" /&gt;</code></pre>
		</div>

		<h3>Custom Async Loader</h3>
		<div class="code-block">
			<pre><code>{`<ExplainerCanvas
  loader={async () => {
    const res = await fetch('/api/canvas/123');
    return res.json();
  }}
/>`}</code></pre>
		</div>

		<h3>With Event Handlers</h3>
		<div class="code-block">
			<pre><code>{`<ExplainerCanvas
  data={canvasData}
  onNavigate={(cardId, path) => console.log('Navigated:', cardId)}
  onExpand={(cardId) => trackAnalytics('card_expand', cardId)}
  onSearch={(query, results) => console.log('Search:', query)}
/>`}</code></pre>
		</div>

		<h2>Content Block Types</h2>
		<table class="props-table">
			<thead>
				<tr>
					<th>Type</th>
					<th>Properties</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>markdown</code></td>
					<td><code>content: string</code></td>
					<td>Markdown text with syntax highlighting for code</td>
				</tr>
				<tr>
					<td><code>image</code></td>
					<td><code>src, alt?, caption?</code></td>
					<td>Responsive image with optional caption</td>
				</tr>
				<tr>
					<td><code>embed</code></td>
					<td><code>url, aspectRatio?</code></td>
					<td>iframe embed (videos, etc.)</td>
				</tr>
			</tbody>
		</table>

		<h2>Props</h2>
		<table class="props-table">
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
					<td><code>data</code></td>
					<td><code>ExplainerCanvasData</code></td>
					<td>—</td>
					<td>Direct data object</td>
				</tr>
				<tr>
					<td><code>src</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>URL to JSON file</td>
				</tr>
				<tr>
					<td><code>loader</code></td>
					<td><code>() => Promise</code></td>
					<td>—</td>
					<td>Custom async loader function</td>
				</tr>
				<tr>
					<td><code>initialCardId</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Override defaultCardId from data</td>
				</tr>
				<tr>
					<td><code>lineStyle</code></td>
					<td><code>'straight' | 'bezier' | 'orthogonal'</code></td>
					<td><code>'bezier'</code></td>
					<td>Style of connection lines</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Additional CSS classes</td>
				</tr>
				<tr>
					<td><code>onNavigate</code></td>
					<td><code>(cardId, path) => void</code></td>
					<td>—</td>
					<td>Called when navigating to a card</td>
				</tr>
				<tr>
					<td><code>onExpand</code></td>
					<td><code>(cardId) => void</code></td>
					<td>—</td>
					<td>Called when a card is expanded</td>
				</tr>
				<tr>
					<td><code>onCollapse</code></td>
					<td><code>(cardId) => void</code></td>
					<td>—</td>
					<td>Called when a card is collapsed</td>
				</tr>
				<tr>
					<td><code>onSearch</code></td>
					<td><code>(query, results) => void</code></td>
					<td>—</td>
					<td>Called when search is performed</td>
				</tr>
			</tbody>
		</table>

		<h2>Keyboard Shortcuts</h2>
		<table class="props-table">
			<thead>
				<tr>
					<th>Key</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>Ctrl/Cmd + F</code></td>
					<td>Open search panel</td>
				</tr>
				<tr>
					<td><code>Escape</code></td>
					<td>Close expanded card or search</td>
				</tr>
				<tr>
					<td><code>+</code> / <code>-</code></td>
					<td>Zoom in / out</td>
				</tr>
				<tr>
					<td><code>Tab</code></td>
					<td>Navigate between cards</td>
				</tr>
				<tr>
					<td><code>Enter</code></td>
					<td>Expand/collapse focused card</td>
				</tr>
			</tbody>
		</table>

		<h2>CSS Custom Properties</h2>
		<p>Customise the canvas appearance using CSS variables:</p>
		<div class="code-block">
			<pre><code>{`/* In your parent CSS */
.my-canvas {
  --ec-bg: #f9fafb;
  --ec-bg-card: #ffffff;
  --ec-border: #e0e0e0;
  --ec-text: #1a1a1a;
  --ec-text-muted: #666666;
  --ec-primary: #3b82f6;
  --ec-radius: 12px;
  --ec-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --ec-line-color: #999999;
  --ec-line-opacity: 0.15;
  --ec-line-opacity-active: 1;
}`}</code></pre>
		</div>

		<h2>Dependencies</h2>
		<ul class="dependency-list">
			<li><code>@panzoom/panzoom</code> - Canvas pan and zoom</li>
			<li><code>marked</code> - Markdown rendering</li>
			<li><code>highlight.js</code> - Code syntax highlighting</li>
			<li><code>fuse.js</code> - Fuzzy search</li>
		</ul>
		<p class="install-note">
			Install with: <code>bun add @panzoom/panzoom marked highlight.js fuse.js</code>
		</p>

		<h2>Use Cases</h2>
		<ul class="feature-list">
			<li><strong>Technical Documentation:</strong> Component architecture, API explanations</li>
			<li><strong>Business Process Mapping:</strong> Workflows, decision trees</li>
			<li><strong>Educational Content:</strong> Tutorials, course materials</li>
			<li><strong>Product Features:</strong> Feature explanations, onboarding flows</li>
			<li><strong>Knowledge Bases:</strong> Interconnected concepts, wikis</li>
		</ul>
	</section>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #666;
	}

	.demo-section,
	.documentation-section {
		margin-bottom: 3rem;
	}

	.demo-section h2,
	.documentation-section h2 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 1rem;
		margin-top: 2rem;
	}

	.documentation-section h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
	}

	.instructions {
		background: #f0f9ff;
		border-left: 4px solid #3b82f6;
		padding: 1rem;
		margin-bottom: 2rem;
		border-radius: 4px;
		color: #1e40af;
	}

	.demo-container {
		background: #f9fafb;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		height: 600px;
		overflow: hidden;
	}

	.feature-list,
	.dependency-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 2rem 0;
	}

	.feature-list li,
	.dependency-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.feature-list li:last-child,
	.dependency-list li:last-child {
		border-bottom: none;
	}

	.code-block {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1rem 0 2rem 0;
	}

	.code-block pre {
		margin: 0;
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.code-block code {
		font-family: inherit;
	}

	code {
		background: #f1f5f9;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'SF Mono', Monaco, 'Courier New', monospace;
		font-size: 0.875rem;
		color: #dc2626;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0 2rem 0;
	}

	.props-table th,
	.props-table td {
		text-align: left;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.props-table th {
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
	}

	.props-table td code {
		background: #f1f5f9;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.8125rem;
	}

	.install-note {
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		padding: 1rem;
		margin-top: 1rem;
		border-radius: 4px;
		color: #92400e;
	}

	.install-note code {
		background: #fde68a;
		color: #78350f;
	}
</style>
