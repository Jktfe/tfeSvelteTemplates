# ToastNotification

A robust, accessible notification system for displaying temporary global alerts. It uses Svelte 5 module script runes for a simple, zero-dependency singleton API that can be used from anywhere in your application.

## Features

- **Global Singleton API**: Trigger notifications from any component or logic file without prop drilling.
- **Stackable Design**: Supports multiple simultaneous notifications with smooth layout transitions.
- **Visual Severities**: Built-in styling for `success`, `error`, `warning`, and `info`.
- **Auto-Dismiss**: Configurable duration for each toast (default 5s, 0 for persistent).
- **Interactive Actions**: Supports optional action buttons (e.g., "Undo") within notifications.
- **Accessible**: ARIA-live regions, proper roles, and keyboard navigation.

## Usage

### 1. Register the container
Add the component once to your root `+layout.svelte`:

```svelte
<script>
  import ToastNotification from '$lib/components/ToastNotification.svelte';
</script>

<ToastNotification position="top-right" />
<slot />
```

### 2. Trigger toasts
Import the `addToast` helper in any file:

```svelte
<script>
  import { addToast } from '$lib/toast.svelte';

  function handleSave() {
    // ... save logic
    addToast({
      message: "Changes saved successfully!",
      severity: "success"
    });
  }
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `ToastPosition` | `'top-right'` | Screen corner: `top-right`, `top-left`, `bottom-right`, `bottom-left` |
| `maxVisible` | `number` | `5` | Maximum number of toasts to show at once |
| `class` | `string` | `''` | Additional CSS classes for the container |

## API: addToast(data)

The `addToast` function accepts a `ToastData` object:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `message` | `string` | required | The text to display |
| `severity` | `string` | `'info'` | `success`, `error`, `warning`, `info` |
| `duration` | `number` | `5000` | MS before auto-dismiss (0 for persistent) |
| `dismissible`| `boolean`| `true` | Show the close (X) button |
| `action` | `object` | `undefined`| `{ label: string, onclick: () => void }` |

## Accessibility

- **Roles**: Uses `role="status"` and `aria-live="polite"` for general updates. For `error` severity, it can be configured to use `role="alert"` for immediate screen reader interruption.
- **Focus**: When a toast with an action is triggered, it does not steal focus automatically (to avoid jarring navigation), but remains in the Tab order.
- **Motion**: Transitions are disabled if `prefers-reduced-motion` is active.
