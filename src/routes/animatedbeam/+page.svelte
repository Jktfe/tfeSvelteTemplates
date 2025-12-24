<script lang="ts">
	/**
	 * AnimatedBeam Demo Page
	 *
	 * This page demonstrates the AnimatedBeam component with multiple examples:
	 * - Uni-directional flow (source → target)
	 * - Bi-directional flow (A ↔ B)
	 * - Multiple inputs (many → one)
	 * - Customization options (speed, colours, gradient)
	 * - Features grid
	 * - Props reference
	 * - Use cases
	 *
	 * Serves as both a functional demo and documentation for developers.
	 */

	import AnimatedBeam from '$lib/components/AnimatedBeam.svelte';
	import {
		DEFAULT_BEAM_NODES_UNI,
		DEFAULT_BEAM_CONNECTIONS_UNI,
		DEFAULT_BEAM_NODES_BI,
		DEFAULT_BEAM_CONNECTIONS_BI,
		DEFAULT_BEAM_NODES_MULTI,
		DEFAULT_BEAM_CONNECTIONS_MULTI
	} from '$lib/constants';
</script>

<svelte:head>
	<title>AnimatedBeam Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Animated beam component for visualizing connections and data flows with SVG and CSS"
	/>
</svelte:head>

<div class="page-container">
	<!-- Page Header -->
	<header class="page-header">
		<h1 class="page-title">⚡ AnimatedBeam Component</h1>
		<p class="page-description">
			Visualise connections and data flows with animated beams connecting nodes. Perfect for
			system architecture diagrams, data pipeline visualisations, network topology maps, and process
			flows. Built with pure SVG and CSS for zero-dependency portability.
		</p>
	</header>

	<!-- Uni-Directional Example -->
	<section class="demo-section">
		<h2 class="section-title">Uni-Directional Flow</h2>
		<p class="section-description">
			Beams flow in a single direction from source to target, ideal for representing one-way data
			flows or sequential processes.
		</p>
		<div class="demo-container">
			<AnimatedBeam
				nodes={DEFAULT_BEAM_NODES_UNI}
				connections={DEFAULT_BEAM_CONNECTIONS_UNI}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<AnimatedBeam
  nodes={[
    { id: 'source', x: 100, y: 200, label: 'Source' },
    { id: 'target', x: 500, y: 200, label: 'Target' }
  ]}
  connections={[{ from: 'source', to: 'target' }]}
/>`}</code></pre>
		</div>
	</section>

	<!-- Bi-Directional Example -->
	<section class="demo-section">
		<h2 class="section-title">Bi-Directional Flow</h2>
		<p class="section-description">
			Beams travel in both directions simultaneously, perfect for representing two-way communication
			or synchronisation processes.
		</p>
		<div class="demo-container">
			<AnimatedBeam
				nodes={DEFAULT_BEAM_NODES_BI}
				connections={DEFAULT_BEAM_CONNECTIONS_BI}
				bidirectional={true}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<AnimatedBeam
  nodes={[
    { id: 'a', x: 100, y: 200, label: 'A' },
    { id: 'b', x: 500, y: 200, label: 'B' }
  ]}
  connections={[{ from: 'a', to: 'b', bidirectional: true }]}
/>`}</code></pre>
		</div>
	</section>

	<!-- Multiple Inputs Example -->
	<section class="demo-section">
		<h2 class="section-title">Multiple Inputs</h2>
		<p class="section-description">
			Multiple beams from various sources converge to a single target, great for visualising data
			aggregation or fan-in patterns.
		</p>
		<div class="demo-container">
			<AnimatedBeam
				nodes={DEFAULT_BEAM_NODES_MULTI}
				connections={DEFAULT_BEAM_CONNECTIONS_MULTI}
			/>
		</div>
		<div class="code-example">
			<pre><code>{`<AnimatedBeam
  nodes={[
    { id: 'input1', x: 100, y: 100, label: 'Input 1' },
    { id: 'input2', x: 100, y: 200, label: 'Input 2' },
    { id: 'input3', x: 100, y: 300, label: 'Input 3' },
    { id: 'output', x: 500, y: 200, label: 'Output' }
  ]}
  connections={[
    { from: 'input1', to: 'output' },
    { from: 'input2', to: 'output' },
    { from: 'input3', to: 'output' }
  ]}
/>`}</code></pre>
		</div>
	</section>

	<!-- Customization Examples -->
	<section class="demo-section">
		<h2 class="section-title">Customization Options</h2>
		<p class="section-description">
			Customise colours, speeds, sizes, and effects to match your design system.
		</p>

		<div class="customization-grid">
			<!-- Speed variations -->
			<div class="custom-demo">
				<h3 class="custom-title">Fast (1s)</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					beamSpeed={1}
				/>
			</div>

			<div class="custom-demo">
				<h3 class="custom-title">Slow (4s)</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					beamSpeed={4}
				/>
			</div>

			<!-- Colour variations -->
			<div class="custom-demo">
				<h3 class="custom-title">Green Theme</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					beamColor="#10b981"
					nodeColor="#10b981"
				/>
			</div>

			<div class="custom-demo">
				<h3 class="custom-title">Purple Theme</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					beamColor="#8b5cf6"
					nodeColor="#8b5cf6"
				/>
			</div>

			<!-- Gradient option -->
			<div class="custom-demo">
				<h3 class="custom-title">With Gradient</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					gradient={true}
				/>
			</div>

			<!-- Thicker beams -->
			<div class="custom-demo">
				<h3 class="custom-title">Thick Beams</h3>
				<AnimatedBeam
					nodes={DEFAULT_BEAM_NODES_UNI}
					connections={DEFAULT_BEAM_CONNECTIONS_UNI}
					beamWidth={4}
					nodeSize={16}
				/>
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="features-section">
		<h2 class="section-title">Component Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">🎨</div>
				<h3 class="feature-title">Fully Customisable</h3>
				<p class="feature-text">
					Configure colours, speeds, sizes, and animation patterns via props. Match any design
					system.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">⚡</div>
				<h3 class="feature-title">Pure CSS Animation</h3>
				<p class="feature-text">
					Smooth 60fps animations using CSS keyframes. No JavaScript runtime overhead,
					hardware-accelerated.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">📐</div>
				<h3 class="feature-title">SVG-Based</h3>
				<p class="feature-text">
					Crisp rendering at any scale using SVG graphics. Perfect for responsive designs and
					high-DPI displays.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">🔌</div>
				<h3 class="feature-title">Zero Dependencies</h3>
				<p class="feature-text">
					No external libraries required. Fully self-contained component you can copy-paste
					anywhere.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">♿</div>
				<h3 class="feature-title">Accessible</h3>
				<p class="feature-text">
					Respects prefers-reduced-motion for users with motion sensitivity. ARIA labels for screen
					readers.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" aria-hidden="true">🎯</div>
				<h3 class="feature-title">TypeScript Ready</h3>
				<p class="feature-text">
					Fully typed props with comprehensive interfaces. Autocomplete and type checking built-in.
				</p>
			</div>
		</div>
	</section>

	<!-- Props Reference -->
	<section class="props-section">
		<h2 class="section-title">Props Reference</h2>
		<div class="props-table-wrapper">
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
						<td><code>width</code></td>
						<td>number</td>
						<td>600</td>
						<td>Container width in pixels</td>
					</tr>
					<tr>
						<td><code>height</code></td>
						<td>number</td>
						<td>400</td>
						<td>Container height in pixels</td>
					</tr>
					<tr>
						<td><code>nodes</code></td>
						<td>BeamNode[]</td>
						<td>[]</td>
						<td>Array of node objects with id, x, y, label</td>
					</tr>
					<tr>
						<td><code>connections</code></td>
						<td>BeamConnection[]</td>
						<td>[]</td>
						<td>Array defining which nodes connect</td>
					</tr>
					<tr>
						<td><code>beamColor</code></td>
						<td>string</td>
						<td>'#3b82f6'</td>
						<td>Colour of the animated beams (hex format)</td>
					</tr>
					<tr>
						<td><code>beamWidth</code></td>
						<td>number</td>
						<td>2</td>
						<td>Width of beam lines in pixels</td>
					</tr>
					<tr>
						<td><code>beamSpeed</code></td>
						<td>number</td>
						<td>2</td>
						<td>Animation duration in seconds</td>
					</tr>
					<tr>
						<td><code>bidirectional</code></td>
						<td>boolean</td>
						<td>false</td>
						<td>Enable bi-directional flow animation</td>
					</tr>
					<tr>
						<td><code>gradient</code></td>
						<td>boolean</td>
						<td>false</td>
						<td>Use gradient instead of dashed line</td>
					</tr>
					<tr>
						<td><code>nodeSize</code></td>
						<td>number</td>
						<td>12</td>
						<td>Radius of node circles in pixels</td>
					</tr>
					<tr>
						<td><code>nodeColor</code></td>
						<td>string</td>
						<td>'#3b82f6'</td>
						<td>Fill colour for node circles (hex format)</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Use Cases -->
	<section class="use-cases-section">
		<h2 class="section-title">Use Cases</h2>
		<div class="use-cases-grid">
			<div class="use-case">
				<div class="use-case-icon" aria-hidden="true">🏗️</div>
				<h3 class="use-case-title">System Architecture</h3>
				<p class="use-case-text">
					Visualise microservices, APIs, and system components with data flow animations.
				</p>
			</div>

			<div class="use-case">
				<div class="use-case-icon" aria-hidden="true">📊</div>
				<h3 class="use-case-title">Data Pipelines</h3>
				<p class="use-case-text">
					Show ETL processes, data transformations, and pipeline stages with directional flows.
				</p>
			</div>

			<div class="use-case">
				<div class="use-case-icon" aria-hidden="true">🔗</div>
				<h3 class="use-case-title">Network Topology</h3>
				<p class="use-case-text">
					Display network connections, nodes, and traffic patterns in real-time visualisations.
				</p>
			</div>

			<div class="use-case">
				<div class="use-case-icon" aria-hidden="true">🎯</div>
				<h3 class="use-case-title">Process Flows</h3>
				<p class="use-case-text">
					Illustrate business processes, workflows, and decision trees with animated connections.
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/**
	 * Page Layout Styles
	 * Scoped to this demo page only
	 */

	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	/* Header */
	.page-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 1rem 0;
	}

	.page-description {
		font-size: 1.125rem;
		color: #6b7280;
		line-height: 1.75;
		max-width: 800px;
		margin: 0 auto;
	}

	/* Demo Sections */
	.demo-section {
		margin-bottom: 4rem;
	}

	.section-title {
		font-size: 1.875rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.75rem 0;
	}

	.section-description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.demo-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 3rem 2rem;
		background-color: #f9fafb;
		border-radius: 12px;
		margin-bottom: 1rem;
		min-height: 450px;
	}

	/* Code Examples */
	.code-example {
		background-color: #1f2937;
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
	}

	.code-example pre {
		margin: 0;
	}

	.code-example code {
		color: #f3f4f6;
		font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	/* Customization Grid */
	.customization-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.custom-demo {
		background-color: #f9fafb;
		border-radius: 12px;
		padding: 2rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		min-height: 450px;
		justify-content: center;
	}

	.custom-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	/* Features Grid */
	.features-section {
		margin-bottom: 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		transition: all 0.2s ease-in-out;
	}

	.feature-card:hover {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.feature-text {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	/* Props Table */
	.props-section {
		margin-bottom: 4rem;
	}

	.props-table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.props-table {
		width: 100%;
		border-collapse: collapse;
		background-color: white;
	}

	.props-table th {
		background-color: #f9fafb;
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
	}

	.props-table td {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		border-bottom: 1px solid #f3f4f6;
	}

	.props-table code {
		background-color: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		color: #111827;
		font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
	}

	.props-table tbody tr:last-child td {
		border-bottom: none;
	}

	/* Use Cases */
	.use-cases-section {
		margin-bottom: 4rem;
	}

	.use-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.use-case {
		background-color: #f9fafb;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
	}

	.use-case-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.use-case-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.use-case-text {
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-title {
			font-size: 2rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.demo-container {
			padding: 1.5rem 0.75rem;
			min-height: auto;
		}

		.custom-demo {
			min-height: auto;
			padding: 1.5rem 0.75rem;
		}

		.customization-grid,
		.features-grid,
		.use-cases-grid {
			grid-template-columns: 1fr;
		}

		.code-example {
			font-size: 0.75rem;
		}
	}
</style>
