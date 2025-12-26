<!--
	CardStack Template Demo Page

	This page demonstrates both CardStack components with live examples.
	Shows how to import, use, and customise the components.
-->

<script lang="ts">
  import CardStack from "$lib/components/CardStack.svelte";
  import CardStackMotionFlip from "$lib/components/CardStackMotionFlip.svelte";
  import DatabaseStatus from "$lib/components/DatabaseStatus.svelte";
  import type { PageData } from "./$types";

  // Receive card data from server load function
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>CardStack Component - Svelte 5 Templates</title>
  <meta
    name="description"
    content="Interactive card stack components for Svelte 5"
  />
</svelte:head>

<div class="page">
  <div class="container">
    <!-- Header Section -->
    <header>
      <h1>CardStack Components</h1>
      <p class="subtitle">
        Interactive horizontal card displays with hover and swipe interactions
        for Svelte 5
      </p>
      <DatabaseStatus usingDatabase={data.usingDatabase} class="status-badge" />
    </header>

    <!-- CardStack Example -->
    <section class="demo-section">
      <div class="section-header">
        <h2>CardStack</h2>
        <div class="badge badge-premium">Interactive</div>
      </div>

      <p class="description">
        Cards arranged in a horizontal overlapping row with direction-detecting hover.
        <strong>Hover</strong> to preview a card (it rises and shifts based on cursor entry direction),
        then <strong>click</strong> to select and fully reveal it. Use <strong>arrow keys</strong>
        to navigate between cards, or <strong>swipe</strong> on mobile. Perfect for showcasing
        products, portfolios, or image galleries.
      </p>

      <div class="demo-container">
        <CardStack cards={data.cards} />
      </div>

      <!-- Usage Example -->
      <details class="code-block">
        <summary>View Code Example</summary>
        <pre><code
            >{`${'<'}script>
  import CardStack from '$lib/components/CardStack.svelte';

  const cards = [
    {
      image: '/path/to/image.jpg',
      title: 'Card Title',
      content: 'Card description or HTML content'
    },
    // ... more cards
  ];
</script>

<CardStack cards={cards} />

<!-- With custom dimensions -->
<CardStack
  cards={cards}
  cardWidth={350}
  cardHeight={450}
/>

<!-- Keyboard: ← → to navigate, Escape to deselect -->
<!-- Mobile: swipe left/right to navigate -->`}</code
          ></pre>
      </details>
    </section>

    <!-- Motion Flip CardStack Example -->
    <section class="demo-section">
      <div class="section-header">
        <h2>CardStack Motion Flip</h2>
        <div class="badge badge-motion">3D Roll + 4D Swipe</div>
      </div>

      <p class="description">
        Swipe the top card <strong>left/right/up/down</strong> and watch it <strong>roll off-screen</strong>
        in that direction with full 3D rotation, then reappear at the back of the stack
        facing forward. Features real-time drag preview with rotation feedback, instant
        reposition, and smooth fade-in. <strong>Zero dependencies</strong> – pure CSS
        and Svelte. Perfect for mobile-first applications.
      </p>

      <div class="demo-container">
        <CardStackMotionFlip cards={data.cards} />
      </div>

      <!-- Usage Example -->
      <details class="code-block">
        <summary>View Code Example</summary>
        <pre><code
            >{`${'<'}script>
  import CardStackMotionFlip from '$lib/components/CardStackMotionFlip.svelte';

  const cards = [
    {
      image: '/path/to/image.jpg',
      title: 'Card Title',
      content: 'Card description or HTML content'
    },
    // ... more cards
  ];
</script>

<CardStackMotionFlip
  cards={cards}
  cardWidth={300}
  cardHeight={400}
  cardGap={50}
  swipeThreshold={80}
  rollDuration={400}
  enable3D={true}
/>

<!-- Try swiping in any direction! Arrow keys also work. -->`}</code
          ></pre>
      </details>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon">👆</div>
          <h3>Two-Stage Interaction</h3>
          <p>
            Hover to preview (partial reveal), click to select (full reveal)
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">📱</div>
          <h3>Swipe Navigation</h3>
          <p>
            Mobile swipe gestures navigate between cards (CardStack) or roll them through the stack (Motion Flip)
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <h3>Smooth Animations</h3>
          <p>
            Cubic-bezier easing for natural transitions with zero external animation dependencies
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">🎯</div>
          <h3>Direction Detection</h3>
          <p>
            Hover from left or right - the card shifts in the opposite direction for natural feedback
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">🔄</div>
          <h3>3D Roll Effect</h3>
          <p>
            Swipe cards in any direction (L/R/U/D) and watch them roll off-screen with
            full 3D rotation (Motion Flip)
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">📐</div>
          <h3>Horizontal Overlap</h3>
          <p>Cards arranged in an elegant overlapping row layout</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⌨️</div>
          <h3>Keyboard Support</h3>
          <p>
            Arrow keys navigate between cards - Escape to deselect (both versions)
          </p>
        </div>
        <div class="feature">
          <div class="feature-icon">♿</div>
          <h3>Accessible</h3>
          <p>
            Proper ARIA labels, keyboard focus, and prefers-reduced-motion
            support
          </p>
        </div>
      </div>
    </section>

    <!-- Implementation Guide -->
    <section class="guide-section">
      <h2>Quick Start Guide</h2>

      <div class="guide-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Copy the Component</h3>
          <p>
            Copy your chosen component from <code>src/lib/components/</code> to
            your project:
            <code>CardStack.svelte</code> for interactive selection with direction-detecting hover, or
            <code>CardStackMotionFlip.svelte</code> for 3D rolling card deck with 4-directional swipe.
          </p>
        </div>
      </div>

      <div class="guide-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Zero Dependencies</h3>
          <p>
            All components work out of the box with <strong>zero external dependencies</strong>.
            No animation libraries required – everything uses pure CSS transitions
            and Svelte's built-in reactivity.
          </p>
        </div>
      </div>

      <div class="guide-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Prepare Your Data</h3>
          <p>
            Create an array of card objects with <code>image</code>,
            <code>title</code>, and
            <code>content</code> properties.
          </p>
        </div>
      </div>

      <div class="guide-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>Import and Use</h3>
          <p>
            Import the component and pass your cards array as a prop. That's it!
          </p>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .page {
    padding: 4rem 0;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  header :global(.status-badge) {
    margin-top: 0.5rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #1a202c;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 1.25rem;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  /* Demo Sections */
  .demo-section {
    margin-bottom: 5rem;
    padding-bottom: 5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .demo-section:last-of-type {
    border-bottom: none;
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
    margin: 0;
    color: #1a202c;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    background: #edf2f7;
    color: #4a5568;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .badge-premium {
    background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
    color: white;
  }

  .badge-motion {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  .description {
    font-size: 1.125rem;
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  /* Demo Container */
  .demo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 16px;
    padding: 3rem;
    margin-bottom: 2rem;
  }

  /* Code Block */
  .code-block {
    margin-top: 2rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .code-block summary {
    padding: 1rem 1.5rem;
    background: #f7fafc;
    cursor: pointer;
    font-weight: 600;
    color: #1a202c;
    user-select: none;
    transition: background 0.2s ease;
  }

  .code-block summary:hover {
    background: #edf2f7;
  }

  .code-block pre {
    margin: 0;
    padding: 1.5rem;
    background: #1a202c;
    overflow-x: auto;
  }

  .code-block code {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e2e8f0;
  }

  /* Features Section */
  .features-section {
    margin: 4rem 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .feature {
    text-align: center;
    padding: 2rem;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .feature:hover {
    transform: translateY(-2px);
    border-color: #146ef5;
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #1a202c;
  }

  .feature p {
    font-size: 0.95rem;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  /* Guide Section */
  .guide-section {
    margin: 4rem 0;
  }

  .guide-step {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
    padding: 2rem;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .guide-step:hover {
    border-color: #146ef5;
    transform: translateX(4px);
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

  .step-content code {
    padding: 0.125rem 0.375rem;
    background: #edf2f7;
    color: #146ef5;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .demo-container {
      padding: 2rem 1rem;
      min-height: 450px;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .guide-step {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
