/**
 * Form Field Utilities
 *
 * Shared utilities for form field components to reduce code duplication
 * and ensure consistent patterns across all form fields.
 *
 * @module formUtils
 */

/**
 * Generated IDs for form field accessibility associations
 */
export interface FormFieldIds {
	/** ID for the field itself */
	fieldId: string;
	/** ID for help text element (aria-describedby) */
	helpId: string;
	/** ID for error message element (aria-errormessage) */
	errorId: string;
}

/**
 * Generate consistent IDs for form field ARIA associations
 *
 * Used for:
 * - label[for] -> input[id]
 * - input[aria-describedby] -> helpText[id]
 * - input[aria-errormessage] -> error[id]
 *
 * Pass a per-instance value (typically `$props.id()`), never the field's
 * `name`: two forms on one page often share names like `email`, and deriving
 * ids from the name would give both the same ids and cross-wire their labels.
 *
 * @param uid - Unique per-instance base, e.g. the result of `$props.id()`
 * @returns Object containing fieldId, helpId, and errorId
 *
 * @example
 * ```typescript
 * const { fieldId, helpId, errorId } = generateFieldIds($props.id());
 * // e.g. { fieldId: 'field-s1', helpId: 'field-s1-help', errorId: 'field-s1-error' }
 * ```
 */
export function generateFieldIds(uid: string): FormFieldIds {
	const fieldId = `field-${uid}`;
	return {
		fieldId,
		helpId: `${fieldId}-help`,
		errorId: `${fieldId}-error`
	};
}

/**
 * Determine if a field should show its error state
 *
 * Errors are only shown after the field has been "touched" (interacted with)
 * to avoid showing errors before the user has attempted to fill in the field.
 *
 * @param touched - Whether the field has been interacted with
 * @param error - Current error message (empty string if no error)
 * @returns true if error should be displayed
 *
 * @example
 * ```typescript
 * const showError = shouldShowError(touched, error);
 * // Only true if touched === true AND error is non-empty
 * ```
 */
export function shouldShowError(touched: boolean, error: string): boolean {
	return touched && !!error;
}

/**
 * Build aria-describedby attribute value from available IDs
 *
 * Creates a space-separated list of IDs for elements that describe the field.
 * Returns undefined if no describing elements are present.
 *
 * @param helpId - ID of help text element (include if helpText exists)
 * @param hasHelp - Whether help text is present
 * @returns Space-separated ID string or undefined
 *
 * @example
 * ```typescript
 * const describedBy = buildAriaDescribedBy('email-help', !!helpText);
 * // Returns 'email-help' if helpText exists, undefined otherwise
 * ```
 */
export function buildAriaDescribedBy(helpId: string, hasHelp: boolean): string | undefined {
	return hasHelp ? helpId : undefined;
}

/**
 * Build aria-errormessage attribute value
 *
 * Only returns the error ID if the error is currently visible
 * (field is touched and has an error).
 *
 * @param errorId - ID of error message element
 * @param hasVisibleError - Whether error should be displayed
 * @returns Error element ID or undefined
 */
export function buildAriaErrorMessage(errorId: string, hasVisibleError: boolean): string | undefined {
	return hasVisibleError ? errorId : undefined;
}
