# LinkImageHover - Technical Logic Explainer

## What Does It Do? (Plain English)

LinkImageHover creates links that show a floating image preview when you hover over them. On desktop, hover to see the preview and click to follow the link. On mobile (where there's no hover), tap once to see the preview, then tap the preview to follow the link.

**Think of it like:** A link with a sneak peek! Hover over it and get a visual preview of where you're going before you click.

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. DETECT if device is touch-based (mobile) or pointer-based (desktop)
  2. SET UP appropriate event handlers

ON DESKTOP (hover-capable):
  WHEN mouse enters link:
    SHOW image preview with blur transition
  WHEN mouse leaves link:
    HIDE image preview
  WHEN user clicks link:
    NAVIGATE immediately

ON MOBILE (touch-based):
  WHEN user taps link:
    IF preview not visible:
      PREVENT navigation
      SHOW preview
    ELSE:
      ALLOW navigation (link follows href)
  WHEN user taps preview image:
    NAVIGATE to href
  WHEN user taps outside:
    HIDE preview
```

---

## Device Detection Strategy

```javascript
// Using CSS media query for reliable detection
isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// Why this works:
// - 'pointer: coarse' = finger/stylus (touch devices)
// - 'pointer: fine' = mouse/trackpad (desktop)
// - Works better than 'ontouchstart' in window (false positives)
```

---

## Interaction Flow (Visual)

### Desktop Flow
```
                    ┌─────────────┐
    Hover ─────────►│   Preview   │
                    │   appears   │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
    Click ─────────►│  Navigate   │
                    │  to href    │
                    └─────────────┘
```

### Mobile Flow
```
                    ┌─────────────┐
    Tap 1 ─────────►│   Preview   │
                    │   appears   │
                    └─────────────┘
                           │
               ┌───────────┴───────────┐
               ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │ Tap preview     │     │ Tap outside     │
    │ = Navigate      │     │ = Dismiss       │
    └─────────────────┘     └─────────────────┘
```

---

## The Blur Transition

```svelte
<!-- Svelte's built-in blur transition -->
<img
  in:blur={{ duration: 300 }}
  src={imageSrc}
  alt={imageAlt}
/>

// How blur transition works:
// 1. Element starts blurred and transparent
// 2. Animates to clear and fully visible
// 3. Creates a "focusing" effect

// CSS equivalent:
@keyframes blur-in {
  from {
    filter: blur(10px);
    opacity: 0;
  }
  to {
    filter: blur(0);
    opacity: 1;
  }
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | `'https://example.com'` | Link destination URL |
| `text` | `string` | `'Link Text'` | Display text for the link |
| `imageSrc` | `string` | (placeholder) | Preview image URL |
| `imageAlt` | `string` | `'Preview Image'` | Alt text for accessibility |
| `imageWidth` | `string` | `'h-44 w-44'` | Tailwind size classes |
| `target` | `string` | `'_blank'` | Link target attribute |

---

## Click-Outside Detection

```javascript
// Set up when preview becomes visible on mobile
$effect(() => {
  if (isTouchDevice && showPreviewMobile) {
    const handleClickOutside = (event) => {
      // Check if click was outside our component
      if (!containerRef.contains(event.target)) {
        showPreviewMobile = false;  // Dismiss preview
      }
    };

    // Small delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);

    // Cleanup on effect teardown
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }
});
```

---

## Why Two Different Implementations?

```
DESKTOP (Mouse):
├── Hover is a natural discovery mechanism
├── No commitment required (just move mouse away)
├── Click = direct intent to navigate
└── Single interaction model

MOBILE (Touch):
├── No hover capability
├── Tap = only interaction available
├── Need way to preview WITHOUT navigating
├── Two-tap model: discover, then confirm
└── Tap outside to dismiss (familiar pattern)
```

---

## Positioning Strategy

```
Container (relative positioning context)
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────┐       │
│   │   Preview Image     │       │  ← position: absolute
│   │   bottom: 40px      │       │     z-index: 50
│   └─────────────────────┘       │
│                                 │
│         [Link Text]             │  ← Always visible
│                                 │
└─────────────────────────────────┘

// Image floats above the link text
// z-index: 50 ensures it's above other content
// bottom: 40px provides clearance from link
```

---

## Security Considerations

```svelte
<!-- When opening in new tab, include security attributes -->
<a
  href={href}
  target={target}
  rel={target === '_blank' ? 'noopener noreferrer' : undefined}
>

// noopener: Prevents new page from accessing window.opener
// noreferrer: Doesn't send referrer header
// Only added when target="_blank" (new tab/window)
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Alt text | Required `imageAlt` prop for preview image |
| ARIA label | Button on mobile has `aria-label="Open {text}"` |
| Keyboard | Standard link keyboard accessibility |
| Screen readers | Link text clearly describes destination |

---

## Performance Considerations

- **Lazy loading** - Image only loads when component renders
- **Blur transition** - GPU-accelerated CSS filter
- **Event cleanup** - Click-outside listener removed when not needed
- **No external deps** - Uses Svelte's built-in transition

---

## Common Use Cases

### Documentation Links
```svelte
<LinkImageHover
  href="/docs/api"
  text="View API Documentation"
  imageSrc="/screenshots/api-docs.png"
  imageAlt="API Documentation page"
/>
```

### Resource References
```svelte
<LinkImageHover
  href="https://svelte.dev"
  text="Learn more about Svelte"
  imageSrc="/images/svelte-preview.jpg"
  imageAlt="Svelte homepage"
  imageWidth="h-52 w-80"
/>
```

### Product Links
```svelte
<LinkImageHover
  href="/products/widget"
  text="Explore the Widget"
  imageSrc="/products/widget-hero.jpg"
  imageAlt="Widget product photo"
  target="_self"
/>
```

---

## Dependencies

- **svelte/transition** (blur effect - built into Svelte)
- **$lib/types** (LinkImageHoverProps interface)
- **Zero external dependencies**

---

## File Structure

```
LinkImageHover.svelte   # The component
LinkImageHover.test.ts  # Unit tests
LinkImageHover.md       # This explainer
```

---

*Last updated: 26 December 2025*
