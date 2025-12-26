# Editor - Technical Logic Explainer

## Overview

Editor is a **CRUD modal component** demonstrating best practices for form handling, validation, and database integration in Svelte 5. It's designed for creating and editing ExpandingCard data.

## The Flow: Create vs Edit Mode

```
[Mode: 'create']              [Mode: 'edit']
     ↓                              ↓
Empty form fields            Pre-filled from initialData
     ↓                              ↓
     └──────────── Validation ──────────────┘
                        ↓
              [User fills/modifies]
                        ↓
              [Real-time validation]
                        ↓
              [Submit → onSave callback]
                        ↓
              [Parent handles API call]
```

## Key Concepts

### 1. "Touched" State Pattern

Errors only show AFTER user has interacted with a field:

```typescript
// State
touched: Record<string, boolean> = {}  // { heading: false, ... }
errors: Record<string, string> = {}    // { heading: 'Required', ... }

// Visible errors = intersection
visibleErrors = errors WHERE touched[field] === true
```

**Why?** Avoids overwhelming users with red errors before they've typed anything.

### 2. Real-Time Validation

Validation runs on every form change via `$effect`:

```typescript
$effect(() => {
  // Trigger on any formData change
  const _ = JSON.stringify(formData);
  validateForm();  // Updates errors state
});
```

### 3. Field Validation Rules

| Field | Rules |
|-------|-------|
| `heading` | Required, max 255 chars |
| `compactText` | Required |
| `expandedText` | Required |
| `imageSrc` | Required, valid URL |
| `imageAlt` | Required, max 255 chars |
| `bgColor` | Optional, preset values |
| `category` | Optional |

### 4. Focus Trap (Accessibility)

Tab/Shift+Tab cycles through focusable elements within the modal:

```typescript
// On Tab at last element → jump to first
// On Shift+Tab at first element → jump to last
focusableElements = modal.querySelectorAll(
  'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
);
```

### 5. Database Awareness

Component shows warnings when `usingDatabase={false}`:

```svelte
{#if !usingDatabase}
  <div class="warning">
    ⚠️ Changes won't be saved - no database connected
  </div>
{/if}
```

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `formData` | `EditorData` | All field values |
| `errors` | `Record<string, string>` | Validation messages |
| `touched` | `Record<string, boolean>` | User interaction tracking |
| `saving` | `boolean` | Disable form during submit |

## Derived Values

```typescript
isValid = $derived(Object.keys(errors).length === 0)
visibleErrors = $derived(
  Object.entries(errors).filter(([key]) => touched[key])
)
```

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'create' \| 'edit'` | `'create'` | Form mode |
| `initialData` | `Partial<EditorData>` | `{}` | Pre-fill values |
| `usingDatabase` | `boolean` | `false` | Show DB warnings |
| `onSave` | `(data) => void` | - | Save callback |
| `onCancel` | `() => void` | - | Cancel callback |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close modal |
| `Tab` | Next field (cycles) |
| `Shift+Tab` | Previous field (cycles) |
| `Enter` in field | Move to next field |

## Form Fields Used

The Editor uses these reusable form components:

- `TextField` - Text inputs (heading, imageAlt, imageSrc)
- `TextareaField` - Multi-line text (compactText, expandedText)
- `SelectField` - Dropdown (bgColor)

## Known Warnings (Safe to Ignore)

CSS unused selector warnings for `.field-input`, `.field-error`, etc. These selectors style child form components that are rendered dynamically.

## Security

Form data is validated but NOT sanitized in this component - sanitization happens at the display layer (where data is rendered) to prevent XSS.
