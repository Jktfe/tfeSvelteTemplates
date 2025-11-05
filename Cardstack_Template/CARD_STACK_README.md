# Card Stack Component

Reusable Svelte 5 card stack component with drag/swipe animations, matching the style from vemula.me/prototypes.

## Features

- **Desktop**: Horizontal drag to cycle through cards
- **Mobile**: Vertical swipe to cycle through cards
- **Keyboard**: Arrow keys (← →) to navigate
- **Smooth animations**: Cubic-bezier easing with natural motion
- **Responsive**: Adapts layout for mobile/desktop
- **Accessible**: ARIA labels and semantic HTML

## Files

1. **CardStack.svelte** - Basic version, good for most use cases
2. **CardStackAdvanced.svelte** - Precise rotation matching original, finer animations
3. **+page.svelte** - Example usage with sample data

## Installation

1. Copy `CardStack.svelte` (or `CardStackAdvanced.svelte`) to your component folder
2. Import and use in your page

```svelte
<script>
	import CardStack from './CardStack.svelte';

	const cards = [
		{ title: 'Card 1', image: '/path/to/image.jpg' },
		{ title: 'Card 2', image: '/path/to/image.jpg' }
	];
</script>

<CardStack {cards} />
```

## Card Data Structure

Each card object should contain:

```javascript
{
	title: 'String',           // Optional - displayed as overlay text
	image: 'url or path',      // Optional - background image
	content: 'HTML string'     // Optional - content overlay
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | Array | `[]` | Array of card objects |
| `cardWidth` | Number | `300` | Card width in pixels |
| `cardHeight` | Number | `400` | Card height in pixels |

## Customisation

### Colors & Styling

Modify the `<style>` block:

```svelte
.card {
	background: #f5f5f5;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	border-radius: 16px;
}
```

### Animation Speed

Change the transition duration in `.card-wrapper`:

```svelte
transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          /* ^^^ change to 0.3s, 0.7s, etc */
```

### Pivot Point

Adjust where cards rotate from via `transform-origin`. Desktop uses `90% 90%` (bottom-right), mobile uses `50% 100%` (bottom-center).

```svelte
.card-wrapper {
	transform-origin: 90% 90%;  /* Adjust these percentages */
}
```

### Rotation Angles (Advanced version)

The `rotations` array in CardStackAdvanced.svelte defines each card's angle:

```javascript
const rotations = [
	39.5, 37.5, 28.96, 32.31, 25.61, 24.3, 15.11, 16.33, 11.22, 1.52, 4.99
];
```

Modify these to customize the fan angles.

### Scale Progression (Advanced version)

The `scales` array controls how cards grow from back to front:

```javascript
const scales = [0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94];
```

## Interaction Thresholds

Change drag/swipe sensitivity by modifying the `threshold` value in mouse/touch handlers:

```javascript
const threshold = 40;  // pixels - increase for more sloppy tolerance
if (deltaX > threshold && currentIndex < cards.length - 1) {
	currentIndex++;
}
```

## Performance

- Uses Svelte 5 `$state` and `$props` for reactivity
- `will-change: transform` on animated elements
- Transitions disabled while dragging for smooth 60fps interaction
- Optimised for both desktop and mobile

## Browser Support

- Modern browsers supporting CSS perspective & transforms
- Mobile: Touch events (iOS Safari, Android Chrome)
- Desktop: Mouse events, keyboard navigation

## Examples

### With background gradient

```svelte
<script>
	const cards = [
		{
			title: 'Design',
			image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
			content: '<p>Creative Direction</p>'
		}
	];
</script>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px;">
	<CardStack {cards} />
</div>
```

### Dynamic card updates

```svelte
<script>
	let cards = $state([]);

	onMount(async () => {
		const data = await fetch('/api/cards').then(r => r.json());
		cards = data;
	});
</script>

<CardStack {cards} />
```

## Browser DevTools

In browser console, you can inspect card transforms:

```javascript
// See active card index
document.querySelector('.card-wrapper[style*="z-index: 5"]')

// Inspect transform calculations
getComputedStyle(element).transform
```

## Known Limitations

- Only scrolls forward/backward (no jumping to specific card)
- Content overlay requires manual HTML sanitisation if using user input
- Very long card lists may impact performance (consider virtualising if >50 cards)

## Future Enhancements

- Swipe velocity for momentum scrolling
- Clickable cards for direct navigation
- Snap points for precise positioning
- Accessibility keyboard shortcuts (Home, End keys)
- Custom easing functions per card

---

**Source**: Inspired by https://vemula.me/prototypes card stack design
