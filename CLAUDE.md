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
bun run dev

# Production build
bun run build

# Preview production build locally
bun run preview

# Type checking (run before commits)
bun run check

# Type checking in watch mode
bun run check:watch
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
│   │   ├── StaggeredMenu.svelte        # Animated navigation menu
│   │   └── Editor.svelte               # CRUD editor modal component
│   ├── server/
│   │   ├── cards.ts              # CardStack database utility
│   │   ├── testimonials.ts       # Testimonials database utility
│   │   ├── expandingCards.ts     # ExpandingCard database utility
│   │   ├── linkPreviews.ts       # LinkImageHover database utility
│   │   └── editorData.ts         # Editor CRUD utility
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
│   ├── editor/+page.svelte             # Editor CRUD demo
│   ├── editor/+page.server.ts          # Editor SSR data loading
│   ├── editor/api/+server.ts           # Editor REST API endpoints
│   └── api/cards/+server.ts # API endpoint (optional)
└── app.html                 # HTML template

database/
├── schema.sql              # CardStack PostgreSQL schema and seed data
├── schema_v2.sql           # Additional components schema (Marquee, ExpandingCard, LinkImageHover)
└── schema_editor.sql       # Editor component schema (CRUD demo)
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
- **CardStackMotionFlip.svelte** - Uses FLIP animation technique with 3D roll effects
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
   - Variants: Basic, Advanced (swipe/keyboard), Motion Flip (3D roll)
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

8. **Editor** - CRUD modal component with database integration
   - Features: Full Create, Read, Update, Delete operations
   - Form validation with real-time feedback
   - Database integration with graceful fallback to in-memory mode
   - Loading states, error handling, accessible modal
   - Perfect for demonstrating real-world data management patterns

9. **DataGrid** - Two data grid implementations for different use cases
   - **DataGridBasic**: Self-contained, zero-dependency grid (copy-paste ready)
     - Column sorting, global search/filter, pagination
     - Suitable for datasets up to ~500 rows
     - ~10KB bundle size, fully portable
   - **DataGridAdvanced**: Production-ready wrapper around SVAR Grid
     - Virtual scrolling for large datasets (1000s of rows)
     - Inline editing with various editor types
     - Row selection, CSV export, theme support
     - Requires @svar-ui/svelte-grid dependency (~155KB)
   - Database integration with fallback to constants
   - Demonstrates dual-approach pattern: simple vs feature-rich

10. **ExpandableSankey** - Interactive hierarchical flow visualization
   - Features: Expand/collapse nodes to reveal nested children
   - Built with Unovis (@unovis/svelte) for smooth transitions
   - Colour-coded flows inherited from source nodes
   - Click expandable nodes to show/hide child nodes
   - Automatic link aggregation (collapses show summary, expanded shows detail)
   - Supports multi-level hierarchies (parents, children, grandchildren)
   - Mouse-tracking tooltips (provided by Unovis)
   - Perfect for energy flows, process breakdowns, budget allocations
   - Database integration with fallback to constants
   - Dependencies: @unovis/svelte, @unovis/ts (~bundle size depends on tree-shaking)

### Utility Components

11. **StaggeredMenu** - Animated navigation menu
   - Features: Staggered entrance animations, active state highlighting

## Code Quality & Warnings

### Known svelte-check Warnings (Safe to Ignore)

The project has **zero build warnings** (`bun run build` is clean) and **zero TypeScript errors**. Some warnings from `bun run check` are documented below as safe to ignore:

#### CSS Unused Selector Warnings (14 warnings)
**Location**: `Editor.svelte`
- **Reason**: CSS classes are used by child form components that are rendered within the Editor modal. Svelte's static analysis cannot detect these dynamically created elements
- **Examples**: Input fields, textareas, buttons, and error message styles that appear when the form is rendered
- **Mitigation**: All form-related CSS is necessary for proper styling of the modal's content
- **Impact**: None - CSS is actively used at runtime for form rendering, warnings are false positives

**Location**: `CardStackMotionFlip.svelte`
- **Reason**: CSS classes are applied dynamically via the `getCardClass()` function, which Svelte's static analysis cannot detect
- **Mitigation**: All selectors are documented with `/* svelte-ignore css-unused-selector */` comments explaining why they're used
- **Impact**: None - CSS is actively used at runtime for animation states, warnings are false positives

### Build Status
- **Production Build**: ✅ Zero errors, zero warnings
- **Type Check**: ✅ Zero TypeScript errors
- **CSS Warnings**: ⚠️ 14 documented false-positive warnings (safe to ignore)
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
- Run `bun run check` to see all type errors (expect 53 false positives in route files)
- Ensure all imports use correct paths (`$lib/...`)
- Check that interfaces are exported from `src/lib/types.ts`

### Components Not Displaying
- Verify data is being passed correctly to component props
- Check browser console for runtime errors
- Ensure image URLs in data are accessible

## Editor Component - CRUD Pattern Implementation

The **Editor component** demonstrates a complete, production-ready CRUD (Create, Read, Update, Delete) implementation with database integration and graceful fallback. It serves as both a functional demo and a learning resource for developers implementing data management features.

### Architecture Overview

The Editor implementation follows a multi-layer architecture:

```
User Interface Layer
├── Editor.svelte (Modal UI with form validation)
└── /editor/+page.svelte (Demo page with ExpandingCard grid)

API Layer
└── /editor/api/+server.ts (REST endpoints: GET, POST, PUT, DELETE)

Business Logic Layer
└── editorData.ts (CRUD functions with fallback logic)

Data Layer
├── Database (Neon PostgreSQL - editor_data table)
└── Fallback (FALLBACK_EDITOR_DATA constant)
```

### Key Features

1. **Dual-Mode Operation**
   - **Database Mode**: Full CRUD with persistence to Neon
   - **In-Memory Mode**: Local state management when DATABASE_URL not configured
   - Automatic detection and user notification of current mode

2. **Form Validation**
   - Real-time validation with Svelte 5 `$derived` rune
   - "Touched" state tracking (only show errors after user interaction)
   - Required field validation
   - URL format validation for image sources
   - Character length limits

3. **REST API Endpoints** (`/editor/api/+server.ts`)
   - `GET` - Fetch items with optional category filtering
   - `POST` - Create new item (returns item with generated ID)
   - `PUT` - Update existing item (partial updates supported)
   - `DELETE` - Soft delete (sets `is_active = FALSE`)
   - Proper HTTP status codes and error messages

4. **Server Utilities** (`editorData.ts`)
   - `loadEditorDataFromDatabase()` - Read with category filtering
   - `createEditorData()` - Create with auto-incremented `display_order`
   - `updateEditorData()` - Update with partial field support
   - `deleteEditorData()` - Soft delete for audit trail
   - All functions include fallback to constants

5. **Accessibility**
   - Modal focus trap (Tab/Shift+Tab navigation)
   - Escape key to close
   - ARIA roles (dialog, alert for errors)
   - Focus management (first field on open, first invalid field on error)
   - Screen reader announcements

### Database Schema

```sql
-- database/schema_editor.sql
CREATE TABLE editor_data (
    id SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    compact_text TEXT NOT NULL,
    expanded_text TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255) NOT NULL,
    bg_color VARCHAR(50) DEFAULT 'bg-lime-100',
    category VARCHAR(50) DEFAULT 'editor-demo',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_editor_data_updated_at
    BEFORE UPDATE ON editor_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Usage Examples

#### Basic CRUD Operations

```typescript
// CREATE
const newItem = await fetch('/editor/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    heading: 'New Card',
    compactText: 'Short description',
    expandedText: 'Full description',
    imageSrc: 'https://example.com/image.jpg',
    imageAlt: 'Image description',
    bgColor: 'bg-blue-100',
    category: 'editor-demo'
  })
});

// READ
const response = await fetch('/editor/api?category=editor-demo');
const { data } = await response.json();

// UPDATE
await fetch('/editor/api', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 123,
    heading: 'Updated Title'
  })
});

// DELETE
await fetch('/editor/api?id=123', { method: 'DELETE' });
```

#### Using the Editor Component

```svelte
<script>
  import Editor from '$lib/components/Editor.svelte';
  import type { EditorData } from '$lib/types';

  let editorOpen = $state(false);
  let editingItem = $state(null);

  async function handleSave(formData: EditorData) {
    // Your save logic here
    console.log('Saving:', formData);
    editorOpen = false;
  }
</script>

{#if editorOpen}
  <Editor
    mode={editingItem ? 'edit' : 'create'}
    initialData={editingItem || {}}
    usingDatabase={true}
    onSave={handleSave}
    onCancel={() => editorOpen = false}
  />
{/if}
```

### Implementation Patterns

#### Server-Side Data Loading

```typescript
// src/routes/editor/+page.server.ts
import { loadEditorDataFromDatabase } from '$lib/server/editorData';

export const load: PageServerLoad = async () => {
  const editorData = await loadEditorDataFromDatabase('editor-demo');
  const usingDatabase = !!process.env.DATABASE_URL;

  return { editorData, usingDatabase };
};
```

#### Graceful Fallback in Server Utility

```typescript
export async function loadEditorDataFromDatabase(category?: string) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn('DATABASE_URL not configured, using fallback');
      return FALLBACK_EDITOR_DATA.filter(d => !category || d.category === category);
    }

    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM editor_data WHERE is_active = TRUE`;

    return rows.map(row => ({
      id: row.id,
      heading: row.heading,
      compactText: row.compact_text,  // snake_case → camelCase
      // ... rest of transformation
    }));
  } catch (err) {
    console.error('Error loading data:', err);
    return FALLBACK_EDITOR_DATA;  // Always return fallback on error
  }
}
```

#### Form Validation with Svelte 5

```typescript
let formData = $state({
  heading: '',
  compactText: '',
  // ... other fields
});

let errors = $state<Record<string, string>>({});
let touched = $state<Record<string, boolean>>({});

// Computed validation status
let isValid = $derived(Object.keys(errors).length === 0);

// Only show errors for touched fields
let visibleErrors = $derived(
  Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key])
  )
);

// Auto-validate on change
$effect(() => {
  const _ = JSON.stringify(formData);
  validateForm();
});
```

### Type Definitions

```typescript
// src/lib/types.ts

// Component data (camelCase for JavaScript/TypeScript)
export interface EditorData {
  id?: number;
  heading: string;
  compactText: string;
  expandedText: string;
  imageSrc: string;
  imageAlt: string;
  bgColor?: string;
  category?: string;
}

// Database row (snake_case for PostgreSQL)
export interface EditorDataRow {
  id: number;
  heading: string;
  compact_text: string;
  expanded_text: string;
  image_url: string;
  image_alt: string;
  bg_color: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Component props
export interface EditorProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<EditorData>;
  usingDatabase?: boolean;
  onSave?: (data: EditorData) => void | Promise<void>;
  onCancel?: () => void;
}
```

### Design Decisions

1. **Soft Deletes**: Use `is_active` flag instead of hard deletes to maintain audit trail
2. **Partial Updates**: `updateEditorData()` uses SQL `COALESCE` for unchanged fields
3. **Auto Display Order**: New items get `MAX(display_order) + 1` for their category
4. **Separation of Concerns**: Database types (snake_case) separate from component types (camelCase)
5. **Error Resilience**: All server utilities return fallback data on error
6. **Status Transparency**: `DatabaseStatus` component shows connection state to users

### Testing Checklist

**With Database (DATABASE_URL set):**
- ✅ Create persists to Neon and appears immediately
- ✅ Edit updates database and UI in real-time
- ✅ Delete soft-deletes (check `is_active` in database)
- ✅ Refresh page - changes persist
- ✅ Validation prevents invalid data from being saved

**Without Database:**
- ✅ Create adds to local state with temporary ID
- ✅ Edit updates local state
- ✅ Delete removes from display
- ✅ Warning shows "not persisted" message
- ✅ Refresh page - changes lost (expected)

### Extending the Pattern

To adapt this CRUD pattern for your own data:

1. Create database schema with similar structure (id, display_order, is_active, timestamps)
2. Add types to `src/lib/types.ts` (both component and row interfaces)
3. Add fallback data to `src/lib/constants.ts`
4. Create server utility in `src/lib/server/` following the same pattern
5. Create API endpoint in `src/routes/your-feature/api/+server.ts`
6. Adapt Editor component or create custom form
7. Build demo page with your display component

## DataGrid Components - Dual Implementation Pattern

The **DataGrid components** demonstrate a dual-approach pattern: offering both a lightweight self-contained solution and a feature-rich production-ready alternative. This allows developers to choose the right tool for their specific needs.

### Why Two Implementations?

This project provides two distinct data grid implementations to serve different use cases:

1. **DataGridBasic**: For learning, prototyping, and small-medium datasets
2. **DataGridAdvanced**: For production applications with large datasets and complex requirements

This dual approach teaches developers:
- When to use external libraries vs. building from scratch
- Trade-offs between bundle size and features
- How to wrap third-party libraries while maintaining project conventions
- How to create portable, dependency-free components

### DataGridBasic - Self-Contained Implementation

**File**: `src/lib/components/DataGridBasic.svelte`

**Philosophy**: Zero external dependencies, fully copy-paste ready, educational focus

**Features**:
- Column sorting (ascending/descending)
- Global search/filter across all columns
- Pagination with configurable page size
- Responsive table design
- Accessible keyboard navigation
- Customisable styling (striped, hoverable, compact modes)
- Dark mode support
- Custom cell formatters

**Performance**: Suitable for datasets up to ~500 rows (no virtual scrolling)

**Bundle Size**: ~10KB (minified)

**Usage Example**:
```svelte
<script>
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import type { DataGridColumn } from '$lib/types';

  const columns: DataGridColumn[] = [
    { id: 'id', header: 'ID', width: 60, type: 'number' },
    { id: 'name', header: 'Name', width: 150 },
    {
      id: 'salary',
      header: 'Salary',
      type: 'number',
      formatter: (value) => `£${value.toLocaleString('en-GB')}`
    },
    { id: 'hireDate', header: 'Hire Date', type: 'date' }
  ];

  const data = [
    { id: 1, name: 'John Doe', salary: 75000, hireDate: '2020-01-15' },
    // ... more rows
  ];
</script>

<DataGridBasic
  {data}
  {columns}
  sortable={true}
  filterable={true}
  pageSize={10}
  striped={true}
  hoverable={true}
/>
```

**Key Implementation Details**:
- Uses Svelte 5 `$state` and `$derived` runes for reactive state
- Pure CSS styling with scoped styles
- No virtual scrolling (renders all visible rows in DOM)
- Client-side sorting and filtering
- Type-safe column definitions with custom formatters

**When to Use**:
- ✅ Small-medium datasets (up to 500 rows)
- ✅ Prototyping and learning projects
- ✅ Projects where bundle size matters
- ✅ Need copy-paste portability
- ❌ Large datasets requiring virtual scrolling
- ❌ Need inline editing functionality
- ❌ Require advanced features like column resizing

### DataGridAdvanced - SVAR Grid Wrapper

**File**: `src/lib/components/DataGridAdvanced.svelte`

**Philosophy**: Production-ready features using established third-party library

**Dependencies**: `@svar-ui/svelte-grid` (~155KB)

**Features**:
- Virtual scrolling for 1000s of rows
- Inline editing with multiple editor types:
  - Text input
  - Number input
  - Date picker
  - Select dropdown
- Row selection (single or multiple)
- CSV export functionality
- Auto-generated columns from data structure
- Custom column definitions
- Theme support (Willow light/dark)
- WAI-ARIA accessibility compliance
- Print support
- Advanced filtering and sorting

**Performance**: Handles large datasets (10,000+ rows) efficiently

**Usage Example**:
```svelte
<script>
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';

  const employees = [...]; // Your employee data
</script>

<!-- Simple configuration with auto-generated columns -->
<DataGridAdvanced
  data={employees}
  editable={false}
  selectable={false}
  pageSize={20}
  theme="willow"
/>

<!-- Full features enabled -->
<DataGridAdvanced
  data={employees}
  editable={true}
  selectable={true}
  pageSize={20}
  exportable={true}
  theme="willow"
  on:edit={(e) => handleCellEdit(e.detail)}
  on:selection={(e) => handleSelection(e.detail)}
/>
```

**Key Implementation Details**:
- Wraps SVAR Grid with type-safe props interface
- Auto-generates column definitions from data structure
- Supports custom column configuration
- Handles edit and selection events
- Provides CSV export utility function
- Theme wrapper component pattern
- Maintains separation between DataGridColumn format and SVAR Grid format

**SVAR Grid Integration Pattern**:
```typescript
// Convert our column format to SVAR Grid format
const gridColumns = $derived(() => {
  return columns.map((col) => ({
    id: col.id,
    header: col.header,
    width: typeof col.width === 'number' ? col.width : undefined,
    sort: col.sortable !== false,
    filter: col.filterable !== false,
    editor: editable && col.editable !== false ? getEditorType(col.type) : undefined
  }));
});
```

**When to Use**:
- ✅ Large datasets (1000+ rows)
- ✅ Production applications
- ✅ Need inline editing
- ✅ Require virtual scrolling performance
- ✅ Want advanced features out-of-the-box
- ❌ Bundle size is critical concern
- ❌ Need fully portable code
- ❌ Simple use case where DataGridBasic suffices

### Database Integration Pattern

Both DataGrid implementations use the same database integration pattern with graceful fallback:

**Schema**: `database/schema_datagrid.sql`
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  hire_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  location VARCHAR(100),
  phone VARCHAR(20),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Server Utility**: `src/lib/server/dataGrid.ts`
```typescript
export async function loadEmployeesFromDatabase(): Promise<Employee[]> {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn('[DataGrid] DATABASE_URL not configured, using fallback');
      return FALLBACK_EMPLOYEES;
    }

    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM employees WHERE is_active = TRUE`;

    // Transform snake_case to camelCase
    return rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      // ... rest of transformation
    }));
  } catch (error) {
    console.error('[DataGrid] Error:', error);
    return FALLBACK_EMPLOYEES;
  }
}
```

**Fallback Constants**: `src/lib/constants.ts`
```typescript
export const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 95000,
    hireDate: '2020-03-15',
    status: 'active',
    location: 'London',
    phone: '+44 20 7946 0958'
  },
  // ... more sample data
];
```

### Type Definitions

**Employee Data Structure**:
```typescript
export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string; // ISO date format
  status: string;
  location?: string;
  phone?: string;
  notes?: string;
}
```

**Database Row Structure** (snake_case):
```typescript
export interface EmployeeRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  hire_date: Date;
  status: string;
  location: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Column Definition**:
```typescript
export interface DataGridColumn {
  id: string; // Matches data key
  header: string; // Display text
  width?: number | 'auto';
  sortable?: boolean; // Default: true
  filterable?: boolean; // Default: true
  editable?: boolean; // Default: false
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  formatter?: (value: any) => string; // Custom display format
}
```

### Demo Page Features

The `/datagrid` route demonstrates both implementations with:

1. **Statistics Cards**: Total employees, average salary, department count
2. **Component Comparison**: Side-by-side feature comparison
3. **Live Examples**: Interactive demos with tab switching
4. **Usage Guide**: Code examples for both components
5. **Department Breakdown**: Visual data summary

**Page Structure**:
```svelte
// src/routes/datagrid/+page.svelte
<script>
  let activeExample = $state<'basic' | 'advanced-simple' | 'advanced-full'>('basic');
</script>

<!-- Statistics -->
<section class="stats-section">
  <div class="stat-card">
    <div class="stat-value">{data.stats.totalEmployees}</div>
    <div class="stat-label">Total Employees</div>
  </div>
  <!-- ... more stats -->
</section>

<!-- Component Comparison -->
<section class="comparison-section">
  <!-- Feature lists for each implementation -->
</section>

<!-- Live Examples with Tab Switching -->
{#if activeExample === 'basic'}
  <DataGridBasic ... />
{:else if activeExample === 'advanced-simple'}
  <DataGridAdvanced editable={false} ... />
{:else}
  <DataGridAdvanced editable={true} ... />
{/if}
```

### Design Decisions

1. **Dual Implementations**: Provide both simple and advanced options to demonstrate trade-offs
2. **Type Safety**: Maintain consistent types across both implementations
3. **Database Agnostic**: Both grids work with any Employee[] array, regardless of source
4. **Separation of Concerns**:
   - DataGridColumn (our format) separate from SVAR Grid's column format
   - Database rows (snake_case) separate from component data (camelCase)
5. **Progressive Enhancement**: DataGridBasic demonstrates core features, DataGridAdvanced adds production capabilities
6. **Educational Value**: Show when to build vs. when to use libraries

### Extending the Pattern

To create your own data grid component:

**Option 1: Adapt DataGridBasic**
1. Copy `DataGridBasic.svelte` to your project
2. Modify types to match your data structure
3. Customise column configuration
4. Adjust styling to match your design system
5. Add/remove features as needed

**Option 2: Wrap Another Grid Library**
1. Follow the DataGridAdvanced pattern
2. Create type-safe props interface
3. Transform between your format and library format
4. Wrap library component with theme/configuration
5. Provide event handlers for library events
6. Document library-specific features

**Option 3: Hybrid Approach**
1. Start with DataGridBasic for prototyping
2. Identify missing features for your use case
3. Evaluate if external library is justified
4. Migrate to wrapped library if needed
5. Maintain both for comparison

### Performance Considerations

**DataGridBasic**:
- Renders all visible rows in DOM (no virtual scrolling)
- Client-side sorting and filtering
- Performance degrades around 500+ rows
- Suitable for most CRUD admin interfaces
- Low memory footprint

**DataGridAdvanced**:
- Virtual scrolling renders only visible rows
- Handles 10,000+ rows efficiently
- Higher memory usage due to library overhead
- Required for large datasets
- Optimised for data-heavy applications

### Accessibility Features

Both implementations include:
- Keyboard navigation (Tab, Enter, Arrow keys)
- ARIA roles and labels
- Screen reader announcements
- Focus management
- Semantic HTML table structure
- High contrast support
- Reduced motion support

### Testing Strategy

**DataGridBasic Tests**:
- Sorting: Click headers, verify order
- Filtering: Enter search, verify results
- Pagination: Navigate pages, verify data
- Formatting: Check number/date formats
- Responsiveness: Test mobile/tablet views

**DataGridAdvanced Tests**:
- All DataGridBasic tests plus:
- Inline editing: Edit cells, verify saves
- Row selection: Select rows, verify events
- CSV export: Export, verify file contents
- Virtual scrolling: Scroll large dataset, verify performance
- Theme switching: Toggle themes, verify styling

## ExpandableSankey Component - Hierarchical Flow Visualization

The **ExpandableSankey component** provides an interactive hierarchical flow visualization with expand/collapse functionality. Built with Unovis (@unovis/svelte), it creates beautiful animated Sankey diagrams where users can click nodes to reveal or hide nested children, perfect for visualizing energy flows, process breakdowns, budget allocations, and any hierarchical flow data.

### Key Features

1. **Hierarchical Expansion**
   - Click expandable nodes to reveal child nodes
   - Recursive collapse: Collapsing a node also collapses all descendants
   - Smooth animated transitions between states

2. **Intelligent Link Management**
   - Aggregate links: Show summary flows when collapsed
   - Detailed links: Show individual child flows when expanded
   - Automatic link visibility based on node state

3. **Visual Design**
   - Colour-coded flows inherited from source nodes
   - Mouse-tracking tooltips (provided by Unovis)
   - Pointer cursor for clickable nodes
   - Responsive width, fixed height container

4. **Multi-Level Hierarchies**
   - Supports unlimited nesting depth
   - Parent → Child → Grandchild relationships
   - Top-level nodes always visible
   - Child visibility controlled by parent's expanded state

### Architecture Overview

The component uses a factory pattern (`createSankeyData`) that manages visibility:

```
Component Layer
├── ExpandableSankey.svelte (Unovis integration, click handlers)
└── sankeyData.ts (Visibility logic factory)

Data Layer
├── FALLBACK_SANKEY_DATA (constants.ts)
└── Database integration (optional, via server utility)
```

### Data Structure

**Nodes** (`SankeyNode`):
```typescript
{
  id: string;           // Unique identifier
  label: string;        // Display text
  color?: string;       // Hex colour (e.g., '#8B4513')
  expandable?: boolean; // Can be clicked to expand
  expanded?: boolean;   // Current state (managed internally)
  parent?: string;      // Parent node ID (if child)
}
```

**Links** (`SankeyLink`):
```typescript
{
  source: string;  // Source node ID
  target: string;  // Target node ID
  value: number;   // Flow magnitude (determines thickness)
}
```

### Visibility Rules

The `createSankeyData` factory implements these visibility rules:

**Nodes**:
- Top-level nodes (no `parent`): Always visible
- Child nodes: Visible only if parent is expanded

**Links**:
1. Both source and target nodes must be visible
2. Child links (parent → child): Show when parent is expanded
3. Aggregate links (parent → destination): Show when parent is collapsed

This creates the expand/collapse effect:
- **Collapsed**: Shows aggregate flow from parent to destinations
- **Expanded**: Shows detailed flows through children to destinations

### Usage Example

```svelte
<script>
  import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
  import { FALLBACK_SANKEY_DATA } from '$lib/constants';
</script>

<ExpandableSankey
  nodes={FALLBACK_SANKEY_DATA.nodes}
  links={FALLBACK_SANKEY_DATA.links}
  height={600}
/>
```

### Creating Custom Data

Example: Energy distribution system

```typescript
const energyData = {
  nodes: [
    // Top-level source
    { id: 'grid', label: 'Power Grid', color: '#6366f1' },

    // Expandable categories
    { id: 'coal', label: 'Coal', color: '#8B4513', expandable: true },
    { id: 'solar', label: 'Solar', color: '#FFD700', expandable: true },

    // Child nodes (hidden initially)
    { id: 'coal-plant-a', label: 'Plant A', color: '#8B4513', parent: 'coal' },
    { id: 'coal-plant-b', label: 'Plant B', color: '#8B4513', parent: 'coal' },

    // Destinations (always visible)
    { id: 'residential', label: 'Residential', color: '#32CD32' },
    { id: 'industrial', label: 'Industrial', color: '#A0522D' }
  ],
  links: [
    // Grid to sources
    { source: 'grid', target: 'coal', value: 30 },
    { source: 'grid', target: 'solar', value: 20 },

    // Coal to plants (shown when expanded)
    { source: 'coal', target: 'coal-plant-a', value: 20 },
    { source: 'coal', target: 'coal-plant-b', value: 10 },

    // Plants to destinations (detailed flows)
    { source: 'coal-plant-a', target: 'residential', value: 12 },
    { source: 'coal-plant-a', target: 'industrial', value: 8 },

    // Aggregate links (shown when collapsed)
    { source: 'coal', target: 'residential', value: 18 },
    { source: 'coal', target: 'industrial', value: 12 },

    // Solar direct (no children)
    { source: 'solar', target: 'residential', value: 8 },
    { source: 'solar', target: 'industrial', value: 12 }
  ]
};
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `SankeyNode[]` | required | All nodes including hidden children |
| `links` | `SankeyLink[]` | required | All links including hidden connections |
| `height` | `number` | `600` | Container height in pixels |

### Database Integration

Like other components, ExpandableSankey supports database integration with graceful fallback:

**Future Schema** (`database/schema_sankey.sql`):
```sql
CREATE TABLE sankey_nodes (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  color VARCHAR(7),           -- Hex colour
  expandable BOOLEAN DEFAULT FALSE,
  parent VARCHAR(100),        -- Parent node ID
  category VARCHAR(50),       -- For filtering
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE sankey_links (
  source VARCHAR(100) NOT NULL,
  target VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  PRIMARY KEY (source, target, category)
);
```

**Server Utility Pattern** (to be implemented):
```typescript
// src/lib/server/sankey.ts
export async function loadSankeyDataFromDatabase(category?: string) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return FALLBACK_SANKEY_DATA;
    }

    const sql = neon(databaseUrl);
    const nodes = await sql`SELECT * FROM sankey_nodes WHERE is_active = TRUE`;
    const links = await sql`SELECT * FROM sankey_links`;

    return {
      nodes: nodes.map(row => ({
        id: row.id,
        label: row.label,
        color: row.color,
        expandable: row.expandable,
        parent: row.parent
      })),
      links: links.map(row => ({
        source: row.source,
        target: row.target,
        value: Number(row.value)
      }))
    };
  } catch (error) {
    console.error('[Sankey] Error:', error);
    return FALLBACK_SANKEY_DATA;
  }
}
```

### Implementation Details

**Svelte 5 Reactivity**:
The component uses `$state()` to manage the data object. After calling `expand()` or `collapse()`, the entire data object must be reassigned to trigger reactivity:

```typescript
function toggleGroup(node: SankeyNode): void {
  if (node.expandable) {
    if (node.expanded) {
      sankeyData.collapse(node);
    } else {
      sankeyData.expand(node);
    }
    // Critical: Reassign to trigger Svelte 5 reactivity
    data = sankeyData;
  }
}
```

**Unovis Callbacks**:
The component configures Unovis with custom callbacks:

```typescript
const callbacks = {
  // Colour links based on source node
  linkColor: (d) => {
    const sourceNode = data.nodes.find(n => n.id === d.source.id);
    return sourceNode?.color ?? '#ccc';
  },

  // Pointer cursor for expandable nodes
  nodeCursor: (d) => d.expandable ? 'pointer' : null,

  // Click handler
  events: {
    [Sankey.selectors.node]: {
      click: toggleGroup
    }
  }
};
```

### Best Practices

1. **Aggregate Links**: Always provide aggregate links that match the sum of child links. When expanded, users see detailed breakdowns; when collapsed, they see the summary.

2. **Colour Consistency**: Use the same colour for parent and child nodes to show relationships visually.

3. **Meaningful IDs**: Use descriptive IDs (e.g., `coal-plant-a`) not just numbers, for easier debugging.

4. **Balance Depth**: While unlimited nesting is supported, 2-3 levels provide the best UX. Too many levels become hard to track.

5. **Value Accuracy**: Ensure sum of child link values equals the aggregate link value for data integrity.

### Use Cases

**Perfect for**:
- Energy distribution systems (power sources → plants → consumers)
- Budget breakdowns (total → departments → projects → expenses)
- Supply chain flows (suppliers → warehouses → distributors → retailers)
- Data processing pipelines (sources → transformations → destinations)
- Organizational hierarchies (company → divisions → teams → individuals)

**Not ideal for**:
- Simple one-level flows (use basic Sankey instead)
- Circular flows (Sankey diagrams are directional)
- Real-time streaming data (static snapshots work better)

### Dependencies

```bash
bun add @unovis/svelte @unovis/ts
```

**Note**: Bun handles peer dependencies automatically, so no additional flags are needed. The Unovis library is actively maintained and provides excellent TypeScript support.

### Troubleshooting

**Links not showing/disappearing**:
- Verify both source and target node IDs exist
- Check that aggregate links have `expandable` source with `!expanded` state
- Ensure child links have `expandable` source with `expanded === true` state

**Clicks not working**:
- Confirm `expandable: true` is set on parent nodes
- Check browser console for errors
- Verify Unovis imports are correct

**Colours not applying**:
- Ensure `color` field uses hex format with `#` (e.g., `#8B4513`)
- Check that `linkColor` callback is finding the source node
- Verify colour is set on source node, not target

**Performance with large datasets**:
- Unovis handles virtual rendering efficiently
- Consider limiting initial visibility (start collapsed)
- Test with ~100 nodes, should perform smoothly

## Clerk Authentication

### Overview

The project includes optional Clerk authentication integration using `svelte-clerk`. Like database integration, authentication works with graceful fallback - if Clerk keys are not configured, the app functions in "demo mode" with all existing pages remaining accessible.

**Key Features:**
- All existing component demo pages remain **public** (no auth required)
- New **protected demo pages** (`/dashboard`, `/profile`) demonstrate authenticated routes
- Auth demo page (`/auth`) showcases all Clerk components
- Graceful fallback when Clerk keys are not configured

### Configuration

1. Create account at [clerk.com](https://clerk.com)
2. Create a new application in the Clerk Dashboard
3. Navigate to API Keys and copy your keys
4. Add to `.env`:
   ```
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
5. Restart dev server

### File Structure

```
src/
├── hooks.server.ts              # Clerk middleware
├── app.d.ts                     # TypeScript declarations
├── lib/
│   ├── components/
│   │   └── AuthStatus.svelte    # Auth status indicator
│   └── server/
│       └── auth.ts              # Auth utility functions
└── routes/
    ├── +layout.server.ts        # SSR auth props
    ├── auth/                    # Auth demo pages
    │   ├── +page.svelte         # Component showcase
    │   ├── sign-in/[[...rest]]/ # Sign-in page
    │   └── sign-up/[[...rest]]/ # Sign-up page
    └── (protected)/             # Protected route group
        ├── +layout.server.ts    # Auth check
        ├── dashboard/           # Protected dashboard
        └── profile/             # Protected profile
```

### Components

- **AuthStatus**: Status indicator (like DatabaseStatus) showing "Auth Enabled" or "Auth Demo Mode"
- **Navbar**: Includes SignInButton (signed out) or UserButton (signed in) in the right section

### Auth Utility Functions

Import from `$lib/server/auth` in server-side code:

```typescript
// Require auth (redirects to sign-in if not authenticated)
import { requireAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
  const userId = requireAuth(event);
  return { userId };
};

// Check auth without redirecting
import { checkAuth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
  const { authenticated, userId } = checkAuth(event);
  return { isLoggedIn: authenticated };
};

// Require auth for API endpoints (returns 401 if not authenticated)
import { requireAuthAPI } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
  const userId = requireAuthAPI(event);
  // Process authenticated request
};
```

### Protected Route Pattern

Use the `(protected)` route group for pages requiring authentication:

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  const auth = locals.auth();
  if (!auth?.userId) {
    const returnUrl = encodeURIComponent(url.pathname);
    throw redirect(303, `/auth/sign-in?redirect_url=${returnUrl}`);
  }
  return { userId: auth.userId };
};
```

### Client-Side Auth Access

Use Clerk context in client components (do NOT destructure to maintain reactivity):

```svelte
<script lang="ts">
  import { useClerkContext } from 'svelte-clerk/client';
  import { SignedIn, SignedOut, UserButton } from 'svelte-clerk';

  const ctx = useClerkContext();
  const userId = $derived(ctx.auth.userId);
  const user = $derived(ctx.user);
</script>

<SignedOut>
  <p>Please sign in</p>
</SignedOut>
<SignedIn>
  <p>Welcome, {user?.firstName}</p>
  <UserButton />
</SignedIn>
```

### Testing Checklist

- [ ] App loads without Clerk keys (graceful fallback)
- [ ] Sign In button appears in navbar
- [ ] After sign-in, UserButton appears
- [ ] `/auth` demo page shows components
- [ ] `/dashboard` redirects to sign-in when not authenticated
- [ ] `/profile` shows UserProfile when authenticated
- [ ] All existing component pages remain accessible without auth
- [ ] SSR works correctly (page refresh maintains auth state)

## Important Notes

- **Do not install additional animation libraries** without considering component portability
- **Keep components self-contained** - they should work when copied to another project
- **Document everything** - assume users will read the code to learn
- **Maintain type safety** - all props and data structures should be typed
- **Test without database** - ensure fallback data works correctly
- **Follow UK English** spelling in user-facing text (honour, colour, etc.)
- **Avoid icon libraries like lucide-svelte** - use inline SVG or CSS alternatives for portability
