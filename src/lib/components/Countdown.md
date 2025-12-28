# Countdown - Technical Logic Explainer

## Overview

Countdown is a **zero-dependency timer component** that displays the time remaining until a target date. It supports multiple display formats (cards, labels, compact) and includes smooth CSS animations for digit changes.

## The Flow: How the Timer Works

```
[Component Mounts]
      ↓
[Parse targetDate] → Date object | number | ISO string
      ↓
[Calculate Time Remaining]
      ↓
      ├── difference > 0 → Update segments, schedule next tick
      │         ↓
      │   [Wait 1 second]
      │         ↓
      │   [Recalculate] ────────────┐
      │                              │
      └── difference <= 0 → Show completion message
                ↓
          [Call onComplete callback]
                ↓
          [Stop interval timer]
```

## Key Concepts

### 1. Time Unit Calculations

The countdown breaks down milliseconds into human-readable units:

```typescript
// Raw difference in milliseconds
difference = targetDate.getTime() - now.getTime();

// Convert to each unit
totalSeconds = Math.floor(difference / 1000);
totalMinutes = Math.floor(totalSeconds / 60);
totalHours = Math.floor(totalMinutes / 60);
totalDays = Math.floor(totalHours / 24);

// Get remainder for each unit (modulo operation)
hours = totalHours % 24;     // Hours within current day
minutes = totalMinutes % 60; // Minutes within current hour
seconds = totalSeconds % 60; // Seconds within current minute
```

### 2. Segment Data Structure

Each time unit becomes a "segment" with three properties:

```typescript
interface CountdownSegment {
  value: number;    // e.g., 5
  label: string;    // e.g., "Hours" or "Hour" (singular/plural)
  unit: CountdownUnit;  // 'days' | 'hours' | 'minutes' | 'seconds'
}
```

### 3. Animation Trigger Pattern

Animations only play when a value changes (not every second):

```typescript
// Track previous values
previousValues = { days: -1, hours: -1, minutes: -1, seconds: -1 }

// Check if value just changed
hasValueChanged(unit, currentValue) {
  return previousValues[unit] !== currentValue
         && previousValues[unit] !== -1  // Skip initial render
}
```

### 4. Display Format Modes

| Format | Description | Use Case |
|--------|-------------|----------|
| `cards` | Each unit in a dark card with shadow | Hero sections, landing pages |
| `labels` | Large numbers with labels below | Event pages, announcements |
| `compact` | Single line with separators | Headers, tight spaces |

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `segments` | `CountdownSegment[]` | Current countdown values |
| `isComplete` | `boolean` | Timer has reached zero |
| `intervalId` | `number \| null` | Reference for cleanup |
| `previousValues` | `Record<unit, number>` | Animation detection |

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetDate` | `Date \| number \| string` | required | Target date/time |
| `units` | `CountdownUnit[]` | all four | Which units to show |
| `format` | `'cards' \| 'labels' \| 'compact'` | `'cards'` | Display style |
| `showLabels` | `boolean` | `true` | Show unit names |
| `separator` | `string` | `':'` | Compact mode separator |
| `padZeros` | `boolean` | `true` | Pad with zeros (05 vs 5) |
| `completedMessage` | `string` | `"Time's up!"` | Shown when done |
| `onComplete` | `() => void` | - | Called when timer ends |
| `hideOnComplete` | `boolean` | `false` | Hide entire component |

## Date Input Flexibility

The component accepts dates in multiple formats:

```typescript
// Date object
<Countdown targetDate={new Date('2025-12-31')} />

// Timestamp (milliseconds)
<Countdown targetDate={1735689600000} />

// ISO string
<Countdown targetDate="2025-12-31T23:59:59" />
```

## CSS Animation Details

Each format has its own animation style:

| Format | Animation | Effect |
|--------|-----------|--------|
| `cards` | `card-flip` | Subtle scale pulse |
| `labels` | `value-change` | Slide down with fade |
| `compact` | `value-blink` | Quick opacity flash |

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Screen readers | `role="timer"` with `aria-live="polite"` |
| Unit context | Each segment has `aria-label="5 Hours"` |
| Reduced motion | Animations disabled via `@media` query |

## Lifecycle Cleanup

The component properly cleans up its interval timer:

```typescript
onMount(() => {
  // Start the timer
  intervalId = setInterval(calculateTimeRemaining, 1000);
});

onDestroy(() => {
  // Stop the timer when component unmounts
  if (intervalId) {
    clearInterval(intervalId);
  }
});
```

## Common Patterns

### Countdown to Specific Time

```svelte
<Countdown
  targetDate="2025-12-31T23:59:59"
  format="cards"
  onComplete={() => showConfetti()}
/>
```

### Simple Days Counter

```svelte
<Countdown
  targetDate={eventDate}
  units={['days']}
  format="labels"
/>
```

### Inline Timer

```svelte
<p>
  Sale ends in
  <Countdown
    targetDate={saleEnd}
    format="compact"
    units={['hours', 'minutes', 'seconds']}
    showLabels={false}
  />
</p>
```

## Edge Cases Handled

| Scenario | Behaviour |
|----------|-----------|
| Past date | Shows completion message immediately |
| Invalid date | Displays as "0" for all units |
| Component unmount | Interval timer cleaned up |
| Very long duration | Days count grows indefinitely |
