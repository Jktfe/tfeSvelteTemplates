# StatCard — Technical Logic Explainer

## What Does It Do? (Plain English)

StatCard is a single-metric KPI card: a small heading, a big number, and an optional trend indicator that auto-colours green or red based on whether the change is *good* news. The clever bit is the `positiveDirection` prop. For most metrics — revenue, signups, retention — *up* is good. For others — page load time, error counts, churn, costs — *down* is good. Setting `positiveDirection="down"` flips the colour map so a falling load time reads green and a rising one reads red. Same data, correct sentiment.

Think of it as a fuel gauge that knows whether full or empty is the goal.

## How It Works (Pseudo-Code)

```
props:
  title             = string                          // small heading
  value             = string | number                 // the big number (pre-formatted)
  delta             = optional number                 // sign drives the arrow
  deltaSuffix       = string                          // e.g. '%' or ' pts'
  deltaLabel        = string                          // 'vs last week'
  positiveDirection = 'up' | 'down'                   // default 'up'
  size              = 'sm' | 'md' | 'lg'              // default 'md'
  icon              = optional snippet

derive trend ('up' | 'down' | 'flat'):
  if delta is undefined or 0: 'flat'
  if delta > 0:                'up'
  else:                        'down'

derive sentiment ('positive' | 'negative' | 'neutral'):
  if trend == 'flat':                       'neutral'
  if trend == positiveDirection:            'positive'
  else:                                     'negative'

derive deltaDisplay = abs(delta) + deltaSuffix       // sign comes from arrow glyph
derive trendSrText  = "Up 8.2% vs last week"          // full SR sentence

render <article data-trend data-sentiment>
  <header>{icon}{title}</header>
  <div class="stat-value">{value}</div>
  if delta defined:
    <footer>
      <span class="stat-delta sentiment-{sentiment}">
        <span aria-hidden>↑ / ↓ / —</span>
        <span>{deltaDisplay}</span>
      </span>
      if deltaLabel: <span class="stat-delta-label">{deltaLabel}</span>
      <span class="sr-only">{trendSrText}</span>
    </footer>
</article>
```

## The Core Concept: Trend Direction Versus Sentiment

The component separates *what the number did* from *what that means*. Most KPI components conflate them:

```
Bad: if (delta > 0) colour = green
```

That's wrong for half the metrics in a real product. Errors went up — that's red, not green. Page load went down — that's green, not red. StatCard's logic decouples direction from meaning:

```
trend     = sign of delta                ('up' | 'down' | 'flat')
sentiment = trend === positiveDirection  ? 'positive'   ('good news, green')
          : trend === 'flat'             ? 'neutral'    ('grey')
          : 'negative'                                  ('bad news, red')
```

Now the same component handles both *more is better* and *less is better* metrics from a single prop:

```
                            delta>0     delta<0     delta=0
Revenue (up=good)            green       red         grey
Load time (down=good)        red         green       grey
Error count (down=good)      red         green       grey
Churn rate (down=good)       red         green       grey
```

The arrow glyph (`↑`, `↓`, `—`) shows the direction; the colour shows whether that's good or bad; the screen-reader-only sentence puts both together in plain English. Nothing relies on colour alone.

## Accessibility: Colour Is Never The Only Signal

Three independent channels carry the trend information:

1. **The arrow glyph** (`↑` / `↓` / `—`) is `aria-hidden` but visible — sighted users see direction even if they can't perceive colour.
2. **The numeric delta** (`8.2%`) is rendered visibly.
3. **The screen-reader sentence** ("Up 8.2% vs last week") is in a `.sr-only` span so non-visual users get the full picture as one announcement.

```svelte
<span class="stat-delta sentiment-{sentiment}">
  <span class="stat-arrow" aria-hidden>↑</span>
  <span>8.2%</span>
</span>
<span class="stat-delta-label">vs last week</span>
<span class="sr-only">Up 8.2% vs last week</span>
```

This satisfies WCAG 1.4.1 (Use of Color) by design — every piece of information conveyed by colour is also conveyed by glyph and text.

The card is wrapped in an `<article>` because each StatCard is a standalone, self-contained unit of content. The title is an `<h3>`, which assumes the surrounding page has `<h1>`/`<h2>` higher up in the dashboard hierarchy.

## Tabular Numerals

The `.stat-value` has `font-variant-numeric: tabular-nums`. Numerals are forced to equal width so a column of stacked values aligns visually:

```
Without tabular-nums:        With tabular-nums:
£12,450                      £12,450
£8,103                       £ 8,103
£104,230                     £104,230
                                  ↑ everything lines up at the comma
```

For dashboards where many StatCards stack vertically, this is the difference between a tidy column and a jaggy one. Same trick is applied to the delta numerals.

## CSS Animation Strategy

The card has a quiet hover transition:

```css
.stat-card {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

Just a one-step border darkening and a soft drop shadow. The card itself isn't clickable by default — these are *informational* — but the affordance suggests "you can interact with this", which is the right invitation when the consumer wraps the card in a button or a link.

`prefers-reduced-motion: reduce` removes the transition. The hover feedback still happens (the styles still resolve) but instantaneously.

## State Flow Diagram

```
                  ┌──────────────────┐
                  │  delta provided  │
                  └────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              │ delta > 0  │ delta < 0  │ delta == 0
              ▼            ▼            ▼
        trend='up'   trend='down'  trend='flat'
              │            │            │
              └────┬───────┘            │
                   │                    │
                   ▼                    ▼
        ┌──────────────────────┐  sentiment='neutral'
        │ trend ==             │       (grey, —)
        │ positiveDirection?   │
        └─────┬────────┬───────┘
        yes   │        │   no
              ▼        ▼
        positive  negative
        (green ↑) (red ↓)

                 │
                 ▼
        Render arrow glyph + abs(delta) + sentiment colour
        + sr-only "Up 8.2% vs last week" sentence
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `''` | Metric label, rendered as a small uppercase header. |
| `value` | `string \| number` | `''` | The big number. Pre-format currencies, percentages, units in the caller. |
| `delta` | `number` | `undefined` | Trend value. Sign drives the arrow direction; magnitude is the displayed delta. |
| `deltaSuffix` | `string` | `''` | Suffix appended to the absolute delta — e.g. `'%'` or `' pts'`. |
| `deltaLabel` | `string` | `''` | Footer context line — e.g. `'vs last week'`. |
| `positiveDirection` | `'up' \| 'down'` | `'up'` | Which trend direction is considered "good". |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card physical size — drives padding and value font. |
| `icon` | `Snippet` | `undefined` | Leading icon snippet shown in the header. |
| `class` | `string` | `''` | Extra classes appended to the article. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `delta` is `undefined` | The footer is omitted entirely — just title and value render. Use this for metrics where comparison data is not yet available. |
| `delta` is `0` | Trend is `'flat'`, sentiment is `'neutral'`, the glyph is `—` and the colour is grey. SR reads "No change". |
| `delta` is negative and `positiveDirection="down"` | Sentiment is `'positive'` — green colour, downward arrow. (Falling load time is good news.) |
| `delta` is negative and `positiveDirection="up"` (default) | Sentiment is `'negative'` — red colour, downward arrow. (Falling revenue is bad news.) |
| `value` is a raw number with no formatting | Displayed as-is. Pre-format in the caller (`'£12,450'`, `'1.4s'`, `'42%'`); StatCard never guesses unit conventions. |
| Multiple StatCards stacked vertically | `font-variant-numeric: tabular-nums` keeps numerals aligned across cards. |
| User has `prefers-reduced-motion: reduce` | Hover transition is removed; the same visual result happens instantly. |
| Wrapped in a clickable parent | Works fine — StatCard does not capture clicks itself. The hover affordance complements the wrapping link/button. |

## Dependencies

- **Svelte 5.x** — `$props`, `$derived`, snippets.
- Zero external runtime dependencies. Pure scoped CSS.

## File Structure

```
src/lib/components/StatCard.svelte         # component implementation
src/lib/components/StatCard.md             # this file (rendered inside ComponentPageShell)
src/lib/components/StatCard.test.ts        # vitest unit tests
src/routes/statcard/+page.svelte           # demo page
```
