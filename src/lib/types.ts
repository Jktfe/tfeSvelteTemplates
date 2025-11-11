/**
 * Shared TypeScript type definitions for the CardStack template project
 *
 * This file contains all shared types used across components and server-side code
 * to ensure type consistency and prevent duplication.
 */

/**
 * Card data structure for CardStack components
 *
 * @property image - Optional URL to the card's background image
 * @property title - Optional title text displayed at the top of the card
 * @property content - Optional HTML content displayed at the bottom with gradient overlay
 */
export interface Card {
	image?: string;
	title?: string;
	content?: string;
}

/**
 * Database row structure from the cards table
 * Maps to the schema defined in database/schema.sql
 *
 * @property id - Unique identifier (auto-increment)
 * @property title - Card title
 * @property description - Card description/content (can contain HTML)
 * @property image_url - URL to card image
 * @property display_order - Order for displaying cards (lower numbers first)
 * @property created_at - Timestamp when card was created
 */
export interface CardRow {
	id: number;
	title: string;
	description: string;
	image_url: string;
	display_order: number;
	created_at: Date;
}

/**
 * Props for CardStack and CardStackAdvanced components
 *
 * @property cards - Array of card objects to display
 * @property cardWidth - Width of each card in pixels (default: 300)
 * @property cardHeight - Height of each card in pixels (default: 400)
 * @property partialRevealSide - Which side stays hidden on hover - 'left' or 'right' (default: 'right')
 */
export interface CardStackProps {
	cards?: Card[];
	cardWidth?: number;
	cardHeight?: number;
	partialRevealSide?: 'left' | 'right';
}

/**
 * Props for CardStackMotionFlip component
 * 4-directional swipe with 3D roll-off effect (mobile-first, zero dependencies)
 *
 * @property cards - Array of card objects to display
 * @property cardWidth - Width of each card in pixels (default: 300)
 * @property cardHeight - Height of each card in pixels (default: 400)
 * @property cardGap - Gap between stacked cards in pixels (default: 50)
 * @property swipeThreshold - Minimum drag distance in pixels to trigger swipe (default: 80)
 * @property rollDuration - Duration of roll-off animation in milliseconds (default: 400)
 * @property enterDuration - Duration of fade-in animation in milliseconds (default: 200)
 * @property enable3D - Enable 3D rotation effects (default: true)
 */
export interface CardStackMotionFlipProps {
	cards?: Card[];
	cardWidth?: number;
	cardHeight?: number;
	cardGap?: number;
	swipeThreshold?: number;
	rollDuration?: number;
	enterDuration?: number;
	enable3D?: boolean;
}

/**
 * Navigation menu item structure
 *
 * @property label - Display text for the menu item
 * @property href - URL path for the menu item
 * @property icon - Optional icon character or emoji
 * @property active - Whether this item represents the current page
 */
export interface MenuItem {
	label: string;
	href: string;
	icon?: string;
	active?: boolean;
}

/**
 * Props for StaggeredMenu component
 *
 * @property items - Array of menu items to display
 * @property isOpen - Whether the menu is visible (bindable)
 */
export interface StaggeredMenuProps {
	items: MenuItem[];
	isOpen?: boolean;
}

/**
 * Props for ShineBorder component
 *
 * @property color - Border shine colour (default: '#146ef5')
 * @property duration - Animation duration in seconds (default: 3)
 * @property borderWidth - Width of the border in pixels (default: 2)
 * @property borderRadius - Border radius in pixels (default: 8)
 */
export interface ShineBorderProps {
	color?: string;
	duration?: number;
	borderWidth?: number;
	borderRadius?: number;
}

/**
 * Props for Marquee component
 *
 * @template T - Type of items in the marquee array
 * @property items - Array of items to display in the marquee
 * @property speed - Animation speed in pixels per second (default: 50)
 * @property direction - Scroll direction: 'left' or 'right' (default: 'left')
 * @property pauseOnHover - Whether to pause animation on hover (default: true)
 * @property gap - Gap between items in pixels (default: 32)
 */
export interface MarqueeProps<T = unknown> {
	items: T[];
	speed?: number;
	direction?: 'left' | 'right';
	pauseOnHover?: boolean;
	gap?: number;
}

/**
 * Props for MagicCard component
 *
 * @property gradientColor - Spotlight gradient colour (default: '#146ef5')
 * @property gradientOpacity - Spotlight opacity 0-1 (default: 0.3)
 * @property borderColor - Border highlight colour (default: '#146ef5')
 */
export interface MagicCardProps {
	gradientColor?: string;
	gradientOpacity?: number;
	borderColor?: string;
}

/**
 * Props for MarqueeDraggable component
 *
 * @property vertical - Vertical or horizontal orientation (default: false)
 * @property duration - Animation duration in seconds (default: 40)
 * @property reverse - Initial scroll direction reversed (default: false)
 * @property dragEnabled - Enable click-and-drag functionality (default: true)
 * @property dragMomentum - Continue animation in dragged direction after release (default: true)
 * @property class - Additional CSS classes
 * @property children - Content snippet to render
 */
export interface MarqueeDraggableProps {
	vertical?: boolean;
	duration?: number;
	reverse?: boolean;
	dragEnabled?: boolean;
	dragMomentum?: boolean;
	class?: string;
	children?: import('svelte').Snippet;
}

/**
 * Props for SwishButton component
 *
 * @property text - Button text to display (default: 'Button')
 * @property class - Additional CSS classes for customisation
 */
export interface SwishButtonProps {
	text?: string;
	class?: string;
}

/**
 * Props for ExpandingCard component
 *
 * @property imageSrc - URL to the card image (default: placeholder image)
 * @property imageAlt - Alt text for the image (default: 'Card Image')
 * @property heading - Card heading text (default: 'Card Title')
 * @property compactText - Text shown in compact layout (default: 'Hello Devs, welcome to our Website')
 * @property expandedText - Text shown in expanded layout (default: 'Yoo devs, How you doing?')
 * @property bgColor - Tailwind background colour class (default: 'bg-lime-100')
 */
export interface ExpandingCardProps {
	imageSrc?: string;
	imageAlt?: string;
	heading?: string;
	compactText?: string;
	expandedText?: string;
	bgColor?: string;
}

/**
 * Props for LinkImageHover component
 *
 * @property href - URL the link points to (default: 'https://example.com')
 * @property text - Link text to display (default: 'Link Text')
 * @property imageSrc - URL to the preview image (default: placeholder image)
 * @property imageAlt - Alt text for the preview image (default: 'Preview Image')
 * @property imageWidth - Tailwind width/height classes for image (default: 'h-44 w-44')
 * @property target - Link target attribute (default: '_blank')
 */
export interface LinkImageHoverProps {
	href?: string;
	text?: string;
	imageSrc?: string;
	imageAlt?: string;
	imageWidth?: string;
	target?: string;
}

/**
 * Props for Navbar component
 * Framework7-style three-section layout (Left/Center/Right)
 *
 * @property menuItems - Array of menu items for quick navigation (displayed on right)
 * @property currentPageTitle - Title of the current page (displayed in center)
 * @property logoIcon - Logo icon/emoji (default: '⚡')
 * @property logoText - Logo text (default: 'Svelte Templates')
 * @property logoHref - Logo link destination (default: '/')
 */
export interface NavbarProps {
	menuItems: MenuItem[];
	currentPageTitle?: string;
	logoIcon?: string;
	logoText?: string;
	logoHref?: string;
}

// ==================================================
// DATABASE TYPES FOR ADDITIONAL COMPONENTS
// ==================================================

/**
 * Testimonial data structure for Marquee demos
 *
 * @property id - Optional database ID
 * @property name - Person's name
 * @property role - Job title/role
 * @property company - Company name
 * @property quote - Testimonial text
 * @property avatar - Emoji or icon character (default: '👤')
 * @property category - For filtering (e.g., 'static', 'interactive')
 */
export interface Testimonial {
	id?: number;
	name: string;
	role: string;
	company: string;
	quote: string;
	avatar?: string;
	category?: string;
}

/**
 * Database row structure from the testimonials table
 * Maps to the schema defined in database/schema_v2.sql
 */
export interface TestimonialRow {
	id: number;
	name: string;
	role: string;
	company: string;
	quote: string;
	avatar: string;
	category: string;
	display_order: number;
	is_active: boolean;
	created_at: Date;
}

/**
 * Expanding card data structure
 * Extends ExpandingCardProps with database metadata
 */
export interface ExpandingCardData {
	id?: number;
	heading: string;
	compactText: string;
	expandedText: string;
	imageSrc: string;
	imageAlt: string;
	bgColor?: string;
	category?: string;
}

/**
 * Database row structure from the expanding_cards table
 * Maps to the schema defined in database/schema_v2.sql
 */
export interface ExpandingCardRow {
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
}

/**
 * Link preview data for LinkImageHover component
 * Extends LinkImageHoverProps with database metadata
 */
export interface LinkPreview {
	id?: number;
	text: string;
	href: string;
	imageSrc: string;
	imageAlt: string;
	imageWidth?: string;
	target?: string;
	category?: string;
	description?: string;
}

/**
 * Database row structure from the link_previews table
 * Maps to the schema defined in database/schema_v2.sql
 */
export interface LinkPreviewRow {
	id: number;
	text: string;
	href: string;
	image_url: string;
	image_alt: string;
	image_width: string;
	target: string;
	category: string;
	description: string | null;
	display_order: number;
	is_active: boolean;
	created_at: Date;
}

// ==================================================
// EDITOR COMPONENT TYPES (CRUD Demo)
// ==================================================

/**
 * Editor data structure for CRUD demonstrations
 * Uses ExpandingCard format to showcase database integration
 *
 * @property id - Optional database ID (auto-generated for new items)
 * @property heading - Card heading text
 * @property compactText - Text shown in compact layout
 * @property expandedText - Text shown in expanded layout
 * @property imageSrc - URL to the card image
 * @property imageAlt - Alt text for the image
 * @property bgColor - Tailwind background colour class (e.g., 'bg-lime-100')
 * @property category - For filtering/grouping (default: 'editor-demo')
 */
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

/**
 * Database row structure from the editor_data table
 * Maps to the schema defined in database/schema_editor.sql
 */
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

/**
 * Props for Editor component
 *
 * @property mode - Edit mode: 'create' for new items, 'edit' for existing items
 * @property initialData - Initial form data (for edit mode)
 * @property usingDatabase - Whether the app is connected to a database
 * @property onSave - Callback when save button is clicked
 * @property onCancel - Callback when cancel button is clicked
 */
export interface EditorProps {
	mode?: 'create' | 'edit';
	initialData?: Partial<EditorData>;
	usingDatabase?: boolean;
	onSave?: (data: EditorData) => void | Promise<void>;
	onCancel?: () => void;
}

// ==================================================
// FORM FIELD TYPES (Modular Form Components)
// ==================================================

/**
 * Supported field types for form components
 */
export type FieldType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'email'
	| 'url'
	| 'tel'
	| 'password'
	| 'search'
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'color'
	| 'range'
	| 'file'
	| 'checkbox'
	| 'checkbox-group'
	| 'radio'
	| 'select'
	| 'switch';

/**
 * Base props shared by all form field components
 */
export interface BaseFieldProps {
	name: string;
	label: string;
	value?: any;
	placeholder?: string;
	helpText?: string;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	error?: string;
	touched?: boolean;
	onblur?: () => void;
	oninput?: (value: any) => void;
}

/**
 * Option for select, radio, and checkbox group fields
 */
export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

/**
 * Props for TextField component
 */
export interface TextFieldProps extends BaseFieldProps {
	type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
	maxlength?: number;
	pattern?: string;
	autocomplete?: string;
}

/**
 * Props for TextareaField component
 */
export interface TextareaFieldProps extends BaseFieldProps {
	rows?: number;
	maxlength?: number;
	showCharCount?: boolean;
}

/**
 * Props for NumberField component
 */
export interface NumberFieldProps extends BaseFieldProps {
	min?: number;
	max?: number;
	step?: number;
}

/**
 * Props for SelectField component
 */
export interface SelectFieldProps extends BaseFieldProps {
	options: SelectOption[];
}

/**
 * Props for RadioGroup component
 */
export interface RadioGroupProps extends BaseFieldProps {
	options: SelectOption[];
	orientation?: 'horizontal' | 'vertical';
}

/**
 * Props for CheckboxField component (single boolean checkbox)
 */
export interface CheckboxFieldProps extends Omit<BaseFieldProps, 'value'> {
	checked?: boolean;
}

/**
 * Props for CheckboxGroup component (multiple selection)
 */
export interface CheckboxGroupProps extends Omit<BaseFieldProps, 'value'> {
	options: SelectOption[];
	values?: string[];
	orientation?: 'horizontal' | 'vertical';
	minSelected?: number;
	maxSelected?: number;
}

/**
 * Props for RangeField component (slider)
 */
export interface RangeFieldProps extends BaseFieldProps {
	min: number;
	max: number;
	step?: number;
	showValue?: boolean;
	showMinMax?: boolean;
}

/**
 * Props for DateField component
 */
export interface DateFieldProps extends BaseFieldProps {
	min?: string;
	max?: string;
}

/**
 * Props for TimeField component
 */
export interface TimeFieldProps extends BaseFieldProps {
	min?: string;
	max?: string;
}

/**
 * Props for SwitchField component (toggle)
 */
export interface SwitchFieldProps extends Omit<BaseFieldProps, 'value'> {
	checked?: boolean;
	labelPosition?: 'left' | 'right';
}

/**
 * Props for ColorField component
 */
export interface ColorFieldProps extends BaseFieldProps {
	presetColors?: string[];
	showPresets?: boolean;
}

/**
 * Props for FileField component
 */
export interface FileFieldProps extends BaseFieldProps {
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
}

// ==================================================
// DATAGRID COMPONENT TYPES
// ==================================================

/**
 * Employee data structure for DataGrid demonstrations
 * Sample data for showcasing grid features like sorting, filtering, editing
 *
 * @property id - Unique employee identifier
 * @property firstName - Employee's first name
 * @property lastName - Employee's last name
 * @property email - Employee's email address
 * @property department - Department name (e.g., 'Engineering', 'Sales')
 * @property position - Job title/position
 * @property salary - Annual salary in GBP
 * @property hireDate - Date when employee was hired (ISO string format)
 * @property status - Employment status (e.g., 'active', 'on-leave')
 * @property location - Office location/city
 * @property phone - Contact phone number
 * @property notes - Additional notes or comments
 */
export interface Employee {
	id?: number;
	firstName: string;
	lastName: string;
	email: string;
	department: string;
	position: string;
	salary: number;
	hireDate: string;
	status: string;
	location?: string;
	phone?: string;
	notes?: string;
}

/**
 * Database row structure from the employees table
 * Maps to the schema defined in database/schema_datagrid.sql
 */
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

/**
 * Column definition for DataGrid components
 * Defines how each column should be displayed and configured
 *
 * @property id - Unique column identifier (matches data key)
 * @property header - Column header text to display
 * @property width - Optional column width (pixels or auto)
 * @property sortable - Whether this column can be sorted (default: true)
 * @property filterable - Whether this column can be filtered (default: true)
 * @property editable - Whether cells in this column can be edited (default: false)
 * @property type - Data type for proper formatting and editing
 * @property formatter - Optional custom function to format cell values for display
 * @property cellStyle - Optional function to return CSS inline styles for cells (e.g., color gradients)
 * @property cellClass - Optional function to return CSS class names for cells
 * @property cellRenderer - Optional function to return custom HTML for cells (advanced formatting)
 * @property options - Array of allowed values for select/dropdown editor (used when type is 'select')
 */
export interface DataGridColumn {
	id: string;
	header: string;
	width?: number | 'auto';
	sortable?: boolean;
	filterable?: boolean;
	editable?: boolean;
	type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'select';
	formatter?: (value: any, row?: any) => string;
	cellStyle?: (value: any, row?: any) => string;
	cellClass?: (value: any, row?: any) => string;
	cellRenderer?: (value: any, row?: any) => string;
	options?: readonly string[];
}

/**
 * Props for DataGridAdvanced component (SVAR Grid wrapper)
 *
 * @property data - Array of employee records to display
 * @property columns - Optional custom column definitions (auto-generated if not provided)
 * @property editable - Enable inline editing (default: false)
 * @property selectable - Enable row selection (default: false)
 * @property pageSize - Number of rows per page for pagination (default: 20, 0 = no pagination)
 * @property exportable - Show export to CSV button (default: false)
 * @property theme - Theme name: 'willow' (light) or 'willowDark' (default: 'willow')
 */
export interface DataGridAdvancedProps {
	data: Employee[];
	columns?: DataGridColumn[];
	editable?: boolean;
	selectable?: boolean;
	pageSize?: number;
	exportable?: boolean;
	theme?: 'willow' | 'willowDark';
}

/**
 * Props for DataGridBasic component (self-contained)
 *
 * @property data - Array of employee records to display
 * @property columns - Column definitions for the grid
 * @property sortable - Enable column sorting (default: true)
 * @property filterable - Enable global search/filter (default: true)
 * @property pageSize - Number of rows per page (default: 10, 0 = no pagination)
 * @property striped - Alternating row colours (default: true)
 * @property hoverable - Highlight row on hover (default: true)
 * @property compact - Compact row spacing (default: false)
 */
export interface DataGridBasicProps {
	data: Employee[];
	columns: DataGridColumn[];
	sortable?: boolean;
	filterable?: boolean;
	pageSize?: number;
	striped?: boolean;
	hoverable?: boolean;
	compact?: boolean;
}

/**
 * Filter values for DataGrid advanced filtering
 * Used by DataGridFilters component
 *
 * @property departments - Selected department filters
 * @property statuses - Selected status filters
 * @property salaryMin - Minimum salary filter value
 * @property salaryMax - Maximum salary filter value
 * @property hireDateFrom - Hire date range start (ISO date string)
 * @property hireDateTo - Hire date range end (ISO date string)
 */
export interface DataGridFilterValues {
	departments: string[];
	statuses: string[];
	salaryMin: number;
	salaryMax: number;
	hireDateFrom: string;
	hireDateTo: string;
}
