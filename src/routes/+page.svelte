<!--
	Component Template Library Home Page

	This is the landing page showcasing all available components.
	Each component card links to its dedicated demo page.
-->

<script lang="ts">
  import ShineBorder from "$lib/components/ShineBorder.svelte";

  interface ComponentCard {
    title: string;
    description: string;
    href: string;
    icon: string;
    features: string[];
    status: "ready" | "coming-soon";
  }

  interface IntegrationCard {
    title: string;
    description: string;
    href: string;
    icon: string;
    features: string[];
    dependency: string;
    dependencyUrl: string;
  }

  const integrations: IntegrationCard[] = [
    {
      title: "Clerk Auth",
      description:
        "Complete authentication integration with sign-in, sign-up, user management, and protected routes. Features graceful fallback when not configured, making it perfect for template projects.",
      href: "/auth",
      icon: "🔐",
      features: [
        "Sign in/up flows",
        "Protected routes",
        "User management",
        "Demo mode fallback",
      ],
      dependency: "svelte-clerk",
      dependencyUrl: "https://github.com/markjaquith/svelte-clerk",
    },
  ];

  const components: ComponentCard[] = [
    {
      title: "Navbar",
      description:
        "Framework7-style navigation bar with hamburger menu and left-sliding panel. Features smooth animations, backdrop overlay, and scrollable menu for any number of items.",
      href: "/navbar",
      icon: "☰",
      features: [
        "Left panel menu",
        "Smooth animations",
        "Keyboard accessible",
        "Mobile-first design",
      ],
      status: "ready",
    },
    {
      title: "CardStack",
      description:
        "Interactive horizontal card displays with two-stage interaction: hover to preview, click to reveal. Enhanced version includes swipe gestures and keyboard navigation.",
      href: "/cardstack",
      icon: "🃏",
      features: [
        "Two-stage interaction",
        "Swipe to cycle",
        "Keyboard navigation",
        "Fully responsive",
      ],
      status: "ready",
    },
    {
      title: "Marquee",
      description:
        "Two variants: Static marquee with pause-on-hover, and interactive marquee with click-and-drag control. Both feature seamless infinite loop animation.",
      href: "/marquee",
      icon: "🎭",
      features: [
        "Static & Interactive",
        "Pause on hover",
        "Click & drag",
        "Momentum scrolling",
      ],
      status: "ready",
    },
    {
      title: "MagicCard",
      description:
        "Interactive cards with dynamic spotlight effects that follow your cursor, creating an illuminated area with glowing borders for an engaging user experience.",
      href: "/magiccard",
      icon: "✨",
      features: [
        "Mouse tracking",
        "Dynamic spotlight",
        "Border glow",
        "Theme support",
      ],
      status: "ready",
    },
    {
      title: "ShineBorder",
      description:
        "Animated border component with a smooth horizontal shine effect. Wrap any content to add an elegant, attention-grabbing animated border with customisable colours and timing.",
      href: "/shineborder",
      icon: "💫",
      features: [
        "Customisable colours",
        "CSS animations",
        "Flexible sizing",
        "Zero dependencies",
      ],
      status: "ready",
    },
    {
      title: "SwishButton",
      description:
        "Animated button with swishing text transition and expanding background dot effect. Features smooth text slides and an arrow icon on hover for engaging CTAs.",
      href: "/swishbutton",
      icon: "🎯",
      features: [
        "Text slide animation",
        "Background expansion",
        "Native events",
        "Customisable styling",
      ],
      status: "ready",
    },
    {
      title: "ExpandingCard",
      description:
        "Interactive card that smoothly transitions between compact and expanded layouts using Svelte's crossfade. Perfect for galleries, portfolios, or progressive content disclosure.",
      href: "/expandingcard",
      icon: "🎴",
      features: [
        "Crossfade transitions",
        "Layout morphing",
        "Click to toggle",
        "Responsive design",
      ],
      status: "ready",
    },
    {
      title: "LinkImageHover",
      description:
        "Link component with image preview on hover. Images appear above links with a smooth blur transition, perfect for adding visual context to documentation and references.",
      href: "/linkimagehover",
      icon: "🔗",
      features: [
        "Image preview",
        "Blur transitions",
        "Customisable size",
        "Inline usage",
      ],
      status: "ready",
    },
    {
      title: "Editor (CRUD)",
      description:
        "Complete CRUD demonstration with database integration and graceful fallback. Features full Create, Read, Update, and Delete operations with validation, loading states, and accessible modal UI.",
      href: "/editor",
      icon: "✏️",
      features: [
        "Full CRUD operations",
        "Database integration",
        "Form validation",
        "Graceful fallback",
      ],
      status: "ready",
    },
    {
      title: "DataGrid",
      description:
        "Two data grid implementations: a lightweight self-contained version for small datasets and a production-ready wrapper around SVAR Grid for large datasets. Features sorting, filtering, pagination, inline editing, and CSV export.",
      href: "/datagrid",
      icon: "📊",
      features: [
        "Two implementations",
        "Sorting & filtering",
        "Virtual scrolling",
        "CSV export",
      ],
      status: "ready",
    },
    {
      title: "Sankey Diagram",
      description:
        "Interactive hierarchical flow visualization with expand/collapse functionality. Click expandable nodes to reveal nested children and see detailed breakdowns of flows. Built with Unovis for smooth animated transitions.",
      href: "/sankey",
      icon: "🌊",
      features: [
        "Expandable hierarchy",
        "Colour-coded flows",
        "Smooth transitions",
        "Tooltip support",
      ],
      status: "ready",
    },
    {
      title: "Forms",
      description:
        "Comprehensive collection of reusable form field components with validation, accessibility, and consistent styling. Includes text inputs, selects, checkboxes, radios, ranges, dates, switches, and colour pickers.",
      href: "/forms",
      icon: "📝",
      features: [
        "14 field components",
        "Full validation",
        "Accessibility first",
        "Type-safe props",
      ],
      status: "ready",
    },
  ];
</script>

<svelte:head>
  <title>Svelte 5 Component Templates</title>
  <meta
    name="description"
    content="Production-ready Svelte 5 component templates with modern interactions and animations"
  />
</svelte:head>

<div class="page">
  <div class="container">
    <!-- Hero Section -->
    <section class="hero">
      <h1 class="hero-title">Svelte 5 Component Templates</h1>
      <p class="hero-subtitle">
        Production-ready components with modern interactions, smooth animations,
        and clean design. Copy, customise, and integrate into your projects.
        Built natively with Svelte 5 for optimal performance - leaning heavily
        on better developers that came before like Sikandar.S.Bhide who built
        the excellent animation-svelte.vercel.app Mostly for my own use in my
        projects, but feel free to use them too! Developed and modified by me,
        @Jktfe, and Claude.
      </p>
    </section>

    <!-- Component Grid -->
    <section class="components-section">
      <h2 class="section-title">Available Components</h2>
      <div class="components-grid">
        {#each components as component}
          <ShineBorder
            color="#146ef5"
            duration={4}
            borderWidth={2}
            borderRadius={16}
          >
            <a href={component.href} class="component-card">
              <div class="card-header">
                <span class="card-icon">{component.icon}</span>
                <h3 class="card-title">{component.title}</h3>
                {#if component.status === "coming-soon"}
                  <span class="badge badge-soon">Coming Soon</span>
                {/if}
              </div>

              <p class="card-description">{component.description}</p>

              <ul class="card-features">
                {#each component.features as feature}
                  <li class="feature-item">
                    <span class="feature-check">✓</span>
                    {feature}
                  </li>
                {/each}
              </ul>

              <div class="card-footer">
                <span class="view-demo">
                  View Demo
                  <span class="arrow">→</span>
                </span>
              </div>
            </a>
          </ShineBorder>
        {/each}
      </div>
    </section>

    <!-- Features Section -->
    <section class="info-section">
      <h2 class="section-title">Why These Templates?</h2>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">⚡</div>
          <h3 class="info-title">Svelte 5 Native</h3>
          <p class="info-text">
            Built with Svelte 5 runes ($state, $derived, $effect) for optimal
            reactivity and performance.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icon">🎨</div>
          <h3 class="info-title">Modern Design</h3>
          <p class="info-text">
            Clean, Webflow-inspired aesthetic with generous whitespace and
            smooth animations.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icon">📱</div>
          <h3 class="info-title">Fully Responsive</h3>
          <p class="info-text">
            Mobile-first design with touch gestures, breakpoints, and adaptive
            layouts.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icon">♿</div>
          <h3 class="info-title">Accessible</h3>
          <p class="info-text">
            ARIA labels, keyboard navigation, focus states, and semantic HTML
            throughout.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icon">🚀</div>
          <h3 class="info-title">Zero Dependencies Options</h3>
          <p class="info-text">
            Pure Svelte and CSS implementations available. Options with no
            external animation libraries required.
          </p>
        </div>

        <div class="info-card">
          <div class="info-icon">📝</div>
          <h3 class="info-title">TypeScript</h3>
          <p class="info-text">
            Full type safety with comprehensive interfaces and JSDoc
            documentation.
          </p>
        </div>
      </div>
    </section>

    <!-- Quick Start -->
    <section class="quickstart-section">
      <h2 class="section-title">Quick Start</h2>
      <div class="quickstart-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Browse Components</h3>
            <p>
              Explore the component demos above to see them in action with live
              examples.
            </p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Copy to Your Project</h3>
            <p>
              Copy the component files from <code>src/lib/components/</code> to your
              project.
            </p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Customise & Use</h3>
            <p>
              Import and use with your data. All props are fully typed and
              documented.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrations Section -->
    <section class="integrations-section">
      <h2 class="section-title">Integrations</h2>
      <p class="section-subtitle">
        These templates integrate with external services and <strong>require dependencies</strong>.
        They demonstrate best practices for third-party service integration in SvelteKit.
      </p>
      <div class="integrations-grid">
        {#each integrations as integration}
          <a href={integration.href} class="integration-card">
            <div class="card-header">
              <span class="card-icon">{integration.icon}</span>
              <h3 class="card-title">{integration.title}</h3>
              <span class="badge badge-dependency">Requires Dependency</span>
            </div>

            <p class="card-description">{integration.description}</p>

            <ul class="card-features">
              {#each integration.features as feature}
                <li class="feature-item">
                  <span class="feature-check">✓</span>
                  {feature}
                </li>
              {/each}
            </ul>

            <div class="dependency-info">
              <span class="dependency-label">Dependency:</span>
              <code class="dependency-name">{integration.dependency}</code>
            </div>

            <div class="card-footer">
              <span class="view-demo">
                View Demo
                <span class="arrow">→</span>
              </span>
            </div>
          </a>
        {/each}
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

  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 6rem;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: #1a202c;
    line-height: 1.2;
    text-wrap: pretty;
  }

  .hero-subtitle {
    font-size: 1.35rem;
    color: #718096;
    margin: 0;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  /* Section Titles */
  .section-title {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0 0 3rem 0;
    color: #1a202c;
    text-align: center;
  }

  /* Components Grid */
  .components-section {
    margin-bottom: 6rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
  }

  .component-card {
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    background: #ffffff;
    text-decoration: none;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    height: 100%;
    border-radius: 14px;
  }

  .component-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(20, 110, 245, 0.03) 0%,
      rgba(102, 126, 234, 0.03) 100%
    );
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .component-card:hover {
    transform: translateY(-4px);
  }

  .component-card:hover::before {
    opacity: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .card-icon {
    font-size: 2.5rem;
    line-height: 1;
  }

  .card-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
    color: #1a202c;
    line-height: 1;
  }

  .badge {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-soon {
    background: #edf2f7;
    color: #718096;
  }

  .card-description {
    font-size: 1rem;
    color: #4a5568;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    position: relative;
    z-index: 1;
  }

  .card-features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
    flex-grow: 1;
    position: relative;
    z-index: 1;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    color: #4a5568;
    font-size: 0.95rem;
  }

  .feature-check {
    color: #146ef5;
    font-weight: 700;
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    position: relative;
    z-index: 1;
  }

  .view-demo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #146ef5;
    font-weight: 600;
    font-size: 1rem;
    transition: gap 0.2s ease;
  }

  .component-card:hover .view-demo {
    gap: 0.75rem;
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .component-card:hover .arrow {
    transform: translateX(2px);
  }

  /* Info Section */
  .info-section {
    margin-bottom: 6rem;
    padding: 4rem 0;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    margin-left: -2rem;
    margin-right: -2rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .info-card {
    text-align: center;
    padding: 2rem;
  }

  .info-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .info-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: #1a202c;
  }

  .info-text {
    font-size: 0.95rem;
    color: #718096;
    margin: 0;
    line-height: 1.6;
  }

  /* Quick Start */
  .quickstart-section {
    margin-bottom: 4rem;
  }

  .quickstart-steps {
    max-width: 800px;
    margin: 0 auto;
  }

  .step {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 2rem;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .step:hover {
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

  /* Integrations Section */
  .integrations-section {
    margin-bottom: 4rem;
    padding: 4rem 0;
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
    margin-left: -2rem;
    margin-right: -2rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: #718096;
    text-align: center;
    max-width: 600px;
    margin: -2rem auto 3rem;
    line-height: 1.6;
  }

  .integrations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .integration-card {
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    background: #ffffff;
    text-decoration: none;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    height: 100%;
    border-radius: 16px;
    border: 2px solid #f9a8d4;
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.1);
  }

  .integration-card:hover {
    transform: translateY(-4px);
    border-color: #ec4899;
    box-shadow: 0 8px 30px rgba(236, 72, 153, 0.2);
  }

  .badge-dependency {
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
    color: #be185d;
  }

  .dependency-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fdf2f8;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .dependency-label {
    font-size: 0.875rem;
    color: #9d174d;
    font-weight: 500;
  }

  .dependency-name {
    padding: 0.25rem 0.5rem;
    background: #fbcfe8;
    color: #be185d;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  }

  .integration-card .feature-check {
    color: #ec4899;
  }

  .integration-card .view-demo {
    color: #ec4899;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .section-title {
      font-size: 1.75rem;
    }

    .components-grid {
      grid-template-columns: 1fr;
    }

    .info-section {
      margin-left: -1rem;
      margin-right: -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .step {
      flex-direction: column;
      gap: 1rem;
    }

    .integrations-section {
      margin-left: -1rem;
      margin-right: -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .integrations-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
