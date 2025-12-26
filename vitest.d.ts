/**
 * ============================================================
 * Vitest Type Declarations
 * ============================================================
 *
 * This file extends Vitest's assertion types with jest-dom matchers.
 * Without this, TypeScript won't recognise methods like:
 *   - toBeInTheDocument()
 *   - toHaveClass()
 *   - toBeVisible()
 *   - etc.
 *
 * The magic here is the triple-slash reference directive which
 * tells TypeScript to include the jest-dom type definitions.
 *
 * ============================================================
 */

/// <reference types="@testing-library/jest-dom" />
