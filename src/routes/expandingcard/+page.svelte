<!--
	ExpandingCard Component Demo Page

	This page demonstrates the ExpandingCard component with crossfade layout transitions.
	Shows various configurations and customisation options.
-->

<script lang="ts">
  import ExpandingCard from "$lib/components/ExpandingCard.svelte";
  import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
  import type { PageData } from './$types';

  // Get server data
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>ExpandingCard Component - Svelte 5 Templates</title>
  <meta
    name="description"
    content="Interactive card with expandable layouts using Svelte crossfade transitions"
  />
</svelte:head>

<div class="page">
  <div class="container">
    <!-- Header Section -->
    <header>
      <h1>🎴 ExpandingCard Component</h1>
      <p class="subtitle">
        An interactive card that smoothly transitions between compact and
        expanded layouts. Uses Svelte's built-in crossfade transitions for
        seamless element morphing. Perfect for galleries, portfolios, or any
        content that benefits from progressive disclosure.
      </p>
      <DatabaseStatus usingDatabase={data.usingDatabase} class="status-badge" />
    </header>

    <!-- Basic Demo -->
    <section class="demo-section">
      <div class="section-header">
        <h2>Interactive Demo</h2>
        <div class="badge">Click to Toggle</div>
      </div>

      <p class="description">
        Click the card to toggle between compact (vertical) and expanded
        (horizontal) layouts. Notice how the image, heading, and text smoothly
        transition between positions.
      </p>

      <div class="demo-container-tall">
        <ExpandingCard
          imageSrc="https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg"
          imageAlt="Saturn Artwork"
          heading="Mumbai City"
          compactText="Thank you Sikandar Bhide for this awesome element"
          expandedText="Most of the edits are to update/ remove the dependencies. but you started it all. Thank you!"
        />
      </div>

      <!-- Usage Example -->
      <details class="code-block">
        <summary>View Code Example</summary>
        <pre><code
            >{`${'<'}script>
  import ExpandingCard from '$lib/components/ExpandingCard.svelte';
</script>

<ExpandingCard
  imageSrc="https://example.com/image.jpg"
  imageAlt="Description"
  heading="Card Title"
  compactText="Short preview text"
  expandedText="Detailed description with more information"
/>`}</code
          ></pre>
      </details>
    </section>

    <!-- Database-Driven Content -->
    <section class="demo-section">
      <div class="section-header">
        <h2>Database Content</h2>
        <div class="badge">Dynamic Data</div>
      </div>

      <p class="description">
        These cards are loaded from the database (or fallback data if DATABASE_URL is not configured).
        Each card maintains visual continuity during the transition.
      </p>

      {#each data.expandingCards as card (card.heading)}
        <div class="demo-container-tall">
          <ExpandingCard
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt}
            heading={card.heading}
            compactText={card.compactText}
            expandedText={card.expandedText}
            bgColor={card.bgColor}
          />
        </div>
      {/each}

      <details class="code-block">
        <summary>View Code Example</summary>
        <pre><code
            >{`${'<'}script>
  // Data loaded from server
  let { data } = $props();
</script>

{#each data.expandingCards as card (card.heading)}
  <ExpandingCard
    imageSrc={card.imageSrc}
    imageAlt={card.imageAlt}
    heading={card.heading}
    compactText={card.compactText}
    expandedText={card.expandedText}
    bgColor={card.bgColor}
  />
{/each}`}</code
          ></pre>
      </details>
    </section>

    <!-- Colour Variations -->
    <section class="demo-section">
      <div class="section-header">
        <h2>Background Colours</h2>
      </div>

      <p class="description">
        Use the <code>bgColor</code> prop to apply different Tailwind background
        colours.
      </p>

      <div class="colour-grid">
        <div class="colour-demo">
          <div class="colour-demo-container">
            <ExpandingCard
              imageSrc="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop"
              imageAlt="Forest"
              heading="Forest Path"
              compactText="Through emerald canopies"
              expandedText="Wandering through ancient woods filled with life"
              bgColor="bg-green-100"
            />
          </div>
          <p class="colour-label">Green (bg-green-100)</p>
        </div>

        <div class="colour-demo">
          <div class="colour-demo-container">
            <ExpandingCard
              imageSrc="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=400&fit=crop"
              imageAlt="Desert"
              heading="Desert Dunes"
              compactText="Golden sands sculpted by wind"
              expandedText="Creating an ever-changing landscape of beauty"
              bgColor="bg-orange-100"
            />
          </div>
          <p class="colour-label">Orange (bg-orange-100)</p>
        </div>

        <div class="colour-demo">
          <div class="colour-demo-container">
            <ExpandingCard
              imageSrc="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop"
              imageAlt="Ocean"
              heading="Ocean Waves"
              compactText="Rhythmic dance of nature"
              expandedText="The timeless symphony of waves meeting shore"
              bgColor="bg-cyan-100"
            />
          </div>
          <p class="colour-label">Cyan (bg-cyan-100)</p>
        </div>

        <div class="colour-demo">
          <div class="colour-demo-container">
            <ExpandingCard
              imageSrc="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=400&fit=crop"
              imageAlt="Aurora"
              heading="Northern Lights"
              compactText="Nature's light show"
              expandedText="Ethereal colours painting the Arctic sky"
              bgColor="bg-purple-100"
            />
          </div>
          <p class="colour-label">Purple (bg-purple-100)</p>
        </div>
      </div>

      <details class="code-block">
        <summary>View Code Example</summary>
        <pre><code
            >{`<ExpandingCard bgColor="bg-green-100" ... />
<ExpandingCard bgColor="bg-orange-100" ... />
<ExpandingCard bgColor="bg-cyan-100" ... />
<ExpandingCard bgColor="bg-purple-100" ... />`}</code
          ></pre>
      </details>
    </section>

    <!-- Features Grid -->
    <section class="features-section">
      <h2>Component Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎬</div>
          <h3>Crossfade Transitions</h3>
          <p>
            Uses Svelte's built-in crossfade for seamless element morphing
            between layouts.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>Customisable Content</h3>
          <p>
            Configure image, heading, descriptions, and background colours via
            props.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Responsive Design</h3>
          <p>
            Adapts to different screen sizes with mobile-optimised layout
            scaling.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>Zero Dependencies</h3>
          <p>
            Uses only Svelte's built-in transition system - no external
            libraries.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Performant</h3>
          <p>
            Smooth 60fps animations with efficient DOM updates and transitions.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">♿</div>
          <h3>Accessible</h3>
          <p>
            Semantic button element with proper ARIA labels for expand/collapse
            states.
          </p>
        </div>
      </div>
    </section>

    <!-- Implementation Guide -->
    <section class="guide-section">
      <h2>Quick Start Guide</h2>
      <div class="guide-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Copy the Component</h3>
            <p>
              Copy <code>ExpandingCard.svelte</code> from
              <code>src/lib/components/</code> to your project.
            </p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Prepare Your Content</h3>
            <p>
              Gather your image URL, heading text, and description content for
              both compact and expanded states.
            </p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Import and Configure</h3>
            <p>
              Import the component and pass your content via props. All props
              are optional with sensible defaults.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Props Reference -->
    <section class="props-section">
      <h2>Props Reference</h2>
      <div class="props-table">
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
              <td><code>imageSrc</code></td>
              <td>string</td>
              <td>placeholder</td>
              <td>URL to the card image</td>
            </tr>
            <tr>
              <td><code>imageAlt</code></td>
              <td>string</td>
              <td>'Card Image'</td>
              <td>Alt text for the image</td>
            </tr>
            <tr>
              <td><code>heading</code></td>
              <td>string</td>
              <td>'Card Title'</td>
              <td>Card heading text</td>
            </tr>
            <tr>
              <td><code>compactText</code></td>
              <td>string</td>
              <td>'Hello Devs...'</td>
              <td>Text shown in compact layout</td>
            </tr>
            <tr>
              <td><code>expandedText</code></td>
              <td>string</td>
              <td>'Yoo devs...'</td>
              <td>Text shown in expanded layout</td>
            </tr>
            <tr>
              <td><code>bgColor</code></td>
              <td>string</td>
              <td>'bg-lime-100'</td>
              <td>Tailwind background colour class</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="use-cases-section">
      <h2>Use Cases</h2>
      <div class="use-cases-grid">
        <div class="use-case">
          <h3>🖼️ Image Galleries</h3>
          <p>
            Create interactive photo galleries where users can expand cards for
            more details.
          </p>
        </div>

        <div class="use-case">
          <h3>📰 Article Previews</h3>
          <p>
            Show article excerpts that expand to reveal more content without
            navigation.
          </p>
        </div>

        <div class="use-case">
          <h3>🏢 Team Profiles</h3>
          <p>
            Compact team member cards that expand to show bio and contact
            information.
          </p>
        </div>

        <div class="use-case">
          <h3>📦 Product Showcases</h3>
          <p>
            Display product thumbnails that expand to reveal specifications and
            pricing.
          </p>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  /* Page Layout */
  .page {
    padding: 4rem 0;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Header */
  header {
    text-align: center;
    margin-bottom: 4rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #1a202c;
  }

  .subtitle {
    font-size: 1.25rem;
    color: #718096;
    margin: 0;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  /* Sections */
  .demo-section,
  .features-section,
  .guide-section,
  .props-section,
  .use-cases-section {
    margin-bottom: 4rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    background: #edf2f7;
    color: #4a5568;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 9999px;
  }

  .description {
    font-size: 1rem;
    color: #4a5568;
    margin: 0 0 2rem 0;
    line-height: 1.6;
  }

  /* Demo Container */
  .demo-container-tall {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem 1rem;
    min-height: 500px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .colour-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    margin-bottom: 2rem;
  }

  .colour-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .colour-demo-container {
    position: relative;
    width: 100%;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 12px;
    padding: 2rem 1rem;
  }

  .colour-label {
    font-size: 0.875rem;
    color: #718096;
    margin: 0;
    text-align: center;
    font-weight: 600;
  }

  /* Code Blocks */
  code {
    padding: 0.125rem 0.375rem;
    background: #edf2f7;
    color: #146ef5;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  }

  .code-block {
    margin-top: 2rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .code-block summary {
    padding: 1rem 1.5rem;
    background: #f7fafc;
    cursor: pointer;
    font-weight: 600;
    color: #1a202c;
    user-select: none;
  }

  .code-block summary:hover {
    background: #edf2f7;
  }

  .code-block pre {
    margin: 0;
    padding: 1.5rem;
    background: #1a202c;
    color: #e2e8f0;
    overflow-x: auto;
  }

  .code-block code {
    background: transparent;
    color: #e2e8f0;
    padding: 0;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    text-align: center;
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: #1a202c;
  }

  .feature-card p {
    font-size: 0.95rem;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  /* Guide Steps */
  .guide-steps {
    max-width: 800px;
    margin: 0 auto;
  }

  .step {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
  }

  .step-number {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: 50%;
  }

  .step-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #1a202c;
  }

  .step-content p {
    font-size: 1rem;
    color: #4a5568;
    margin: 0;
    line-height: 1.6;
  }

  /* Props Table */
  .props-table {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f7fafc;
    font-weight: 600;
    color: #1a202c;
  }

  td {
    color: #4a5568;
  }

  tr:last-child td {
    border-bottom: none;
  }

  /* Use Cases */
  .use-cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .use-case {
    padding: 2rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
  }

  .use-case h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: #1a202c;
  }

  .use-case p {
    font-size: 0.95rem;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  :global(.status-badge) {
    margin-top: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 1.1rem;
    }

    .colour-grid {
      grid-template-columns: 1fr;
    }

    .step {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
