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
	/** Whether Clerk authentication is configured (shows demo badge if false) */
	isClerkConfigured?: boolean;
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
	hireDate: Date; // Changed from string to Date for type consistency with database
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

// ==================================================
// SANKEY DIAGRAM TYPES (Expandable Hierarchical Flow Visualization)
// ==================================================

/**
 * Node in a Sankey diagram
 * Represents a single entity in the flow visualization (e.g., energy source, processing plant, destination)
 *
 * @property id - Unique identifier for the node
 * @property label - Display text shown on the node
 * @property color - Optional hex colour for the node and its outgoing flows (e.g., '#8B4513')
 * @property expandable - Whether this node can be clicked to expand and show children (default: false)
 * @property expanded - Current expansion state (true = showing children, false = collapsed)
 * @property parent - Optional ID of parent node (if this is a child in the hierarchy)
 */
export interface SankeyNode {
	id: string;
	label: string;
	color?: string;
	expandable?: boolean;
	expanded?: boolean;
	parent?: string;
}

/**
 * Link between two nodes in a Sankey diagram
 * Represents flow/connection with a quantifiable value
 *
 * @property source - ID of the source node
 * @property target - ID of the target node
 * @property value - Flow quantity/magnitude (determines link thickness)
 */
export interface SankeyLink {
	source: string;
	target: string;
	value: number;
}

/**
 * Complete Sankey diagram data structure
 * Contains all nodes and links for the visualization
 *
 * @property nodes - Array of all nodes in the diagram
 * @property links - Array of all connections between nodes
 */
export interface SankeyData {
	nodes: SankeyNode[];
	links: SankeyLink[];
}

/**
 * Props for ExpandableSankey component
 * Interactive hierarchical Sankey diagram with expand/collapse functionality
 *
 * @property nodes - Array of all nodes (including hidden children)
 * @property links - Array of all links (including hidden connections)
 * @property height - Container height in pixels (default: 600)
 */
export interface ExpandableSankeyProps {
	nodes: SankeyNode[];
	links: SankeyLink[];
	height?: number;
}

// ==================================================
// SPEEDDIAL COMPONENT TYPES (Floating Action Button Menu)
// ==================================================

/**
 * Action item for SpeedDial menu
 * Represents a single action button that appears when the SpeedDial is opened
 *
 * @property id - Unique identifier for the action
 * @property label - Accessible label for the action (shown as tooltip)
 * @property icon - SVG path data, emoji, or HTML string for the action icon
 * @property onclick - Callback function when action is clicked
 * @property disabled - Whether the action is disabled (default: false)
 * @property class - Additional CSS classes for customisation
 */
export interface SpeedDialAction {
	id: string;
	label: string;
	icon: string;
	onclick?: () => void;
	disabled?: boolean;
	class?: string;
}

/**
 * Direction for linear SpeedDial layouts
 * Determines which direction the action items expand from the main button
 */
export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Layout type for SpeedDial
 * - linear: Items arranged in a straight line (default)
 * - circle: Items arranged in a full circle around the button
 * - semi-circle: Items arranged in a half circle
 * - quarter-circle: Items arranged in a quarter circle (corner positioning)
 */
export type SpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';

/**
 * Props for SpeedDial component
 * Floating action button with expandable action menu
 *
 * @property actions - Array of action items to display when opened
 * @property direction - Direction for linear layouts: 'up' | 'down' | 'left' | 'right' (default: 'up')
 * @property type - Layout type: 'linear' | 'circle' | 'semi-circle' | 'quarter-circle' (default: 'linear')
 * @property radius - Distance from center for circular layouts in pixels (default: 80)
 * @property transitionDelay - Delay between each item animation in ms (default: 30)
 * @property showTooltip - Show tooltip labels on hover (default: true)
 * @property tooltipPosition - Position of tooltips relative to items (default: 'auto')
 * @property mask - Show modal backdrop when open (default: false)
 * @property disabled - Disable the SpeedDial (default: false)
 * @property buttonIcon - Custom icon for main button (default: '+' icon)
 * @property buttonLabel - Accessible label for main button (default: 'Open menu')
 * @property class - Additional CSS classes for the container
 * @property isOpen - Bindable state for open/closed (default: false)
 */
export interface SpeedDialProps {
	actions: SpeedDialAction[];
	direction?: SpeedDialDirection;
	type?: SpeedDialType;
	radius?: number;
	transitionDelay?: number;
	showTooltip?: boolean;
	tooltipPosition?: 'left' | 'right' | 'top' | 'bottom' | 'auto';
	mask?: boolean;
	disabled?: boolean;
	buttonIcon?: string;
	buttonLabel?: string;
	class?: string;
	isOpen?: boolean;
}

// ==================================================
// AUTHENTICATION TYPES (Clerk Integration)
// ==================================================

/**
 * Props for AuthStatus component
 * Displays authentication configuration status
 *
 * @property isConfigured - Whether Clerk authentication is configured
 * @property class - Additional CSS classes for styling
 */
export interface AuthStatusProps {
	isConfigured: boolean;
	class?: string;
}

// ==================================================
// FOLDERFILES COMPONENT TYPES (Hierarchical Document Viewer)
// ==================================================

/**
 * Folder data structure
 * Represents a tab-based folder containing files in the FolderFiles component
 *
 * @property id - Unique folder identifier
 * @property label - Display name for the folder tab (e.g., 'Lexical Interruptions')
 * @property color - Tailwind background colour class for folder tab (e.g., 'bg-blue-500')
 * @property textColor - Tailwind text colour class (e.g., 'text-white')
 * @property icon - Optional emoji or icon character for folder tab
 * @property description - Optional description shown in tooltip on hover
 * @property category - Optional category for filtering/grouping
 */
export interface Folder {
	id: number;
	label: string;
	color: string;
	textColor?: string;
	icon?: string;
	description?: string;
	category?: string;
}

/**
 * Database row structure from the folders table
 * Maps to the schema defined in database/schema_folderfiles.sql
 */
export interface FolderRow {
	id: number;
	label: string;
	color: string;
	text_color: string;
	icon: string | null;
	description: string | null;
	category: string;
	display_order: number;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * File data structure
 * Represents a document file within a folder
 *
 * @property id - Unique file identifier
 * @property folderId - ID of parent folder
 * @property title - File title/name
 * @property subtitle - Optional subtitle or description
 * @property previewText - Short preview text shown in hover tooltip
 * @property content - Full document content (HTML string for single page)
 * @property pages - Array of page content (HTML strings for multi-page documents)
 * @property thumbnailUrl - Optional thumbnail image URL
 * @property metadata - Additional metadata (author, date, tags, etc.)
 * @property fileType - Type of file ('document', 'image', 'pdf', 'text')
 */
export interface FileItem {
	id: number;
	folderId: number;
	title: string;
	subtitle?: string;
	previewText: string;
	content?: string;
	pages?: string[];
	thumbnailUrl?: string;
	metadata?: FileMetadata;
	fileType?: 'document' | 'image' | 'pdf' | 'text';
}

/**
 * Database row structure from the files table
 * Maps to the schema defined in database/schema_folderfiles.sql
 */
export interface FileItemRow {
	id: number;
	folder_id: number;
	title: string;
	subtitle: string | null;
	preview_text: string;
	content: string | null;
	pages: string | null;
	thumbnail_url: string | null;
	metadata: string | null;
	file_type: string;
	display_order: number;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * File metadata structure
 * Additional information about a file
 *
 * @property author - Document author
 * @property date - Creation or modification date
 * @property tags - Array of tags for categorisation
 * @property pageCount - Number of pages in document
 * @property wordCount - Approximate word count
 * @property fileNumber - Optional file reference number (e.g., 'File 003')
 */
export interface FileMetadata {
	author?: string;
	date?: string;
	tags?: string[];
	pageCount?: number;
	wordCount?: number;
	fileNumber?: string;
}

/**
 * Complete folder with its files
 * Used for hierarchical data structure
 *
 * @property folder - Folder information
 * @property files - Array of files within this folder
 */
export interface FolderWithFiles {
	folder: Folder;
	files: FileItem[];
}

/**
 * Props for FolderFiles component
 * Hierarchical folder/file viewer with document display capabilities
 *
 * @property folders - Array of all folders
 * @property files - Array of all files (will be grouped by folderId)
 * @property initialFolderId - Optional folder to open on mount
 * @property viewMode - Document viewer mode: 'single' or 'spread' (bindable)
 * @property showMetadata - Whether to show file metadata in viewer (bindable)
 * @property enable3DEffect - Enable 3D folder opening animation (default: false)
 */
export interface FolderFilesProps {
	folders: Folder[];
	files: FileItem[];
	initialFolderId?: number;
	viewMode?: 'single' | 'spread';
	showMetadata?: boolean;
	enable3DEffect?: boolean;
}

// ==================================================
// MAPPING COMPONENT TYPES
// ==================================================

/**
 * Geographic coordinates for map positioning
 *
 * @property lat - Latitude in decimal degrees (-90 to 90)
 * @property lng - Longitude in decimal degrees (-180 to 180)
 */
export interface LatLng {
	lat: number;
	lng: number;
}

/**
 * Additional metadata for map markers
 * Extensible structure for location-specific information
 */
export interface MapMarkerMetadata {
	address?: string;
	phone?: string;
	website?: string;
	hours?: string;
	rating?: number;
	tags?: string[];
}

/**
 * Map marker data structure
 * Represents a single point on the map with associated information
 *
 * @property id - Unique identifier for the marker
 * @property position - Geographic coordinates (lat/lng)
 * @property title - Display title for the marker (shown in popup header)
 * @property description - Optional detailed description (shown in popup body)
 * @property category - Optional category for filtering/styling (e.g., 'restaurant', 'hotel')
 * @property iconType - Optional icon type for custom marker styling
 * @property imageUrl - Optional image URL for popup display
 * @property metadata - Optional additional data (phone, website, hours, etc.)
 */
export interface MapMarker {
	id: number;
	position: LatLng;
	title: string;
	description?: string;
	category?: string;
	iconType?: 'default' | 'pin' | 'circle' | 'custom';
	imageUrl?: string;
	metadata?: MapMarkerMetadata;
}

/**
 * Database row structure from the map_markers table
 * Maps to the schema defined in database/schema_maps.sql
 */
export interface MapMarkerRow {
	id: number;
	latitude: number;
	longitude: number;
	title: string;
	description: string | null;
	category: string;
	icon_type: string;
	image_url: string | null;
	metadata: string | null; // JSON string
	display_order: number;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
}

/**
 * Search result from geocoding service (Nominatim)
 * Used by MapSearch component for location suggestions
 */
export interface GeoSearchResult {
	displayName: string;
	position: LatLng;
	boundingBox?: [number, number, number, number]; // [south, north, west, east]
	type?: string; // Place type (city, road, building, etc.)
	importance?: number; // Relevance score from Nominatim
}

/**
 * Configuration for map view state
 * Used to set initial view and track current view
 */
export interface MapViewState {
	center: LatLng;
	zoom: number;
}

/**
 * Props for MapBasic component
 * Simple interactive map with zoom/pan controls
 *
 * @property center - Initial map center coordinates
 * @property zoom - Initial zoom level (1-18, default: 13)
 * @property height - Map container height in pixels (default: 400)
 * @property enableScrollZoom - Allow mouse wheel zoom (default: true)
 * @property showZoomControl - Show +/- zoom buttons (default: true)
 * @property showAttribution - Show OpenStreetMap attribution (default: true)
 * @property class - Additional CSS classes for container
 */
export interface MapBasicProps {
	center?: LatLng;
	zoom?: number;
	height?: number;
	enableScrollZoom?: boolean;
	showZoomControl?: boolean;
	showAttribution?: boolean;
	class?: string;
}

/**
 * Props for MapSearch component
 * Map with location search functionality
 *
 * @property center - Initial map center coordinates
 * @property zoom - Initial zoom level (default: 13)
 * @property height - Map container height in pixels (default: 400)
 * @property placeholder - Search input placeholder text
 * @property debounceMs - Debounce time for search input (default: 300)
 * @property maxResults - Maximum search results to show (default: 5)
 * @property onLocationSelect - Callback when user selects a location
 */
export interface MapSearchProps {
	center?: LatLng;
	zoom?: number;
	height?: number;
	placeholder?: string;
	debounceMs?: number;
	maxResults?: number;
	onLocationSelect?: (result: GeoSearchResult) => void;
}

/**
 * Props for MapMarkers component
 * Map displaying markers from database with popups
 *
 * @property markers - Array of marker data to display
 * @property center - Initial map center (auto-calculated from markers if not provided)
 * @property zoom - Initial zoom level (auto-calculated if not provided)
 * @property height - Map container height in pixels (default: 500)
 * @property enableClustering - Group nearby markers into clusters (default: false)
 * @property showCategories - Show category filter UI (default: true)
 * @property onMarkerClick - Callback when marker is clicked
 */
export interface MapMarkersProps {
	markers: MapMarker[];
	center?: LatLng;
	zoom?: number;
	height?: number;
	enableClustering?: boolean;
	showCategories?: boolean;
	onMarkerClick?: (marker: MapMarker) => void;
}

/**
 * Props for MapLive component
 * Map with real-time marker additions
 *
 * @property markers - Array of marker data (bindable for external updates)
 * @property center - Initial map center
 * @property zoom - Initial zoom level (default: 13)
 * @property height - Map container height in pixels (default: 500)
 * @property enableAddMode - Allow clicking map to add markers (default: true)
 * @property animateNewMarkers - Animate markers when added (default: true)
 * @property maxMarkers - Maximum markers allowed (0 = unlimited, default: 0)
 * @property onMarkerAdd - Callback when marker is added
 * @property onMarkerRemove - Callback when marker is removed
 */
export interface MapLiveProps {
	markers?: MapMarker[];
	center?: LatLng;
	zoom?: number;
	height?: number;
	enableAddMode?: boolean;
	animateNewMarkers?: boolean;
	maxMarkers?: number;
	onMarkerAdd?: (marker: MapMarker) => void;
	onMarkerRemove?: (marker: MapMarker) => void;
}

// ==================================================
// ANIMATED BEAM COMPONENT TYPES
// ==================================================

/**
 * AnimatedBeam Component Types
 * For visualizing connections and data flows with animated beams
 */

/**
 * Beam node data structure
 * Represents a circular node that beams connect to/from
 *
 * @property id - Unique node identifier
 * @property x - X position in pixels
 * @property y - Y position in pixels
 * @property label - Optional display label for the node
 */
export interface BeamNode {
	id: string;
	x: number;
	y: number;
	label?: string;
}

/**
 * Beam connection data structure
 * Defines a connection between two nodes
 *
 * @property from - Source node ID
 * @property to - Target node ID
 * @property bidirectional - Whether beam flows both ways (overrides global setting)
 */
export interface BeamConnection {
	from: string;
	to: string;
	bidirectional?: boolean;
}

/**
 * Props for AnimatedBeam component
 * SVG-based animated beams connecting nodes
 *
 * @property width - Container width in pixels (default: 600)
 * @property height - Container height in pixels (default: 400)
 * @property nodes - Array of node objects with positions and labels
 * @property beamColor - Color of the animated beams (default: '#3b82f6')
 * @property beamWidth - Width of beam lines in pixels (default: 2)
 * @property beamSpeed - Animation duration in seconds (default: 2)
 * @property bidirectional - Enable bi-directional flow animation (default: false)
 * @property gradient - Use gradient instead of dashed line (default: false)
 * @property nodeSize - Radius of node circles in pixels (default: 12)
 * @property nodeColor - Fill color for node circles (default: '#3b82f6')
 * @property connections - Array defining which nodes connect to which
 */
export interface AnimatedBeamProps {
	width?: number;
	height?: number;
	nodes?: BeamNode[];
	beamColor?: string;
	beamWidth?: number;
	beamSpeed?: number;
	bidirectional?: boolean;
	gradient?: boolean;
	nodeSize?: number;
	nodeColor?: string;
	connections?: BeamConnection[];
}

// =============================================================================
// SCRATCH TO REVEAL COMPONENT TYPES
// =============================================================================

/**
 * Props for ScratchToReveal component
 * Interactive scratch-off component revealing hidden content
 *
 * @property scratchColor - Scratch surface color (default: '#999999')
 * @property scratchImage - Optional texture image URL for scratch surface
 * @property scratchText - Overlay text on scratch surface (e.g., "Scratch Here!")
 * @property scratchTextColor - Color of overlay text (default: '#ffffff')
 * @property scratchTextSize - Font size of overlay text (default: '24px')
 * @property revealThreshold - Percentage scratched to trigger auto-reveal (default: 70)
 * @property autoReveal - Automatically reveal when threshold reached (default: true)
 * @property brushSize - Size of scratch brush in pixels (default: 40)
 * @property brushShape - Shape of scratch brush: 'circle' or 'square' (default: 'circle')
 * @property width - Canvas width in pixels or 'auto' to match content (default: 'auto')
 * @property height - Canvas height in pixels or 'auto' to match content (default: 'auto')
 * @property showProgress - Show progress bar indicator (default: false)
 * @property progressColor - Color of progress bar (default: '#3b82f6')
 * @property allowReset - Show reset button after reveal (default: true)
 * @property resetButtonText - Text for reset button (default: 'Reset')
 * @property skipText - Text for skip button (default: 'Skip')
 * @property onReveal - Callback fired when content is fully revealed
 * @property onProgress - Callback fired with scratch percentage (0-100)
 * @property disabled - Disable scratching interaction (default: false)
 * @property class - Additional CSS classes for container
 * @property children - Svelte 5 snippet for revealed content
 */
export interface ScratchToRevealProps {
	scratchColor?: string;
	scratchImage?: string;
	scratchText?: string;
	scratchTextColor?: string;
	scratchTextSize?: string;
	revealThreshold?: number;
	autoReveal?: boolean;
	brushSize?: number;
	brushShape?: 'circle' | 'square';
	width?: number | 'auto';
	height?: number | 'auto';
	showProgress?: boolean;
	progressColor?: string;
	allowReset?: boolean;
	resetButtonText?: string;
	skipText?: string;
	onReveal?: () => void;
	onProgress?: (percentage: number) => void;
	disabled?: boolean;
	class?: string;
	children?: import('svelte').Snippet;
}

// =============================================================================
// BEFORE/AFTER COMPONENT TYPES
// =============================================================================

/**
 * Props for BeforeAfter component
 * Interactive before/after comparison with draggable divider
 *
 * @property beforeImage - URL for before image
 * @property afterImage - URL for after image
 * @property beforeAlt - Alt text for before image (default: 'Before')
 * @property afterAlt - Alt text for after image (default: 'After')
 * @property beforeLabel - Optional label shown on before side
 * @property afterLabel - Optional label shown on after side
 * @property aspectRatio - CSS aspect ratio (default: '16/9')
 * @property width - Container width (default: '100%')
 * @property initialPosition - Initial divider position 0-100 (default: 50)
 * @property disabled - Disable dragging (default: false)
 * @property dividerColor - Divider line color (default: '#ffffff')
 * @property dividerWidth - Divider line width in px (default: 2)
 * @property handleSize - Handle circle size in px (default: 48)
 * @property handleColor - Handle background color (default: '#ffffff')
 * @property onChange - Callback fired when divider position changes
 * @property class - Additional CSS classes
 */
export interface BeforeAfterProps {
	beforeImage: string;
	afterImage: string;
	beforeAlt?: string;
	afterAlt?: string;
	beforeLabel?: string;
	afterLabel?: string;
	aspectRatio?: string;
	width?: number | string;
	initialPosition?: number;
	disabled?: boolean;
	dividerColor?: string;
	dividerWidth?: number;
	handleSize?: number;
	handleColor?: string;
	onChange?: (position: number) => void;
	class?: string;
}

// =============================================================================
// BUBBLE PACKING TYPES
// =============================================================================

/**
 * Bubble data item for BubblePacking component
 * Represents a single bubble with value determining size
 *
 * @property id - Unique identifier for the bubble
 * @property label - Display text for the bubble
 * @property value - Numeric value determining bubble size
 * @property color - Optional hex colour for the bubble fill
 * @property group - Optional group name for categorisation/colouring
 */
export interface BubbleItem {
	id: string;
	label: string;
	value: number;
	color?: string;
	group?: string;
}

/**
 * Props for BubblePacking component
 * Interactive circle packing visualization with force simulation
 *
 * @property data - Array of bubble items to display
 * @property width - Container width in pixels (default: 600)
 * @property height - Container height in pixels (default: 600)
 * @property padding - Padding between circles in pixels (default: 3)
 * @property colorScheme - Array of hex colours for group colouring (default: Tableau10 palette)
 * @property showLabels - Show text labels on bubbles (default: true)
 * @property labelThreshold - Minimum radius to show labels (default: 20)
 * @property useForce - Use force simulation for smooth animation (default: true)
 * @property onBubbleClick - Callback when a bubble is clicked
 * @property onBubbleHover - Callback when a bubble is hovered
 * @property tooltipFormatter - Custom tooltip formatter function
 * @property class - Additional CSS classes
 */
export interface BubblePackingProps {
	data: BubbleItem[];
	width?: number;
	height?: number;
	padding?: number;
	colorScheme?: string[];
	showLabels?: boolean;
	labelThreshold?: number;
	useForce?: boolean;
	onBubbleClick?: (bubble: BubbleItem) => void;
	onBubbleHover?: (bubble: BubbleItem | null) => void;
	tooltipFormatter?: (bubble: BubbleItem) => string;
	class?: string;
}

// =============================================================================
// CALENDAR HEATMAP TYPES
// =============================================================================

/**
 * Calendar heatmap data point
 * Represents activity for a single day
 *
 * @property date - ISO date string (YYYY-MM-DD)
 * @property value - Activity intensity/count (0 = no activity)
 */
export interface CalendarDataPoint {
	date: string;
	value: number;
}

/**
 * Props for CalendarHeatmap component
 * GitHub-style contribution calendar with interactive features
 *
 * @property data - Array of date/value pairs for each day
 * @property startDate - First date to display (default: 365 days ago)
 * @property endDate - Last date to display (default: today)
 * @property colorLow - Colour for lowest values (default: '#ebedf0' GitHub light gray)
 * @property colorHigh - Colour for highest values (default: '#216e39' GitHub dark green)
 * @property cellSize - Size of each calendar cell in pixels (default: 12)
 * @property cellGap - Gap between cells in pixels (default: 3)
 * @property showWeekLabels - Show weekday labels (Mon/Wed/Fri) on left (default: true)
 * @property showMonthLabels - Show month labels at top (default: true)
 * @property showLegend - Show colour legend below calendar (default: true)
 * @property levels - Number of discrete colour levels (default: 5)
 * @property tooltipFormatter - Custom tooltip formatter function
 * @property onCellClick - Callback when a cell is clicked
 * @property class - Additional CSS classes
 */
export interface CalendarHeatmapProps {
	data: CalendarDataPoint[];
	startDate?: Date;
	endDate?: Date;
	colorLow?: string;
	colorHigh?: string;
	cellSize?: number;
	cellGap?: number;
	showWeekLabels?: boolean;
	showMonthLabels?: boolean;
	showLegend?: boolean;
	levels?: number;
	tooltipFormatter?: (date: string, value: number) => string;
	onCellClick?: (date: string, value: number) => void;
	class?: string;
}

