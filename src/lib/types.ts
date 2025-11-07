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
 * Props for CardStackMotion components (Spring and Flip variants)
 * Extends CardStackProps with motion-specific configuration options
 *
 * @property springStiffness - Spring stiffness for physics-based animations (default: 300)
 * @property springDamping - Spring damping to control bounce (default: 30)
 * @property dragEnabled - Enable drag-to-cycle functionality (default: true)
 * @property flipDuration - Duration of FLIP animations in seconds (default: 0.5)
 * @property staggerDelay - Delay between card animations in seconds (default: 0.05)
 * @property enable3D - Enable 3D transforms (rotateY, z-depth) (default: true)
 * @property reducedMotion - Respect prefers-reduced-motion (default: true)
 */
export interface CardStackMotionProps extends CardStackProps {
	springStiffness?: number;
	springDamping?: number;
	dragEnabled?: boolean;
	flipDuration?: number;
	staggerDelay?: number;
	enable3D?: boolean;
	reducedMotion?: boolean;
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
