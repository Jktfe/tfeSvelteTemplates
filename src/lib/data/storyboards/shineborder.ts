/**
 * ============================================================
 * ShineBorder Storyboard Data
 * ============================================================
 *
 * Interactive ExplainerCanvas storyboard for the ShineBorder component.
 * This serves as the template for all other component storyboards.
 *
 * The storyboard provides:
 *   - Overview of what the component does
 *   - Visual examples and use cases
 *   - Props documentation
 *   - Code examples
 *   - Accessibility notes
 *   - Tips and best practices
 *
 * ============================================================
 */

import type { ExplainerCanvasData } from '$lib/types';

export const shineBorderStoryboard: ExplainerCanvasData = {
	id: 'shineborder-storyboard',
	title: 'ShineBorder Component',
	description: 'An animated border wrapper that adds a sweeping shine effect to any content',
	defaultCardId: 'overview',
	config: {
		lineStyle: 'bezier',
		background: { type: 'dots', color: '#e2e8f0', size: 1, gap: 20 },
		enableSearch: true
	},
	cards: [
		{
			id: 'overview',
			title: '🎯 Overview',
			summary: 'What ShineBorder does and when to use it',
			position: { x: 0, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## ShineBorder

An animated border wrapper that adds a sweeping horizontal shine effect to any content. Perfect for drawing attention to important UI elements.

### When to Use

- **Call-to-action buttons** - Make buttons stand out
- **Featured content cards** - Highlight special offers or announcements
- **Navigation elements** - Draw attention to key sections
- **Loading states** - Indicate ongoing processes

### Key Features

- Pure CSS animation (no JavaScript overhead)
- Fully customisable colours, speed, and border radius
- Works with any child content
- Zero external dependencies
- Respects \`prefers-reduced-motion\``
				}
			],
			links: ['visual-guide', 'props'],
			children: []
		},
		{
			id: 'visual-guide',
			title: '👁️ Visual Guide',
			summary: 'See the component in action',
			position: { x: 400, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## How It Works

The shine effect is created using a CSS \`linear-gradient\` that sweeps horizontally across the border. The animation uses \`@keyframes\` to move the gradient from left to right.

### Animation Breakdown

1. **Gradient starts** off-screen to the left
2. **Sweeps across** the border from left to right
3. **Exits** off-screen to the right
4. **Repeats** infinitely (configurable duration)

### Visual Structure

\`\`\`
┌─────────────────────────┐
│ ═══════════════════════ │ ← Animated shine border
│                         │
│     Your Content        │
│     Goes Here           │
│                         │
│ ═══════════════════════ │
└─────────────────────────┘
\`\`\``
				}
			],
			links: ['overview', 'props'],
			children: []
		},
		{
			id: 'props',
			title: '⚙️ Props & Configuration',
			summary: 'Customise the component behaviour',
			position: { x: 0, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`color\` | \`string\` | \`#146ef5\` | Shine colour (any CSS colour) |
| \`duration\` | \`number\` | \`3\` | Animation duration in seconds |
| \`borderWidth\` | \`number\` | \`2\` | Border thickness in pixels |
| \`borderRadius\` | \`number\` | \`8\` | Corner radius in pixels |

### CSS Custom Properties

The component exposes CSS custom properties for advanced styling:

\`\`\`css
.shine-border-wrapper {
  --shine-color: #146ef5;
  --shine-duration: 3s;
  --border-width: 2px;
  --border-radius: 8px;
}
\`\`\``
				}
			],
			links: ['code-examples'],
			children: [
				{
					id: 'props-advanced',
					title: 'Advanced Configuration',
					summary: 'Custom styling options',
					position: { x: 0, y: 0 },
					content: [
						{
							type: 'markdown',
							content: `## Advanced Styling

### Multiple Colours

You can create a rainbow effect by using the component multiple times with different colours:

\`\`\`svelte
<div class="rainbow-stack">
  <ShineBorder color="#ff0000" duration={2}>
    <ShineBorder color="#00ff00" duration={3}>
      <ShineBorder color="#0000ff" duration={4}>
        Content
      </ShineBorder>
    </ShineBorder>
  </ShineBorder>
</div>
\`\`\`

### Custom Gradient

For more control, you can override the CSS:

\`\`\`css
.shine-border-wrapper::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    #ff6b6b 25%,
    #4ecdc4 50%,
    #45b7d1 75%,
    transparent 100%
  );
}
\`\`\``
						}
					],
					children: []
				}
			]
		},
		{
			id: 'code-examples',
			title: '📝 Code Examples',
			summary: 'Copy-paste ready examples',
			position: { x: 400, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Basic Usage

\`\`\`svelte
<${'script'}>
  import ShineBorder from '$lib/components/ShineBorder.svelte';
</${'script'}>

<ShineBorder>
  <p>Your content here</p>
</ShineBorder>
\`\`\`

## With Custom Props

\`\`\`svelte
<ShineBorder
  color="#ff6b6b"
  duration={5}
  borderWidth={3}
  borderRadius={16}
>
  <div class="card">
    <h2>Featured Item</h2>
    <p>This card really stands out!</p>
  </div>
</ShineBorder>
\`\`\`

## Button Example

\`\`\`svelte
<ShineBorder borderRadius={9999} borderWidth={2}>
  <button class="cta-button">
    Get Started
  </button>
</ShineBorder>
\`\`\``
				}
			],
			links: ['props', 'accessibility'],
			children: [
				{
					id: 'real-world-example',
					title: 'Real-World Example',
					summary: 'Complete implementation',
					position: { x: 0, y: 0 },
					content: [
						{
							type: 'markdown',
							content: `## Pricing Card Example

\`\`\`svelte
<${'script'}>
  import ShineBorder from '$lib/components/ShineBorder.svelte';
</${'script'}>

<ShineBorder color="#10b981" duration={4} borderRadius={12}>
  <div class="pricing-card">
    <span class="badge">Most Popular</span>
    <h3>Pro Plan</h3>
    <p class="price">$29/month</p>
    <ul>
      <li>Unlimited projects</li>
      <li>Priority support</li>
      <li>Advanced analytics</li>
    </ul>
    <button>Choose Plan</button>
  </div>
</ShineBorder>

<style>
  .pricing-card {
    padding: 2rem;
    background: white;
    text-align: center;
  }
  .badge {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }
</style>
\`\`\``
						}
					],
					children: []
				}
			]
		},
		{
			id: 'accessibility',
			title: '♿ Accessibility',
			summary: 'Making the component accessible to everyone',
			position: { x: 200, y: 520 },
			content: [
				{
					type: 'markdown',
					content: `## Accessibility Considerations

### Motion Preferences

The component respects \`prefers-reduced-motion\`. When enabled:
- Animation duration is reduced to near-instant
- Users who are sensitive to motion won't be affected

### Focus Indicators

ShineBorder is purely decorative and doesn't affect keyboard navigation. The child content's focus states work normally.

### Screen Readers

The shine effect is purely visual - it doesn't affect screen reader announcements. Content inside is read normally.

### Colour Contrast

While the border itself doesn't need to meet contrast requirements (it's decorative), ensure your child content maintains proper contrast ratios.

### Implementation

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .shine-border-wrapper::before {
    animation-duration: 0.1s;
  }
}
\`\`\``
				}
			],
			links: ['tips'],
			children: []
		},
		{
			id: 'tips',
			title: '💡 Tips & Best Practices',
			summary: 'Get the most out of the component',
			position: { x: 200, y: 760 },
			content: [
				{
					type: 'markdown',
					content: `## Best Practices

### Do

- ✅ Use sparingly - too many shiny elements dilutes the effect
- ✅ Match the colour to your brand or the action's intent
- ✅ Consider using longer durations (4-6s) for subtle emphasis
- ✅ Test on both light and dark backgrounds

### Don't

- ❌ Use on every element - save it for truly important items
- ❌ Use very fast animations (< 1s) - they can be distracting
- ❌ Nest multiple ShineBorders without good reason
- ❌ Use colours that clash with the content inside

## Performance Tips

The animation is CSS-only, so it's very performant. However:

1. **GPU acceleration** is automatic via \`transform\`
2. **Memory usage** is minimal (single gradient)
3. **No JavaScript** - animation runs even if JS fails

## Common Patterns

### Attention Grabber
Use a bright colour and faster duration for CTAs

### Subtle Enhancement
Use a muted colour and slower duration for cards

### Loading Indicator
Combine with a pulsing opacity for loading states`
				}
			],
			links: ['overview'],
			children: []
		}
	]
};
