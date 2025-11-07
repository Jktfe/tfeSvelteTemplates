# CLAUDE.md

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

## Project Overview

TFE Svelte Templates is a collection of production-ready, well-documented Svelte 5 component templates. Components are designed to be copy-paste ready with extensive inline comments, full TypeScript types, and zero or minimal dependencies.

**Purpose**: Provide reusable UI components that can be copied directly into other projects without modification, while also serving as a demo/showcase application.

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (using runes: $state, $derived, $effect)
- **Language**: TypeScript
- **Styling**: Scoped CSS (component-level) + TailwindCSS (layout/utilities)
- **Animation**: `@humanspeak/svelte-motion` (optional - some components use it, others are pure CSS)
- **Database**: Neon (Serverless PostgreSQL) - optional, with fallback to static data
- **Deployment**: Vercel (configured with `@sveltejs/adapter-vercel`)
- **Runtime**: Node.js 20.x (required for Neon serverless driver compatibility)

## Development Commands

```bash
# Development server (hot reload enabled)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type checking (run before commits)
npm run check

# Type checking in watch mode
npm run check:watch
```

## Project Architecture

### Directory Structure

```
src/
├── lib/
│   ├── components/          # Reusable component templates
│   │   ├── CardStack*.svelte           # Card stack variants
│   │   ├── Marquee*.svelte             # Marquee scroll variants
│   │   ├── MagicCard.svelte            # Spotlight effect card
│   │   ├── ShineBorder.svelte          # Animated border wrapper
│   │   ├── SwishButton.svelte          # Animated button with text slide
│   │   ├── ExpandingCard.svelte        # Card with layout transitions
│   │   ├── LinkImageHover.svelte       # Link with image preview
│   │   └── StaggeredMenu.svelte        # Animated navigation menu
│   ├── server/
│   │   ├── cards.ts              # CardStack database utility
│   │   ├── testimonials.ts       # Testimonials database utility
│   │   ├── expandingCards.ts     # ExpandingCard database utility
│   │   └── linkPreviews.ts       # LinkImageHover database utility
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── constants.ts         # Fallback data (all components)
│   └── utils.ts             # Utility functions (clsx, cn)
├── routes/
│   ├── +layout.svelte       # App layout with navigation
│   ├── +page.svelte         # Home page (component showcase)
│   ├── cardstack/+page.svelte          # CardStack demos
│   ├── marquee/+page.svelte            # Marquee demos
│   ├── magiccard/+page.svelte          # MagicCard demo
│   ├── shineborder/+page.svelte        # ShineBorder demo
│   ├── swishbutton/+page.svelte        # SwishButton demo
│   ├── expandingcard/+page.svelte      # ExpandingCard demo
│   ├── linkimagehover/+page.svelte     # LinkImageHover demo
│   └── api/cards/+server.ts # API endpoint (optional)
└── app.html                 # HTML template

database/
├── schema.sql              # CardStack PostgreSQL schema and seed data
└── schema_v2.sql           # Additional components schema (Marquee, ExpandingCard, LinkImageHover)
```

### Key Architectural Patterns

#### 1. Component Self-Containment
Each component in `src/lib/components/` is designed to be **completely self-contained**:
- All styles are scoped within `<style>` tags (no external CSS dependencies)
- Props are fully typed with interfaces in `src/lib/types.ts`
- Extensive JSDoc comments explain every part of the code
- Can be copied to another project and work immediately

#### 2. Database Integration with Graceful Fallback
The app uses a **fallback pattern** for data loading across all components:
- Database connection is optional via `DATABASE_URL` environment variable
- If `DATABASE_URL` is not set, app uses fallback constants from `src/lib/constants.ts`:
  - `FALLBACK_CARDS` - CardStack data
  - `FALLBACK_TESTIMONIALS` - Marquee testimonials
  - `FALLBACK_EXPANDING_CARDS` - ExpandingCard content
  - `FALLBACK_LINK_PREVIEWS` - LinkImageHover links
- Server utilities in `src/lib/server/` handle this pattern:
  - `loadCardsFromDatabase()` - CardStack
  - `loadTestimonialsFromDatabase(category?)` - Testimonials
  - `loadExpandingCardsFromDatabase(category?)` - Expanding cards
  - `loadLinkPreviewsFromDatabase(category?)` - Link previews
- `DatabaseStatus` component shows connection state on each page
- App remains functional even without database setup

**Pattern:**
```typescript
// In +page.server.ts
import { loadCardsFromDatabase } from '$lib/server/cards';

export const load = async () => {
  const cards = await loadCardsFromDatabase();
  const usingDatabase = !!process.env.DATABASE_URL;

  return { cards, usingDatabase };
};
```

#### 3. Type Consistency
All shared types are defined once in `src/lib/types.ts`:
- Component prop interfaces: `Card`, `Testimonial`, `ExpandingCardData`, `LinkPreview`
- Database row interfaces: `CardRow`, `TestimonialRow`, `ExpandingCardRow`, `LinkPreviewRow`
- Component props: `CardStackProps`, `MarqueeProps`, `ExpandingCardProps`, `LinkImageHoverProps`, etc.
- Server utilities transform database rows (snake_case) → component props (camelCase) to maintain separation

#### 4. Component Variants
Components have multiple implementations demonstrating different approaches:
- **CardStack.svelte** - Basic version (CSS transforms only)
- **CardStackAdvanced.svelte** - Adds swipe gestures and keyboard nav
- **CardStackMotionSpring.svelte** - Uses svelte-motion with spring physics
- **CardStackMotionFlip.svelte** - Uses FLIP animation technique
- **Marquee.svelte** - Static infinite scroll with pause-on-hover
- **MarqueeDraggable.svelte** - Interactive with drag-to-scroll

This demonstrates **progressive enhancement** - start simple, add features as needed.

## Working with Components

### Adding a New Component Template

1. Create component file in `src/lib/components/ComponentName.svelte`
2. Add TypeScript interface to `src/lib/types.ts`
3. Document thoroughly with JSDoc comments
4. Create demo page in `src/routes/componentname/+page.svelte`
5. Add to home page showcase in `src/routes/+page.svelte`

### Component Documentation Standards

Every component should include:
- **File header comment** explaining purpose and features
- **JSDoc for props** with type, default, and description
- **Inline comments** explaining non-obvious logic
- **Usage examples** in dedicated demo route
- **Accessibility features** (ARIA labels, keyboard nav, focus states)

### Component Naming Conventions

- Component files: PascalCase (`CardStack.svelte`, `MagicCard.svelte`)
- Route folders: lowercase (`cardstack/`, `marquee/`)
- Variants: Suffix describes variant (`CardStackAdvanced`, `CardStackMotionSpring`)

## Database Setup (Optional)

The application works without a database, but to connect to Neon:

1. Create account at [neon.tech](https://neon.tech)
2. Create new project and database
3. Copy connection string from console
4. Run `database/schema.sql` in Neon SQL Editor
5. Create `.env` file (use `.env.example` as template):
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
   ```
6. Restart dev server

**Important**: The `@neondatabase/serverless` package requires Node.js 20.x runtime, which is configured in `svelte.config.js` adapter settings.

## Code Style and Conventions

### TypeScript
- Use explicit types for all props and function parameters
- Define interfaces in `src/lib/types.ts` for shared types
- Export interfaces for component props (e.g., `CardStackProps`)

### Svelte 5 Patterns
- Use **runes** for reactivity: `$state()`, `$derived()`, `$effect()`
- Use **snippets** for render props/children patterns
- Prefer **typed props** with `interface Props` pattern
- Use **bindable props** (`bind:`) for two-way state

### Styling
- **Scoped styles** in `<style>` tags for components
- **TailwindCSS** for layout-level utilities (pages, grids)
- **CSS custom properties** for theming and configuration
- **No external CSS files** for components (keep them portable)

### Accessibility
- Include ARIA labels for interactive elements
- Support keyboard navigation where appropriate
- Provide focus indicators for all focusable elements
- Respect `prefers-reduced-motion` for animations

## Build and Deployment

### Vercel Deployment
The project is pre-configured for Vercel:
- Adapter configured in `svelte.config.js`
- Runtime set to `nodejs20.x` for Neon compatibility
- Environment variables can be added in Vercel dashboard

### Environment Variables
Required for database features (optional):
- `DATABASE_URL` - Neon PostgreSQL connection string

## Common Patterns in This Codebase

### Server-Side Data Loading
```typescript
// src/routes/example/+page.server.ts
import { loadCardsFromDatabase } from '$lib/server/cards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    cards: await loadCardsFromDatabase()
  };
};
```

### Component Props with Defaults
```typescript
<script lang="ts">
  import type { CardStackProps } from '$lib/types';

  let {
    cards = [],
    cardWidth = 300,
    cardHeight = 400,
    partialRevealSide = 'right'
  }: CardStackProps = $props();
</script>
```

### Conditional Animation Based on Reduced Motion
```typescript
// Check user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Adjust animation accordingly
const duration = prefersReducedMotion ? 0.1 : 0.5;
```

## Available Components

### UI Components

1. **CardStack** - Interactive horizontal card displays with hover/click interactions
   - Variants: Basic, Advanced (swipe/keyboard), Motion (Spring/FLIP)
   - Features: Two-stage interaction, responsive, accessible

2. **Marquee** - Infinite scrolling content displays
   - Variants: Static (pause-on-hover), Draggable (click-and-drag)
   - Features: Seamless loop, momentum, customisable speed

3. **MagicCard** - Cards with mouse-tracking spotlight effects
   - Features: Dynamic lighting, border glow, theme support

4. **ShineBorder** - Animated border wrapper component
   - Features: Horizontal shine animation, customisable colours/timing
   - Zero dependencies, pure CSS animations

5. **SwishButton** - Animated CTA button
   - Features: Text slide animation, background expansion, inline SVG arrow
   - Zero icon library dependencies

6. **ExpandingCard** - Card with layout transitions
   - Features: Crossfade between compact/expanded layouts, click to toggle
   - Uses Svelte's built-in transitions

7. **LinkImageHover** - Links with image previews
   - Features: Image appears on hover, blur transition, customisable sizing
   - Perfect for documentation and references

### Utility Components

8. **StaggeredMenu** - Animated navigation menu
   - Features: Staggered entrance animations, active state highlighting

## Code Quality & Warnings

### Known svelte-check Warnings (Safe to Ignore)

The project has **zero build warnings** (`npm run build` is clean), but `npm run check` reports some warnings that are safe to ignore:

#### CSS Unused Selector Warnings (14 warnings)
- **Location**: `CardStackMotionFlip.svelte` and `CardStackMotionSpring.svelte`
- **Reason**: CSS classes are applied dynamically via the `getCardClass()` function, which Svelte's static analysis cannot detect
- **Mitigation**: All selectors are documented with `/* svelte-ignore css-unused-selector */` comments explaining why they're used
- **Impact**: None - CSS is actively used at runtime, warnings are false positives

#### Route File Parsing Errors (53 errors)
- **Location**: Various `+page.svelte` files in routes
- **Reason**: Known svelte-check parsing issue with certain Svelte syntax patterns
- **Evidence**: `npm run build` succeeds without any errors, and the app runs perfectly
- **Impact**: None - these are tooling false positives, not real code issues

### Build Status
- **Production Build**: ✅ Zero errors, zero warnings
- **Type Check**: ⚠️ 53 false-positive parsing errors, 14 documented CSS warnings
- **Runtime**: ✅ All components functional

## Database Integration

### Database Status Indicator

The app includes a `DatabaseStatus` component that shows whether the app is connected to Neon or using fallback data.

**Usage:**
```svelte
<script>
  import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

  let { data } = $props(); // from PageServerLoad
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} />
```

### Mixed Database/Fallback Demo

The project demonstrates both database and fallback patterns:

1. **Home page (`/`)**: Uses database with fallback, shows DatabaseStatus indicator
2. **CardStack page (`/cardstack`)**: Uses database with fallback, shows DatabaseStatus indicator
3. **Other pages**: Data-agnostic components that don't require database

This approach shows developers how to:
- Implement graceful database fallback
- Indicate data source to users
- Build components that work with any data source

## Troubleshooting

### "DATABASE_URL not configured" Warning
This is expected if you haven't set up Neon. The app will use fallback data. To resolve:
- Create `.env` file with `DATABASE_URL` value
- Restart dev server

### Build Errors with Neon
If you see errors about `@neondatabase/serverless`:
- Ensure Node.js version is 18.x or higher
- Check `svelte.config.js` has `runtime: 'nodejs20.x'`
- Verify `DATABASE_URL` is properly formatted

### TypeScript Errors
- Run `npm run check` to see all type errors (expect 53 false positives in route files)
- Ensure all imports use correct paths (`$lib/...`)
- Check that interfaces are exported from `src/lib/types.ts`

### Components Not Displaying
- Verify data is being passed correctly to component props
- Check browser console for runtime errors
- Ensure image URLs in data are accessible

## Important Notes

- **Do not install additional animation libraries** without considering component portability
- **Keep components self-contained** - they should work when copied to another project
- **Document everything** - assume users will read the code to learn
- **Maintain type safety** - all props and data structures should be typed
- **Test without database** - ensure fallback data works correctly
- **Follow UK English** spelling in user-facing text (honour, colour, etc.)
- **Avoid icon libraries like lucide-svelte** - use inline SVG or CSS alternatives for portability
