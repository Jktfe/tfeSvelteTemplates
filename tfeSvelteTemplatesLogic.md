# tfeSvelteTemplates Logic Documentation

## Project Overview

**Purpose**: Production-ready Svelte 5 component templates library with comprehensive documentation and database integration.

**Tech Stack**:
- Frontend: Svelte 5 (runes: $state, $derived, $effect)
- Database: Neon (PostgreSQL) with graceful fallback
- Styling: Scoped CSS + TailwindCSS
- Deployment: Vercel
- Testing: Vitest + Playwright

---

## Data Sources

### Database Tables

#### `cards` (CardStack component)
```sql
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  heading VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'card-stack',
  display_order INTEGER NOT NULL DEFAULT 0
);
```

**Used by**: CardStack.svelte, CardStackMotionFlip.svelte

#### `testimonials` (Marquee component)
```sql
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  category VARCHAR(50) DEFAULT 'testimonials',
  display_order INTEGER NOT NULL DEFAULT 0
);
```

**Used by**: Marquee.svelte, MarqueeDraggable.svelte

#### `expanding_cards` (ExpandingCard component)
```sql
CREATE TABLE expanding_cards (
  id SERIAL PRIMARY KEY,
  heading VARCHAR(255) NOT NULL,
  compact_text TEXT NOT NULL,
  expanded_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt VARCHAR(255) NOT NULL,
  bg_color VARCHAR(50) DEFAULT 'bg-lime-100',
  category VARCHAR(50) DEFAULT 'expanding-card'
);
```

**Used by**: ExpandingCard.svelte

#### `link_previews` (LinkImageHover component)
```sql
CREATE TABLE link_previews (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  link_text VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'link-hover'
);
```

**Used by**: LinkImageHover.svelte

#### `editor_data` (Editor CRUD component)
```sql
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
```

**Used by**: Editor.svelte (full CRUD demo)

#### `employees` (DataGrid components)
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
  is_active BOOLEAN DEFAULT TRUE
);
```

**Used by**: DataGridBasic.svelte, DataGridAdvanced.svelte

#### `sankey_nodes` and `sankey_links` (ExpandableSankey component)
```sql
CREATE TABLE sankey_nodes (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  expandable BOOLEAN DEFAULT FALSE,
  parent VARCHAR(100),
  category VARCHAR(50)
);

CREATE TABLE sankey_links (
  source VARCHAR(100) NOT NULL,
  target VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50)
);
```

**Used by**: ExpandableSankey.svelte

---

## Key Functions

### Data Loading Functions (src/lib/server/)

#### `loadCardsFromDatabase()`
**Purpose**: Load cards from Neon database with graceful fallback
**Returns**: `Card[]`
**Logic**:
```
IF DATABASE_URL is set
  THEN connect to Neon and query cards table
  ELSE return FALLBACK_CARDS constant
IF error occurs
  THEN log error and return FALLBACK_CARDS
```

#### `loadTestimonialsFromDatabase(category?: string)`
**Purpose**: Load testimonials, optionally filtered by category
**Returns**: `Testimonial[]`
**Logic**:
```
IF DATABASE_URL is set
  THEN connect to Neon
  IF category provided
    THEN query WHERE category = $category
    ELSE query all testimonials
ELSE return FALLBACK_TESTIMONIALS
Transform snake_case database columns to camelCase properties
```

#### `loadEditorDataFromDatabase(category?: string)`
**Purpose**: Load editor data for CRUD demo
**Returns**: `EditorData[]`
**Logic**:
```
IF DATABASE_URL is set
  THEN query WHERE is_active = TRUE
  IF category provided
    THEN filter by category
  Transform database rows (snake_case) to component props (camelCase)
ELSE return FALLBACK_EDITOR_DATA
```

#### `createEditorData(data: EditorData)`
**Purpose**: Create new editor entry with auto-incremented display_order
**Returns**: `EditorData` with generated ID
**Logic**:
```
IF DATABASE_URL is set
  THEN calculate next display_order (MAX + 1 for category)
  INSERT new record
  RETURN inserted row with ID
ELSE simulate ID generation (Date.now() * -1 for temp IDs)
  RETURN data with temp ID
```

#### `updateEditorData(id: number, data: Partial<EditorData>)`
**Purpose**: Update existing editor entry (partial updates supported)
**Returns**: `EditorData`
**Logic**:
```
IF DATABASE_URL is set
  THEN UPDATE using COALESCE for unchanged fields
  SET updated_at = NOW()
  RETURN updated row
ELSE update in-memory fallback array
  RETURN updated data
```

#### `deleteEditorData(id: number)`
**Purpose**: Soft delete editor entry (sets is_active = FALSE)
**Returns**: `boolean`
**Logic**:
```
IF DATABASE_URL is set
  THEN UPDATE SET is_active = FALSE WHERE id = $id
ELSE filter out from in-memory array
RETURN success status
```

---

## Business Logic Patterns

### Database Fallback Pattern

**Used throughout the project** to ensure components work without database:

```
TRY
  IF DATABASE_URL exists
    THEN load from Neon database
    Transform snake_case columns to camelCase
  ELSE
    RETURN fallback constants
CATCH error
  Log error
  RETURN fallback constants
```

**Why**: Developers can copy components without setting up database.

### Type Transformation Pattern

**Database rows use snake_case** (PostgreSQL convention):
```typescript
interface CardRow {
  id: number;
  heading: string;
  image_url: string;  // snake_case
}
```

**Components use camelCase** (JavaScript convention):
```typescript
interface Card {
  id: number;
  heading: string;
  imageSrc: string;  // camelCase
}
```

**Transformation happens in server utilities**:
```typescript
const cards = rows.map(row => ({
  id: row.id,
  heading: row.heading,
  imageSrc: row.image_url  // Transform here
}));
```

### Soft Delete Pattern

**Editor component uses soft deletes** for audit trail:
- Records have `is_active` boolean field
- DELETE operation sets `is_active = FALSE` (not hard delete)
- Queries filter `WHERE is_active = TRUE`

**Why**: Maintain history, allow recovery, support audit requirements.

---

## Component Architecture

### Self-Contained Components

**Design principle**: Each component can be copied to another project and work immediately.

**Requirements**:
- All styles scoped within `<style>` tags
- Props fully typed with TypeScript interfaces
- Extensive JSDoc comments
- Zero external dependencies (or clearly justified)

### Database Status Indicator

**Component**: `DatabaseStatus.svelte`

**Purpose**: Show users whether app is connected to Neon or using fallback data

**Logic**:
```
IF usingDatabase prop is TRUE
  THEN display "🟢 Database Connected"
ELSE
  THEN display "🟡 Using Demo Data"
```

**Used on**: Home page, CardStack page, Editor page

---

## Testing Strategy

### Unit Tests (Vitest)

**Location**: Co-located with components (`*.test.ts`)

**Test priority**:
1. Simple components (ShineBorder, SwishButton)
2. Form components (TextField, NumberField)
3. Utilities (cn, sanitizeHTML)
4. Complex components (Editor, DataGridBasic)
5. External dep wrappers (mock libraries)

### E2E Tests (Playwright)

**Location**: `tests/` directory

**Coverage**:
- User flows (navigation, form submission)
- Component interactions
- Database integration

---

## Build & Deployment

### Vercel Deployment

**Adapter**: `@sveltejs/adapter-vercel`
**Runtime**: Node.js 20.x (required for Neon serverless driver)

**Environment Variables**:
- `DATABASE_URL` - Neon connection string (optional)
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth (optional)
- `CLERK_SECRET_KEY` - Clerk auth (optional)

**Build command**: `bun run build`
**Output**: `.vercel/output/`

---

## Mistakes to Avoid

### [Add your own as you discover them]

Example format:
```markdown
### 2026-01-07: Don't use npm
- ❌ Wrong: `npm install package-name`
- ✅ Correct: `bun add package-name`
- Reason: We use bun for faster package management
```

---

## Future Enhancements

- [ ] Add more animation components
- [ ] Expand test coverage to 80%+
- [ ] Create storybook integration
- [ ] Add accessibility audit tooling

---

**Last Updated**: 2026-01-07
**Maintainer**: @Jktfe (James King)
