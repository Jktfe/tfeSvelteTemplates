<!--
	============================================================
	BeforeAfter Demo Page (TFE shell)
	============================================================

	Migrated onto ComponentPageShell. The interactive comparison
	stays canvas/clip-path driven; the surrounding scaffolding
	is shared with the rest of the catalogue.
-->

<script lang="ts">
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/beforeafter')!;

	let currentPosition = $state(50);

	function handlePositionChange(position: number) {
		currentPosition = position;
	}

	const usageSnippet = `<script>
  import BeforeAfter from '$lib/components/BeforeAfter.svelte';
<\/script>

<BeforeAfter
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  beforeLabel="Before"
  afterLabel="After"
  aspectRatio="16/9"
  initialPosition={50}
  onChange={(pos) => console.log('Position:', pos)}
/>`;

	const codeExplanation =
		'BeforeAfter stacks two images and uses CSS clip-path: inset() to reveal the "after" panel. Pointer Events drive the divider with pointer capture so dragging stays smooth even when the cursor leaves the bounds, and arrow keys nudge the slider for keyboard users. Fully GPU-accelerated, zero canvas, zero dependencies.';
</script>

<svelte:head>
	<title>BeforeAfter — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive Svelte 5 before/after comparison with draggable divider, keyboard nav, and zero dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Pointer Events', 'CSS clip-path', 'Keyboard', 'Zero deps']}
>
	{#snippet demo()}
		<div class="ba-demo">
			<div class="ba-block">
				<div class="ba-block__head">
					<h3>Basic comparison</h3>
					<p>Default 16:9 with the divider centred. Drag or use arrow keys.</p>
				</div>
				<BeforeAfter
					beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop"
					afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop&sat=-100"
				/>
			</div>

			<div class="ba-block">
				<div class="ba-block__head">
					<h3>Labelled, larger handle</h3>
					<p>Thicker divider (3px) and 56px handle for forgiving mobile interaction.</p>
				</div>
				<BeforeAfter
					beforeImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=450&fit=crop"
					afterImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=450&fit=crop&sat=-100&bri=50"
					beforeLabel="Before"
					afterLabel="After"
					dividerWidth={3}
					handleSize={56}
				/>
			</div>

			<div class="ba-block">
				<div class="ba-block__head">
					<h3>Initial position 25% · square</h3>
					<p>
						Starts mostly revealing the enhanced version. Live position:
						<strong>{Math.round(currentPosition)}%</strong>
					</p>
				</div>
				<BeforeAfter
					beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop"
					afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&sat=-100&con=50"
					beforeLabel="Original"
					afterLabel="Enhanced"
					aspectRatio="1/1"
					initialPosition={25}
					onChange={handlePositionChange}
				/>
			</div>

			<div class="ba-block">
				<div class="ba-block__head">
					<h3>Branded blue accent</h3>
					<p>Custom divider colour and handle colour for product or marketing pages.</p>
				</div>
				<BeforeAfter
					beforeImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop"
					afterImage="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop&sat=-100"
					beforeLabel="Low quality"
					afterLabel="High quality"
					aspectRatio="1/1"
					dividerColor="#3b82f6"
					dividerWidth={4}
					handleColor="#3b82f6"
					handleSize={60}
				/>
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
					<td><code>beforeImage</code></td>
					<td><code>string</code></td>
					<td>required</td>
					<td>URL for the "before" image.</td>
				</tr>
				<tr>
					<td><code>afterImage</code></td>
					<td><code>string</code></td>
					<td>required</td>
					<td>URL for the "after" image.</td>
				</tr>
				<tr>
					<td><code>beforeAlt</code> / <code>afterAlt</code></td>
					<td><code>string</code></td>
					<td><code>'Before'</code> / <code>'After'</code></td>
					<td>Alt text for each image.</td>
				</tr>
				<tr>
					<td><code>beforeLabel</code> / <code>afterLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Optional on-image labels.</td>
				</tr>
				<tr>
					<td><code>aspectRatio</code></td>
					<td><code>string</code></td>
					<td><code>'16/9'</code></td>
					<td>CSS aspect ratio (e.g. <code>'1/1'</code>, <code>'4/3'</code>).</td>
				</tr>
				<tr>
					<td><code>width</code></td>
					<td><code>number | string</code></td>
					<td><code>'100%'</code></td>
					<td>Container width in pixels or percentage.</td>
				</tr>
				<tr>
					<td><code>initialPosition</code></td>
					<td><code>number</code></td>
					<td><code>50</code></td>
					<td>Starting divider position (0–100).</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disable dragging entirely.</td>
				</tr>
				<tr>
					<td><code>dividerColor</code></td>
					<td><code>string</code></td>
					<td><code>'#ffffff'</code></td>
					<td>Divider line colour (hex).</td>
				</tr>
				<tr>
					<td><code>dividerWidth</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Divider line width in pixels.</td>
				</tr>
				<tr>
					<td><code>handleSize</code></td>
					<td><code>number</code></td>
					<td><code>48</code></td>
					<td>Handle circle diameter in pixels.</td>
				</tr>
				<tr>
					<td><code>handleColor</code></td>
					<td><code>string</code></td>
					<td><code>'#ffffff'</code></td>
					<td>Handle background colour (hex).</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(pos: number) =&gt; void</code></td>
					<td>—</td>
					<td>Called whenever the divider moves.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra classes for the outer wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ba-demo {
		display: grid;
		gap: 24px;
	}
	.ba-block {
		display: grid;
		gap: 12px;
		padding: 20px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.ba-block__head h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--fg-1);
	}
	.ba-block__head p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
</style>
