# PasswordStrengthMeter

## What Does It Do? (Plain English)

PasswordStrengthMeter watches a password string and tells the user how strong it is — right now, as they type. It draws a four-segment bar that fills up (red → amber → lime → green), prints a one-word verdict (Weak / Fair / Good / Strong), and lists each requirement with a green tick or a red cross so the user knows exactly what is still missing.

**Think of it like:** a fuel gauge for passwords. Every rule the password satisfies pumps a bit more into the tank; when it is full, you are good to go.

Crucially, this component is a *meter only*. It does **not** contain the password input box. You keep your own `<input>`, and you pass its value into the meter. That keeps the meter tiny, framework-agnostic, and reusable next to any field — sign-up, password change, admin reset, whatever.

---

## How It Works (Pseudo-Code)

```
GIVEN a `value` string and a list of `rules`:

  1. FOR each rule:
       run rule.test(value) → true / false        (the checklist row state)

  2. passedCount = number of rules that returned true

  3. IF value is empty OR passedCount is 0:
       filledSegments = 0                          (nothing lit)
     ELSE:
       fraction       = passedCount / rules.length
       filledSegments = clamp( ceil(fraction × 4), 1, 4 )

  4. levelIndex = max(0, filledSegments − 1)        (0..3)
     levelLabel = ['Weak','Fair','Good','Strong'][levelIndex]

  5. RENDER:
       - 4 bar segments; light the first `filledSegments`
       - an aria-live status line: "Password strength: {levelLabel}"
       - (optional) a checklist, one row per rule, tick or cross

WHENEVER `value` changes, steps 1–5 recompute via $derived.
```

There is no internal state and no effect — everything is a pure `$derived` of `value` and `rules`. That is what makes the meter cheap to run on every keystroke.

---

## The Core Concept: Rule-Based Scoring

The score is not a black-box entropy estimate — it is a transparent count of satisfied rules. Each rule is a small object:

```ts
interface PasswordRule {
  id: string;                          // stable key for the {#each}
  label: string;                       // shown in the checklist
  test: (value: string) => boolean;    // pure predicate
}
```

The default set encodes the familiar policy:

| id | Requirement | Test |
|----|-------------|------|
| `length` | At least 8 characters | `v.length >= 8` |
| `lowercase` | A lowercase letter | `/[a-z]/` |
| `uppercase` | An uppercase letter | `/[A-Z]/` |
| `digit` | A number | `/\d/` |
| `symbol` | A symbol | `/[^A-Za-z0-9]/` |

Because scoring is just "how many rules passed, as a fraction of the total", the four-bucket mapping works for **any** rule count. Two custom rules or ten — the bar still fills proportionally, and "all rules met" always lands on Strong. To change the policy you replace the whole array via the `rules` prop; you never edit the component.

The bucket maths deliberately guarantees that *any* met rule lights at least one segment (`max(1, …)`), so the bar never looks broken while the user is mid-word, and that a full pass reaches exactly four (`min(4, …)`).

---

## Security Notes

A strength meter is UX, not a security control — the real enforcement must live on the server. A few things this component is careful about:

- **It never announces the password.** The only `aria-live` region is a short status line ("Password strength: Good"). The secret is never placed in live-announced text, so a screen-reader user in a shared space does not have their password read aloud.
- **State is conveyed in text, not colour alone.** Each checklist row carries a visually-hidden "— met" / "— not met" string; the tick/cross SVGs are `aria-hidden`. Colour-blind and screen-reader users get the same information.
- **It does no storage, no network, no logging.** The value flows in, a score flows out. Nothing is persisted.
- **Meter ≠ policy.** Passing all client-side rules must still be re-validated server-side. Treat the green bar as encouragement, not authorisation. For high-value accounts, consider pairing this with a breached-password check on the backend (e.g. a k-anonymity range query against a compromised-credential list).

---

## State Flow Diagram

```
        value (string)  ────────────┐
        rules (PasswordRule[]) ──────┤
                                     ▼
                        ┌─────────────────────────┐
                        │  results = rules.map(    │
                        │    r => r.test(value) )   │
                        └───────────┬─────────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │  passedCount             │
                        └───────────┬─────────────┘
                                    │
                 empty / 0 passed   │   ≥1 passed
             ┌──────────────────────┴───────────────────┐
             ▼                                           ▼
     filledSegments = 0                    filledSegments = clamp(1..4)
             │                                           │
             └──────────────────┬────────────────────────┘
                                ▼
              levelIndex → 'Weak' | 'Fair' | 'Good' | 'Strong'
                                │
             ┌──────────────────┼──────────────────┐
             ▼                  ▼                   ▼
        segmented bar     aria-live label     rule checklist
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The password to score. A plain (non-bindable) prop — the meter is read-only. |
| `rules` | `PasswordRule[]` | 5 default rules | Override the rule set. Any length; scoring adapts. |
| `showChecklist` | `boolean` | `true` | Show the per-rule pass/fail list. |
| `showLabel` | `boolean` | `true` | Show the Weak/Fair/Good/Strong status line. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

`PasswordRule` is exported from the component:

```ts
interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}
```

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `value` | Zero segments filled, label reads "Weak" (neutral colour, not alarming red). |
| One rule met | At least one segment lights, so the bar never looks dead mid-typing. |
| All rules met | Bar full, label "Strong". |
| Empty `rules` array | No checklist rows; `filledSegments` stays 0 (division guarded). |
| Very long custom rule list | Fraction-based mapping still lands cleanly in the four buckets. |
| `showLabel` and `showChecklist` both false | Renders just the bar — a minimal inline indicator. |
| Reduced motion | Segment colour transition is disabled via `prefers-reduced-motion`. |

---

## Dependencies

- **None.** Zero external packages — inline SVG icons and scoped CSS only.
- Fully self-contained: copy the single `.svelte` file into any Svelte 5 project.

---

## File Structure

```
PasswordStrengthMeter.svelte    # The component (inline Props + PasswordRule interface)
PasswordStrengthMeter.test.ts   # Unit tests
PasswordStrengthMeter.md        # This explainer
```
