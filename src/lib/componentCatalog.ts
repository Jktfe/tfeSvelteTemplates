import type { MenuCategory } from './types';
import { getDocsHtmlForPath } from './componentDocs';

export interface ComponentCatalogItem {
	name: string;
	href: string;
	icon: string;
	description: string;
	screenshot: string;
	themeSupport: 'light' | 'dual';
	source: string;
	docs: string;
	demo: string;
	dependencies: string[];
	relatedFiles: string[];
	usage: string;
	agentHint?: string;
}

export interface ComponentCatalogCategory {
	name: string;
	icon: string;
	summary: string;
	components: ComponentCatalogItem[];
}

export interface ComponentCatalogEntry {
	category: ComponentCatalogCategory;
	item: ComponentCatalogItem;
}

interface ComponentCatalogOptions {
	screenshotFile?: string;
	source?: string;
	docs?: string;
	demo?: string;
	themeSupport?: ComponentCatalogItem['themeSupport'];
	dependencies?: string[];
	relatedFiles?: string[];
	usage?: string;
	agentHint?: string;
}

const screenshot = (fileName: string) => `/ComponentScreenshots/${fileName}`;
const componentFileName = (name: string) => name.replaceAll(' ', '');
const componentIdentifier = (name: string) =>
	name
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.trim()
		.split(/\s+/)
		.map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
		.join('') || 'ComponentTemplate';

const component = (
	name: string,
	href: string,
	icon: string,
	description: string,
	screenshotOrOptions: string | ComponentCatalogOptions = `${componentFileName(name)}Shot.png`,
	options: ComponentCatalogOptions = {}
): ComponentCatalogItem => {
	const resolvedOptions =
		typeof screenshotOrOptions === 'string'
			? { ...options, screenshotFile: screenshotOrOptions }
			: screenshotOrOptions;
	const baseName = componentFileName(name);

	return {
		name,
		href,
		icon,
		description,
		screenshot: screenshot(resolvedOptions.screenshotFile ?? `${baseName}Shot.png`),
		themeSupport: resolvedOptions.themeSupport ?? 'light',
		source: resolvedOptions.source ?? `src/lib/components/${baseName}.svelte`,
		docs: resolvedOptions.docs ?? `src/lib/components/${baseName}.md`,
		demo: resolvedOptions.demo ?? `src/routes${href}/+page.svelte`,
		dependencies: resolvedOptions.dependencies ?? [],
		relatedFiles: resolvedOptions.relatedFiles ?? [],
		usage: resolvedOptions.usage ?? `<${componentIdentifier(name)} />`,
		agentHint: resolvedOptions.agentHint
	};
};

export const componentCategories: ComponentCatalogCategory[] = [
	{
		name: 'Navigation & Shell',
		icon: '☰',
		summary: 'Application chrome, orientation, page position, and primary movement.',
		components: [
			component('Navbar', '/navbar', '☰', 'Responsive app navigation with a sliding panel.', {
				screenshotFile: 'NavBarShot.png',
				usage: `<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import type { MenuCategory } from '$lib/types';

  const menuCategories: MenuCategory[] = [
    {
      name: 'Cards',
      icon: '🃏',
      items: [
        { label: 'CardStack', href: '/cardstack', icon: '🃏', active: false },
        { label: 'MagicCard', href: '/magiccard', icon: '✨', active: false }
      ]
    },
    {
      name: 'Navigation',
      icon: '☰',
      items: [{ label: 'Navbar', href: '/navbar', icon: '☰', active: true }]
    }
  ];
</script>

<Navbar {menuCategories} logoText="Svelte Templates" logoHref="/" />`
			}),
			component('SpeedDial', '/speeddial', '⚡', 'Floating action trigger with radial shortcuts.', {
				usage: `<script lang="ts">
  import SpeedDial from '$lib/components/SpeedDial.svelte';
  import type { SpeedDialAction } from '$lib/types';

  const actions: SpeedDialAction[] = [
    { id: 'add', label: 'Add', icon: '➕', onclick: () => console.log('add') },
    { id: 'edit', label: 'Edit', icon: '✏️', onclick: () => console.log('edit') },
    { id: 'delete', label: 'Delete', icon: '🗑️', onclick: () => console.log('delete') }
  ];
</script>

<SpeedDial {actions} type="circle" direction="up" radius={90} />`
			}),
			component('FloatingDock', '/floatingdock', '🧲', 'Dock-style navigation with proximity magnification.', {
				usage: `<script lang="ts">
  import FloatingDock from '$lib/components/FloatingDock.svelte';
  import type { FloatingDockItem } from '$lib/types';

  const items: FloatingDockItem[] = [
    { id: 1, title: 'Home', icon: '🏠', href: '/' },
    { id: 2, title: 'Search', icon: '🔍', href: '/search' },
    { id: 3, title: 'Settings', icon: '⚙️', href: '/settings' }
  ];
</script>

<FloatingDock {items} magnification={2} distance={140} />`
			}),
			component('LiquidTabBar', '/liquidtabbar', '💧', 'Gooey active-tab motion for compact navigation.', {
				usage: `<script lang="ts">
  import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specs' },
    { id: 'reviews', label: 'Reviews' }
  ];
  let activeTab = $state(tabs[0].id);
</script>

<LiquidTabBar {tabs} bind:activeTab />

<section>
  {#if activeTab === 'overview'}<p>Overview content…</p>{/if}
  {#if activeTab === 'specs'}<p>Specs content…</p>{/if}
  {#if activeTab === 'reviews'}<p>Reviews content…</p>{/if}
</section>`
			}),
			component('Drawer', '/drawer', '📥', 'Slide-in modal panel from any edge.', {
				usage: `<script lang="ts">
  import Drawer from '$lib/components/Drawer.svelte';

  let open = $state(false);
</script>

<button type="button" onclick={() => (open = true)}>Open filters</button>

<Drawer bind:open position="right" size="380px" ariaLabel="Filters">
  <h2>Filters</h2>
  <p>Drawer content. Press Escape or click outside to close.</p>
</Drawer>`
			}),
			component('Breadcrumbs', '/breadcrumbs', '🍞', 'Hierarchical path navigation with smart truncation.', {
				usage: `<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { Crumb } from '$lib/types';

  const items: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Navigation', href: '/components/navigation' },
    { label: 'Breadcrumbs' }
  ];
</script>

<Breadcrumbs {items} separator="/" maxVisible={4} />`
			}),
			component('Pagination', '/pagination', '📑', 'Page-number navigation with ellipsis handling.', {
				usage: `<script lang="ts">
  import Pagination from '$lib/components/Pagination.svelte';

  let page = $state(1);
  const totalPages = 12;
</script>

<Pagination
  bind:page
  {totalPages}
  siblings={1}
  onChange={(p) => console.log('navigate to page', p)}
/>`
			}),
			component('ReadingTOC', '/readingtoc', '📖', 'Auto-tracking document table of contents.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/ReadingTOC.test.ts',
					'src/lib/components/ReadingTOCTestHarness.test.svelte'
				],
				usage: `<script lang="ts">
  import ReadingTOC from '$lib/components/ReadingTOC.svelte';
</script>

<ReadingTOC target="#article" levels={[2, 3]} variant="rail" />

<article id="article">
  <h2>First section</h2>
  <p>…</p>
  <h3>A subsection</h3>
  <p>…</p>
  <h2>Second section</h2>
  <p>…</p>
</article>`,
				agentHint:
					'Use a target selector for rendered articles or pass headings for static data; keep the real anchor links for no-JS navigation.'
			}),
			component('ScrollProgressBar', '/scrollprogressbar', '📜', 'Viewport reading-progress indicator.', {
				usage: `<script lang="ts">
  import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';
</script>

<ScrollProgressBar
  target="window"
  variant="thin"
  position="top"
  color="#6366f1"
/>`
			})
		]
	},
	{
		name: 'Controls & Input',
		icon: '🎛️',
		summary: 'Form fields, selectors, menus, and compact interaction controls.',
		components: [
			component('Forms', '/forms', '📝', 'Reusable Svelte form field suite.', {
				source: 'src/lib/components/forms/FormField.svelte',
				docs: 'src/lib/components/forms/Forms.md',
				relatedFiles: [
					'src/lib/components/forms/TextField.svelte',
					'src/lib/components/forms/SelectField.svelte',
					'src/lib/components/forms/CheckboxField.svelte',
					'src/lib/components/forms/RadioGroup.svelte',
					'src/lib/components/forms/RangeField.svelte'
				],
				usage: '<TextField label="Email" bind:value={email} />',
				agentHint: 'Copy the field components you need, or copy the whole forms folder for the full suite.'
			}),
			component('PinInput', '/pininput', '🔢', 'Segmented OTP and verification-code entry.', {
				usage: `<script lang="ts">
  import PinInput from '$lib/components/PinInput.svelte';
  let code = $state('');
</script>

<PinInput bind:value={code} length={6} onComplete={(v) => console.log('done', v)} />`
			}),
			component('UploadDropzone', '/uploaddropzone', '📤', 'Drag, paste, and validate file uploads.', {
				usage: `<script lang="ts">
  import UploadDropzone from '$lib/components/UploadDropzone.svelte';
</script>

<UploadDropzone
  accept="image/*,.pdf"
  maxFiles={5}
  maxSize={5 * 1024 * 1024}
  onFilesAdded={(items) => console.log('accepted', items)}
/>`
			}),
			component('Switch', '/switch', '🔘', 'Accessible boolean toggle with three sizes.', {
				usage: `<script lang="ts">
  import Switch from '$lib/components/Switch.svelte';
  let notifications = $state(true);
</script>

<Switch bind:checked={notifications} label="Email notifications" />`
			}),
			component('Slider', '/slider', '🎚', 'Styled range input with value formatting.', {
				themeSupport: 'dual',
				relatedFiles: [],
				usage: '<Slider bind:value={volume} label="Volume" min={0} max={100} />',
				agentHint: 'Native input[type=range] under the hood — keyboard a11y is free (arrows/Home/End/PageUp/PageDown). Three sizes (sm/md/lg), three variants (default/success/danger). Dual-mode via six CSS vars (--slider-track-bg / --slider-thumb-bg / --slider-label-fg / --slider-bubble-bg / --slider-bubble-fg / --slider-focus-ring) that flip under prefers-color-scheme: dark; --fill-color stays variant-driven.'
			}),
			component('SegmentedControl', '/segmentedcontrol', '🎛️', 'Joined picker for mutually exclusive options.', {
				usage: `<script lang="ts">
  import SegmentedControl from '$lib/components/SegmentedControl.svelte';
  let view = $state('list');
  const options = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
    { value: 'cards', label: 'Cards' }
  ];
</script>

<SegmentedControl {options} bind:value={view} ariaLabel="View mode" />`
			}),
			component('FilterChips', '/filterchips', '🎚️', 'Toggleable chips for search and filtering.'),
			component('RatingStars', '/ratingstars', '⭐', 'Keyboard-friendly star rating control.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/RatingStars.test.ts'],
				usage: `<script lang="ts">
  import RatingStars from '$lib/components/RatingStars.svelte';
  let rating = $state(3);
</script>

<RatingStars value={rating} onChange={(v) => (rating = v)} />`,
				agentHint: 'Real input[type=radio] elements under the hood — keyboard a11y is free (Left/Right + Space/Enter). Supports half-stars in readonly mode via fractional values. Dual-mode via three CSS vars: --rating-star-filled (brand gold, deliberately stays un-flipped on both schemes), --rating-star-empty (chrome, flips dark), --rating-focus-ring (chrome, flips dark). Legacy filledColor / emptyColor props still accepted as inline-style overrides.'
			}),
			component('Stepper', '/stepper', '🪜', 'Multi-step progress and completion control.', {
				usage: `<script lang="ts">
  import Stepper from '$lib/components/Stepper.svelte';
  let step = $state(1);
  const steps = ['Cart', 'Shipping', 'Payment', 'Review'];
</script>

<Stepper {steps} currentStep={step} clickable onSelect={(i) => (step = i)} />`
			}),
			component('Accordion', '/accordion', '🪗', 'Collapsible content sections with smooth motion.', {
				usage: `<script lang="ts">
  import Accordion from '$lib/components/Accordion.svelte';
  const faqs = [
    { id: 'shipping', title: 'How long does shipping take?', content: '3–5 business days within the UK.' },
    { id: 'returns', title: 'What is your returns policy?', content: '30 days, full refund.' }
  ];
</script>

<Accordion items={faqs} />`
			}),
			component('Tabs', '/tabs', '🗂', 'ARIA-correct tabbed content switcher.', {
				usage: `<script lang="ts">
  import Tabs from '$lib/components/Tabs.svelte';
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specs' },
    { id: 'reviews', label: 'Reviews' }
  ];
  let active = $state('overview');
</script>

<Tabs {tabs} bind:active>
  {#snippet panel(id)}
    {#if id === 'overview'}<p>Overview content</p>
    {:else if id === 'specs'}<p>Specs content</p>
    {:else}<p>Reviews content</p>{/if}
  {/snippet}
</Tabs>`
			}),
			component('CommandPalette', '/commandpalette', '🔎', 'Spotlight-style fuzzy command launcher.', {
				usage: `<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  const items = [
    { id: 'new', label: 'New File', group: 'File', shortcut: '⌘N' },
    { id: 'open', label: 'Open File', group: 'File', shortcut: '⌘O' },
    { id: 'settings', label: 'Settings', group: 'App', keywords: ['preferences', 'config'] }
  ];
</script>

<CommandPalette {items} />`
			}),
			component('ContextMenu', '/contextmenu', '🖱️', 'Right-click and keyboard context menu.', {
				usage: `<script lang="ts">
  import ContextMenu from '$lib/components/ContextMenu.svelte';
  const items = [
    { id: 'edit', label: 'Edit', shortcut: '⌘E' },
    { id: 'copy', label: 'Copy', shortcut: '⌘C' },
    { type: 'divider' as const },
    { id: 'delete', label: 'Delete', danger: true, shortcut: '⌫' }
  ];
</script>

<ContextMenu {items} onSelect={(id) => console.log('selected', id)}>
  <div>Right-click me</div>
</ContextMenu>`
			}),
			component(
				'HoldToConfirm',
				'/holdtoconfirm',
				'⏳',
				'Press-and-hold confirmation for risky actions.',
				{
					relatedFiles: [
						'src/lib/components/HoldToConfirm.test.ts',
						'src/lib/components/HoldToConfirmTestHarness.test.svelte'
					],
					usage:
						'<HoldToConfirm variant="bar" duration={2000} label="Hold to send" onConfirm={sendIrrevocably} />',
					agentHint:
						'Keep pointer and keyboard parity together; the reduced-motion path intentionally becomes a single explicit press.'
				}
			),
			component('CopyButton', '/copybutton', '📋', 'Clipboard button with copied-state feedback.', {
				usage: `<script lang="ts">
  import CopyButton from '$lib/components/CopyButton.svelte';
</script>

<CopyButton value="hello world" onCopy={(v) => console.log('copied', v)} />`
			}),
			component('KbdShortcut', '/kbdshortcut', '🎹', 'Platform-aware keyboard shortcut display.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/KbdShortcut.test.ts'],
				usage: `<script lang="ts">
  import KbdShortcut from '$lib/components/KbdShortcut.svelte';
</script>

<KbdShortcut keys={['Cmd', 'K']} />
<KbdShortcut keys={['G', 'S']} separator=" → " />`,
				agentHint: 'Native <kbd> element under the hood — semantic for keyboard input, free a11y. Auto-detects Mac vs Windows for Cmd→⌘/Win, Ctrl→⌃/Ctrl glyph swap (override with `mac` prop). Default aria-label spells keys ("Cmd plus K") so SR says words, not glyphs. Dual-mode via seven CSS vars (--kbd-fg / --kbd-bg-top / --kbd-bg-bottom / --kbd-border / --kbd-shadow-inner / --kbd-shadow-drop / --kbd-sep-color) that flip together under prefers-color-scheme: dark — no brand variants on a kbd cap so the whole set flips (Pattern #67 does not split here). Zero deps, pure CSS bevel.'
			}),
			component('Tooltip', '/tooltip', '💬', 'Accessible hover and focus tooltip.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/Tooltip.test.ts'],
				usage: `<script lang="ts">
  import Tooltip from '$lib/components/Tooltip.svelte';
</script>

<Tooltip text="Helpful hint" placement="top" showDelay={300}>
  <button>Hover me</button>
</Tooltip>`,
				agentHint:
					'Wrap any focusable trigger; pass plain text or a `tip` snippet for rich content. Dark-aware via three CSS custom properties (--tooltip-fg / --tooltip-bg / --tooltip-shadow) that flip under prefers-color-scheme: dark.'
			})
		]
	},
	{
		name: 'Feedback & Identity',
		icon: '🔔',
		summary: 'Status, loading, profile, and empty-state primitives.',
		components: [
			component('ToastNotification', '/toastnotification', '🔔', 'Stackable global alerts with actions.', {
				usage: `<script lang="ts">
  import ToastNotification from '$lib/components/ToastNotification.svelte';
  import { addToast } from '$lib/toast.svelte';
</script>

<ToastNotification position="top-right" />
<button onclick={() => addToast({ message: 'Saved!', severity: 'success' })}>Save</button>`
			}),
			component('AlertBanner', '/alertbanner', '🚨', 'Inline status banner for common tones.', {
				usage: `<script lang="ts">
  import AlertBanner from '$lib/components/AlertBanner.svelte';
  let shown = $state(true);
</script>

{#if shown}
  <AlertBanner
    variant="success"
    title="Saved"
    message="Your changes are live."
    dismissable
    onDismiss={() => (shown = false)}
  />
{/if}`
			}),
			component('EmptyState', '/emptystate', '📭', 'Reusable nothing-here-yet placeholder.', {
				usage: `<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte';
</script>

<EmptyState title="No orders yet">
  {#snippet icon()}📦{/snippet}
  {#snippet description()}Place your first order to see it here.{/snippet}
  {#snippet action()}<button>Browse catalogue</button>{/snippet}
</EmptyState>`
			}),
			component('SkeletonLoader', '/skeletonloader', '💀', 'Placeholder primitives for loading content.', {
				usage: `<script lang="ts">
  import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';
</script>

<div aria-busy="true">
  <SkeletonLoader shape="circle" width="48px" height="48px" />
  <SkeletonLoader width="60%" />
  <SkeletonLoader shape="rect" height="160px" />
</div>`
			}),
			component('ProgressRing', '/progressring', '⭕', 'Circular determinate and indeterminate progress.', {
				usage: `<script lang="ts">
  import ProgressRing from '$lib/components/ProgressRing.svelte';
</script>

<ProgressRing value={75} ariaLabel="Upload progress">
  {#snippet label()}<strong>75%</strong>{/snippet}
</ProgressRing>`
			}),
			component('ProgressBar', '/progressbar', '📊', 'Linear progress indicator with labels and variants.', {
				usage: `<script lang="ts">
  import ProgressBar from '$lib/components/ProgressBar.svelte';
</script>

<ProgressBar value={42} max={100} showValue="above" ariaLabel="Upload" />`
			}),
			component('Spinner', '/spinner', '🌀', 'Indeterminate loading indicator in multiple styles.', {
				usage: `<script lang="ts">
  import Spinner from '$lib/components/Spinner.svelte';
</script>

<button class="text-blue-600" disabled>
  <Spinner size="sm" /> Submitting...
</button>`
			}),
			component('BadgePill', '/badgepill', '🏷️', 'Status pills, tags, and dismissible chips.', {
				usage: `<script lang="ts">
  import BadgePill from '$lib/components/BadgePill.svelte';
</script>

<BadgePill label="Active" tone="success" dot />
<BadgePill label="Frontend" tone="info" dismissible />`
			}),
			component('Avatar', '/avatar', '🙂', 'User image with initials and status fallback.', {
				usage: `<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte';
</script>

<Avatar src="/users/ada.jpg" name="Ada Lovelace" size="md" status="online" />
<Avatar name="Grace Hopper" size="lg" />`
			}),
			component('AvatarStack', '/avatarstack', '👥', 'Overlapping avatars with overflow handling.', {
				usage: `<script lang="ts">
  import AvatarStack from '$lib/components/AvatarStack.svelte';

  const team = [
    { name: 'Ada Lovelace', src: '/img/ada.jpg' },
    { name: 'Grace Hopper' },
    { name: 'Margaret Hamilton' },
    { name: 'Katherine Johnson' },
    { name: 'Hedy Lamarr' }
  ];
</script>

<AvatarStack people={team} max={3} size={36} />`
			}),
			component('StatCard', '/statcard', '📈', 'KPI card with trend-aware sentiment.', {
				usage: `<script lang="ts">
  import StatCard from '$lib/components/StatCard.svelte';
</script>

<StatCard title="Revenue" value="£12,450" delta={8.2} deltaSuffix="%" deltaLabel="vs last week" />
<StatCard title="Page load" value="1.4s" delta={-12} deltaSuffix="%" positiveDirection="down" />`
			})
		]
	},
	{
		name: 'Text, Time & Content Motion',
		icon: '⌨️',
		summary: 'Animated copy, counters, time displays, and content rhythm.',
		components: [
			component('Typewriter', '/typewriter', '⌨️', 'Cycling typewriter text with a cursor.', {
				usage: `<script lang="ts">
  import Typewriter from '$lib/components/Typewriter.svelte';
</script>

<Typewriter phrases={['Hello', 'World', 'Welcome']} typeSpeed={80} pauseDuration={2000} />`
			}),
			component('ShinyText', '/shinytext', '✨', 'Configurable shimmer sweep for text.', {
				usage: `<script lang="ts">
  import ShinyText from '$lib/components/ShinyText.svelte';
</script>

<ShinyText text="Premium" baseColor="#475569" shineColor="#fbbf24" duration={2.5} />`
			}),
			component('ScrambledText', '/scrambledtext', '🔀', 'Glyph shuffle that resolves into readable copy.', {
				usage: `<script lang="ts">
  import ScrambledText from '$lib/components/ScrambledText.svelte';
</script>

<ScrambledText text="DECODED" duration={1500} order="random" replayOnHover />`
			}),
			component('TrueFocus', '/truefocus', '🔦', 'Word-by-word phrase focus with a moving frame.', {
				usage: `<script lang="ts">
  import TrueFocus from '$lib/components/TrueFocus.svelte';
</script>

<TrueFocus text="Build something extraordinary" cycleDuration={1800} pauseOnHover />`
			}),
			component('VariableProximity', '/variableproximity', '🅰️', 'Cursor-reactive variable-font typography.', {
				usage: `<script lang="ts">
  import VariableProximity from '$lib/components/VariableProximity.svelte';
</script>

<VariableProximity text="Drift the focus close" radius={140} falloffCurve="gaussian" />`
			}),
			component('GlitchText', '/glitchtext', '📼', 'RGB channel split and clip-band text glitch.', {
				usage: `<script lang="ts">
  import GlitchText from '$lib/components/GlitchText.svelte';
</script>

<GlitchText text="ERROR" intensity="wild" trigger="hover" />`
			}),
			component('SplitFlap', '/splitflap', '🪧', 'Mechanical board character flip animation.', {
				usage: `<script lang="ts">
  import SplitFlap from '$lib/components/SplitFlap.svelte';
  let value = $state('LONDON');
</script>

<SplitFlap {value} charset="alnum" stagger={60} flipDuration={320} size="lg" />`
			}),
			component('TickerTape', '/tickertape', '📈', 'Structured infinite-scroll information strip.', {
				usage: `<script lang="ts">
  import TickerTape from '$lib/components/TickerTape.svelte';
  const items = [
    { label: 'AAPL', value: 192.34, delta: 1.23 },
    { label: 'GOOG', value: 148.07, delta: -0.45 }
  ];
</script>

<TickerTape {items} variant="finance" speed={60} pauseOnHover />`
			}),
			component('Marquee', '/marquee', '🎭', 'Infinite scrolling content rail with pause-on-hover.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/MarqueeDraggable.svelte',
					'src/lib/server/testimonials.ts',
					'src/routes/marquee/+page.server.ts'
				],
				usage: `<script lang="ts">
  import Marquee from '$lib/components/Marquee.svelte';
</script>

<Marquee duration={30} pauseOnHover>
  {#snippet children()}
    <img src="/logo1.svg" alt="Partner 1" />
    <img src="/logo2.svg" alt="Partner 2" />
  {/snippet}
</Marquee>`,
				agentHint:
					'The demo route uses loadTestimonialsWithSource for database-backed static and interactive testimonial rails.'
			}),
			component('CodeBlock', '/codeblock', '💻', 'Token-coloured code display with copy support.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/tokenize.ts',
					'src/lib/components/CodeBlock.test.ts',
					'src/lib/components/CodeBlockTestHarness.test.svelte'
				],
				usage: `<script lang="ts">
  import CodeBlock from '$lib/components/CodeBlock.svelte';
  const code = 'function add(a: number, b: number) { return a + b; }';
</script>

<CodeBlock {code} language="ts" variant="lined" theme="dark" />`,
				agentHint:
					'Copy src/lib/tokenize.ts with the component; it is the local tokenizer that replaces a heavyweight highlighter dependency.'
			}),
			component('Countdown', '/countdown', '⏱️', 'Animated timer for deadlines and launches.', {
				usage: `<script lang="ts">
  import Countdown from '$lib/components/Countdown.svelte';
</script>

<Countdown
  targetDate="2026-12-31T23:59:59"
  units={['days', 'hours', 'minutes', 'seconds']}
  format="cards"
  onComplete={() => console.log('done')}
/>`
			}),
			component('CountUp', '/countup', '💯', 'Locale-aware number animation primitive.', {
				usage: `<script lang="ts">
  import CountUp from '$lib/components/CountUp.svelte';
</script>

<CountUp end={2300000} prefix="£" duration={1800} easing="quart" trigger="viewport" />`
			}),
			component('Timeline', '/timeline', '📅', 'Animated timeline for milestones and events.', {
				usage: `<script lang="ts">
  import Timeline from '$lib/components/Timeline.svelte';
  const events = [
    { id: 1, date: '2024-01-15', title: 'Founded', completed: true },
    { id: 2, date: '2024-06-01', title: 'Series A', completed: true },
    { id: 3, date: '2025-12-31', title: 'Launch', completed: false }
  ];
</script>

<Timeline {events} orientation="vertical" alignment="alternate" animation="slide" showProgress />`
			})
		]
	},
	{
		name: 'Cards & Layout',
		icon: '🃏',
		summary: 'Composed surfaces, showcases, and reusable content layouts.',
		components: [
			component('CardStack', '/cardstack', '🃏', 'Interactive horizontal card stack.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/server/cards.ts',
					'src/routes/cardstack/+page.server.ts',
					'src/lib/scrollLock.ts',
					'src/lib/types.ts'
				],
				usage: `<script lang="ts">
  import CardStack from '$lib/components/CardStack.svelte';
  import type { Card } from '$lib/types';

  const cards: Card[] = [
    { image: 'https://picsum.photos/seed/a/600/800', title: 'Boreal',  content: 'Northern light, clipped pines.' },
    { image: 'https://picsum.photos/seed/b/600/800', title: 'Atrium',  content: 'A glass-roofed inner court.' },
    { image: 'https://picsum.photos/seed/c/600/800', title: 'Moraine', content: 'Glacial debris in slow motion.' }
  ];
</script>

<CardStack {cards} cardWidth={300} cardHeight={400} partialRevealSide="right" />`,
				agentHint:
					'Use loadCardsWithSource on demo routes so the card data reports database/fallback provenance.'
			}),
			component(
				'CardStackMotionFlip',
				'/cardstackmotionflip',
				'🎴',
				'4-direction rolling deck with scoped keyboard control.',
				{
					screenshotFile: 'CardStackMotionFlipShot.svg',
					themeSupport: 'dual',
					relatedFiles: ['src/lib/scrollLock.ts', 'src/lib/types.ts'],
					usage:
						'<CardStackMotionFlip cards={cards} cardWidth={280} cardHeight={380} cardGap={38} />',
					agentHint:
						'Keyboard arrows are intentionally scoped to focus inside the deck; do not attach global arrow handlers.'
				}
			),
			component('BentoGrid', '/bentogrid', '🍱', 'Responsive grid system for modern layouts.', {
				usage: `<script lang="ts">
  import BentoGrid from '$lib/components/BentoGrid.svelte';
  import type { BentoItem } from '$lib/types';

  const items: BentoItem[] = [
    { id: 1, title: 'Headline', description: 'Hero tile', icon: '⭐', colSpan: 2, rowSpan: 2 },
    { id: 2, title: 'Stat',     icon: '📊' },
    { id: 3, title: 'Activity', icon: '⚡' },
    { id: 4, title: 'Inbox',    icon: '✉️' }
  ];
</script>

<BentoGrid {items} cols={3} gap={16} />`
			}),
			component('Divider', '/divider', '➖', 'Section separator with optional label and orientation.', {
				usage: `<script lang="ts">
  import Divider from '$lib/components/Divider.svelte';
</script>

<Divider />
<Divider label="OR" />
<Divider thickness="thick" lineStyle="dashed" colour="#146ef5" />`
			}),
			component('ExpandingCard', '/expandingcard', '🎴', 'Card that smoothly expands into detail.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/server/expandingCards.ts',
					'src/routes/expandingcard/+page.server.ts',
					'src/lib/components/ExpandingCard.test.ts'
				],
				usage: `<script lang="ts">
  import ExpandingCard from '$lib/components/ExpandingCard.svelte';
</script>

<ExpandingCard
  imageSrc="https://picsum.photos/seed/expand/400/400"
  imageAlt="Abstract waveform"
  heading="Field notes"
  compactText="Click to read more."
  expandedText="A longer paragraph that morphs into view as the card unfolds."
  bgColor="bg-lime-100"
/>`,
				agentHint:
					'crossfade does not auto-disable for reduced motion; database bgColor values need matching Tailwind classes in source or safelist.'
			}),
			component('ScratchToReveal', '/scratchtoreveal', '🎰', 'Canvas scratch-off reveal interaction.', {
				usage: `<script lang="ts">
  import ScratchToReveal from '$lib/components/ScratchToReveal.svelte';
  let revealed = $state(false);
</script>

<ScratchToReveal
  scratchColor="#9ca3af"
  scratchText="SCRATCH HERE!"
  brushSize={40}
  width={320}
  height={200}
  onReveal={() => (revealed = true)}
>
  <div class="grid h-full place-items-center bg-amber-100 text-2xl font-bold">
    🎉 You won £100!
  </div>
</ScratchToReveal>`
			}),
			component('StreamShowcase', '/streamshowcase', '📺', 'Editorial carousel for streaming-style shelves.', {
				source: 'src/lib/components/StreamShowcase/StreamShowcase.svelte',
				relatedFiles: [
					'src/lib/components/StreamShowcase/StreamShowcaseHero.svelte',
					'src/lib/components/StreamShowcase/StreamShowcaseCarousel.svelte',
					'src/lib/components/StreamShowcase/playlists.ts',
					'src/lib/components/StreamShowcase/types.ts'
				],
				usage: `<script lang="ts">
  import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
  let active = $state(5);
</script>

<StreamShowcase
  bind:active
  eyebrow="Now browsing"
  topLine="Queue up."
  bottomLine="Level up."
  theme="dark"
/>`,}),
			component('Cardwall', '/cardwall', '🎴', 'Perspective billboard wall with drifting cards.', {
				source: 'src/lib/components/Cardwall/Cardwall.svelte',
				relatedFiles: [
					'src/lib/components/Cardwall/CardwallTile.svelte',
					'src/lib/components/Cardwall/types.ts'
				],
				usage: `<script lang="ts">
  import Cardwall from '$lib/components/Cardwall/Cardwall.svelte';
</script>

<Cardwall density="default" tilesPerRow={8} />`,}),
			component(
				'InteractiveCards',
				'/interactivecards',
				'🖼️',
				'Scroll-driven paintings portfolio with fan, conveyor, and detail-view phases.',
				{
					screenshotFile: 'InteractiveCardsShot.svg',
					themeSupport: 'dual',
					source: 'src/lib/components/InteractiveCards.svelte',
					relatedFiles: [
						'src/lib/components/interactiveCards/geometry.ts',
						'src/lib/components/interactiveCards/InteractiveCardItem.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsDetail.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsRoomPreview.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsAwards.svelte',
						'src/lib/constants.ts'
					],
					usage: '<InteractiveCards projects={projects} testimonials={testimonials} />',
					agentHint:
						'Use this for editorial or product storytelling where scroll position drives a multi-phase card choreography.'
				}
			),
			component('MagicCard', '/magiccard', '✨', 'Card spotlight driven by pointer position.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/utils.ts', 'src/lib/components/MagicCard.test.ts'],
				usage: `<script lang="ts">
  import MagicCard from '$lib/components/MagicCard.svelte';
</script>

<MagicCard gradientColor="#146ef5" gradientOpacity={0.18} gradientSize={220}>
  <div class="p-8">
    <h3 class="text-xl font-bold">Spotlight card</h3>
    <p class="mt-2 text-slate-600">Move your cursor across the card to chase the glow.</p>
  </div>
</MagicCard>`,
				agentHint:
					'This is a pointer spotlight wrapper; keep the wrapped content fully readable without hover or pointer movement.'
			}),
			component('MorphingDialog', '/morphingdialog', '🪄', 'Shared-element transition dialog.', {
				usage: `<script lang="ts">
  import MorphingDialog from '$lib/components/MorphingDialog.svelte';
  let open = $state(false);
</script>

<MorphingDialog bind:open dialogWidth="520px" borderRadius="16px">
  {#snippet trigger(props)}
    <button class="rounded-xl bg-slate-900 px-5 py-3 text-white" {...props}>
      Open details
    </button>
  {/snippet}

  <h2 class="text-2xl font-semibold">Project brief</h2>
  <p class="mt-3 text-slate-600">
    The dialog grew out of the button you just clicked.
  </p>
</MorphingDialog>`
			})
		]
	},
	{
		name: 'Motion Primitives',
		icon: '🎬',
		summary: 'Composable motion wrappers and pointer-driven effects.',
		components: [
			component('ShineBorder', '/shineborder', '💫', 'Animated border with sweeping shine.', {
				usage: `<script lang="ts">
  import ShineBorder from '$lib/components/ShineBorder.svelte';
</script>

<ShineBorder color="#146ef5" duration={3} borderWidth={2} borderRadius={12}>
  <div class="card">Featured content</div>
</ShineBorder>`
			}),
			component('SwishButton', '/swishbutton', '🎯', 'Button text slide and accent motion.', {
				usage: `<script lang="ts">
  import SwishButton from '$lib/components/SwishButton.svelte';
  let count = $state(0);
</script>

<SwishButton text="Get started" onclick={() => count++} />`
			}),
			component('MagneticButton', '/magneticbutton', '🧲', 'Button that drifts toward the cursor.', {
				usage: `<script lang="ts">
  import MagneticButton from '$lib/components/MagneticButton.svelte';
</script>

<MagneticButton strength={0.4} radius={120}>
  <button type="button" onclick={() => alert('hi')}>Hover me</button>
</MagneticButton>`
			}),
			component('ClickSpark', '/clickspark', '💥', 'Click-triggered particle burst wrapper.', {
				usage: `<script lang="ts">
  import ClickSpark from '$lib/components/ClickSpark.svelte';
</script>

<ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
  <button class="cta">Try the demo</button>
</ClickSpark>`
			}),
			component('LinkImageHover', '/linkimagehover', '🔗', 'Links with floating image preview on hover.', {
				usage: `<script lang="ts">
  import LinkImageHover from '$lib/components/LinkImageHover.svelte';
</script>

<LinkImageHover
  href="https://en.wikipedia.org/wiki/Mumbai"
  text="Mumbai"
  imageSrc="https://example.com/mumbai.jpg"
  imageAlt="Mumbai skyline"
  imageWidth="h-44 w-44"
/>`
			}),
			component('AnimatedBeam', '/animatedbeam', '⚡', 'SVG beams for connected-flow diagrams.', {
				usage: `<script lang="ts">
  import AnimatedBeam from '$lib/components/AnimatedBeam.svelte';
</script>

<AnimatedBeam
  nodes={[
    { id: 'src', x: 100, y: 200, label: 'Source' },
    { id: 'tgt', x: 500, y: 200, label: 'Target' }
  ]}
  connections={[{ from: 'src', to: 'tgt' }]}
  bidirectional
/>`
			}),
			component('ScrollReveal', '/scrollreveal', '🎬', 'Viewport-entry stagger reveal primitive.', {
				usage: `<script lang="ts">
  import ScrollReveal from '$lib/components/ScrollReveal.svelte';
</script>

<ScrollReveal direction="up" stagger={120} duration={650}>
  {#snippet children()}
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
  {/snippet}
</ScrollReveal>`
			}),
			component('OrbitalRing', '/orbitalring', '🛸', 'Circular orbital layout with auto-rotation.', {
				usage: `<script lang="ts">
  import OrbitalRing from '$lib/components/OrbitalRing.svelte';
  const planets = [{ id: 1, label: '🌍' }, { id: 2, label: '🪐' }, { id: 3, label: '⭐' }];
</script>

<OrbitalRing items={planets} radius={140} spinDurationMs={18000}>
  {#snippet center()}<div class="sun">☀️</div>{/snippet}
  {#snippet item(p)}<div class="planet">{p.label}</div>{/snippet}
</OrbitalRing>`
			}),
			component('MagnetGrid', '/magnetgrid', '🧲', 'Grid cells displaced by cursor proximity.', {
				usage: `<script lang="ts">
  import MagnetGrid from '$lib/components/MagnetGrid.svelte';
</script>

<MagnetGrid cols={12} rows={8} radius={160} strength={28} policy="attract" />`
			}),
			component('PixelTrail', '/pixeltrail', '🌠', 'Cursor-tracked decaying pixel trail.', {
				usage: `<script lang="ts">
  import PixelTrail from '$lib/components/PixelTrail.svelte';
</script>

<PixelTrail size="medium" palette="cyber-cyan" trailLength={24}>
  <section class="hero">Hero content</section>
</PixelTrail>`
			}),
			component('RippleGrid', '/ripplegrid', '〰️', 'Event-driven ripple waves across a grid.', {
				usage: `<script lang="ts">
  import RippleGrid from '$lib/components/RippleGrid.svelte';
</script>

<RippleGrid
  cols={20}
  rows={12}
  cellSize={24}
  colour="#6366f1"
  distanceMode="euclidean"
  onRipple={(e) => console.log('ripple at', e.row, e.col)}
/>`
			}),
			component(
				'GSAP Suite',
				'/gsap-suite',
				'🎞️',
				'Reusable GSAP primitives for Svelte sequencing, text, canvas, deck, and grid motion.',
				{
					screenshotFile: 'GsapSuiteShot.svg',
					themeSupport: 'dual',
					source: 'src/lib/components/GsapSplitTextHero.svelte',
					docs: 'src/lib/components/GsapSplitTextHero.md',
					dependencies: ['gsap'],
					relatedFiles: [
						'src/lib/components/GsapRevealSequence.svelte',
						'src/lib/components/GsapFlipGrid.svelte',
						'src/lib/components/KineticCanvasField.svelte',
						'src/lib/components/FanDeckCarousel.svelte',
						'src/lib/components/VariableShockText.svelte',
						'src/lib/gsapMotion.ts'
					],
					usage: '<GsapSplitTextHero title="Launch faster" />',
					agentHint: 'Use the route as the suite demo and copy only the GSAP primitive your target UI needs.'
				}
			),
			component('EqualizerBars', '/equalizerbars', '🎵', 'CSS equalizer indicator with phased bars.', {
				usage: `<script lang="ts">
  import EqualizerBars from '$lib/components/EqualizerBars.svelte';
</script>

<EqualizerBars bars={16} variant="spectrum" speed={1.5} color="#38bdf8" height={64} />`
			}),
			component('ConfettiBurst', '/confettiburst', '🎉', 'Imperative canvas celebration burst.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/ConfettiBurst.test.ts',
					'src/lib/components/ConfettiBurstTestHarness.test.svelte'
				],
				usage: `<script lang="ts">
  import ConfettiBurst from '$lib/components/ConfettiBurst.svelte';
  let burst: { fire: () => void };
</script>

<ConfettiBurst bind:this={burst} count={120} spread={90} />
<button onclick={() => burst.fire()}>Celebrate</button>`,
				agentHint:
					'This is decorative canvas; pair it with a toast, banner, or aria-live success message owned by the calling UI.'
			}),
			component('Tilt3D', '/tilt3d', '📐', 'Cursor-driven 3D rotation wrapper.', {
				usage: `<script lang="ts">
  import Tilt3D from '$lib/components/Tilt3D.svelte';
</script>

<Tilt3D maxTilt={12} glare glareIntensity={0.35} reset="spring">
  <article class="card">Stripe-style depth.</article>
</Tilt3D>`
			}),
			component('Pendulum', '/pendulum', '🪀', 'Damped swing wrapper with imperative control.', {
				usage: `<script lang="ts">
  import Pendulum from '$lib/components/Pendulum.svelte';
</script>

<Pendulum trigger="viewport" amplitude={20} frequency={1.1} decay={1.4}>
  <div class="badge">🛎️</div>
</Pendulum>`
			})
		]
	},
	{
		name: 'Ambient Surfaces',
		icon: '🌌',
		summary: 'Full-bleed backgrounds, display shells, and atmospheric visual systems.',
		components: [
			component('AuroraBackdrop', '/aurora-backdrop', '🌌', 'Layered pure-CSS aurora surface.', {
				usage: `<script lang="ts">
  import AuroraBackdrop from '$lib/components/AuroraBackdrop.svelte';
</script>

<AuroraBackdrop palette="classic" speed={0.6} />`
			}),
			component('MeshGradient', '/meshgradient', '🎨', 'Animated mesh-gradient backdrop.', {
				usage: `<script lang="ts">
  import MeshGradient from '$lib/components/MeshGradient.svelte';
</script>

<MeshGradient colours={['#a78bfa', '#22d3ee', '#f472b6']} animate />`
			}),
			component('MembraneHero', '/membrane-hero', '🌊', 'Fluid-mesh editorial hero surface.', {
				source: 'src/lib/components/MembraneHero/MembraneHero.svelte',
				relatedFiles: [
					'src/lib/components/MembraneHero/MembraneSurface.svelte',
					'src/lib/components/MembraneHero/types.ts'
				],
				usage: `<script lang="ts">
  import MembraneHero from '$lib/components/MembraneHero/MembraneHero.svelte';
</script>

<MembraneHero palette="aurora" headline="Build something beautiful" />`,}),
			component('PerspectiveGrid', '/perspectivegrid', '🛣️', 'CSS 3D perspective grid backdrop.', {
				usage: `<script lang="ts">
  import PerspectiveGrid from '$lib/components/PerspectiveGrid.svelte';
</script>

<PerspectiveGrid speed={0.5} colour="#22d3ee" />`
			}),
			component('NoiseField', '/noisefield', '🌫️', 'Ambient grain, film-noise, and TV-static overlay.', {
				usage: `<script lang="ts">
  import NoiseField from '$lib/components/NoiseField.svelte';
</script>

<NoiseField intensity={0.4} fps={24} />`
			}),
			component('NeonSign', '/neonsign', '💡', 'Glowing neon-tube text treatment.', {
				usage: `<script lang="ts">
  import NeonSign from '$lib/components/NeonSign.svelte';
</script>

<NeonSign text="OPEN" colour="#ec4899" flicker />`
			}),
			component('CRTScreen', '/crtscreen', '🖥️', 'Retro screen frame with scanlines and roll.', {
				usage: `<script lang="ts">
  import CRTScreen from '$lib/components/CRTScreen.svelte';
</script>

<CRTScreen scanlines vignette>
  <h1>SYSTEM ONLINE</h1>
</CRTScreen>`
			}),
			component('HoloCard', '/holocard', '🪩', 'Holographic foil shimmer wrapper.', {
				usage: `<script lang="ts">
  import HoloCard from '$lib/components/HoloCard.svelte';
</script>

<HoloCard width={320} height={440}>
  <h3>Holographic</h3>
</HoloCard>`
			}),
			component('ElectricBorder', '/electricborder', '⚡', 'SVG-filter electric border effect.', {
				usage: `<script lang="ts">
  import ElectricBorder from '$lib/components/ElectricBorder.svelte';
</script>

<ElectricBorder colour="#22d3ee" speed={1}>
  <div class="card">Electrified</div>
</ElectricBorder>`
			}),
			component(
				'TopologyColorGrid',
				'/topologycolorgrid',
				'🧬',
				'Three.js and GSAP colour topology scene with hover extrusion.',
				{
					screenshotFile: 'TopologyColorGridShot.svg',
					themeSupport: 'dual',
					dependencies: ['three', 'gsap'],
					agentHint: 'Mount this client-side; the component owns its Three.js renderer and GSAP cleanup.'
				}
			)
		]
	},
	{
		name: 'Data & Visualisation',
		icon: '📊',
		summary: 'Tables, charts, hierarchy, graph, and relationship visualisations.',
		components: [
			component('DataGrid', '/datagrid', '📊', 'Two grid implementations for tabular data.', {
				source: 'src/lib/components/DataGridBasic.svelte',
				docs: 'src/lib/components/DataGrid.md',
				dependencies: ['@svar-ui/svelte-grid'],
				relatedFiles: [
					'src/lib/components/DataGridAdvanced.svelte',
					'src/lib/components/DataGridFilters.svelte',
					'src/lib/components/DataGridAdvanced.md',
					'src/lib/components/DataGridFilters.md'
				],
				usage: `<script lang="ts">
  import DataGridBasic from '$lib/components/DataGridBasic.svelte';
  import type { DataGridColumn } from '$lib/types';

  const columns: DataGridColumn[] = [
    { id: 'id', header: 'ID', width: 60, type: 'number' },
    { id: 'name', header: 'Name', width: 160 },
    { id: 'salary', header: 'Salary', type: 'number',
      formatter: (v) => '£' + v.toLocaleString('en-GB') },
    { id: 'hireDate', header: 'Hire Date', type: 'date' }
  ];
  const data = [
    { id: 1, name: 'Ada Lovelace',  salary: 95000, hireDate: '2020-03-15' },
    { id: 2, name: 'Grace Hopper',  salary: 78000, hireDate: '2021-09-01' }
  ];
</script>

<DataGridBasic {data} {columns} pageSize={10} />`,
				agentHint: 'Use DataGridBasic for copy-paste portability; include DataGridAdvanced only when SVAR Grid is acceptable.'
			}),
			component('CalendarHeatmap', '/calendarheatmap', '📅', 'GitHub-style contribution calendar.', {
				usage: `<script lang="ts">
  import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';
  const data = [
    { date: '2026-01-01', count: 3 },
    { date: '2026-01-02', count: 7 },
    { date: '2026-01-03', count: 12 }
  ];
</script>

<CalendarHeatmap {data} />`
			}),
			component('BubblePacking', '/bubblepacking', '🫧', 'Force-directed circle packing view.', {
				usage: `<script lang="ts">
  import BubblePacking from '$lib/components/BubblePacking.svelte';
  const data = [
    { id: 'a', label: 'Alpha', value: 64 },
    { id: 'b', label: 'Beta', value: 42 },
    { id: 'c', label: 'Gamma', value: 28 }
  ];
</script>

<BubblePacking {data} width={520} height={420} />`
			}),
			component('RadialCluster', '/radialcluster', '🎯', 'Hierarchical radial dendrogram.', {
				usage: `<script lang="ts">
  import RadialCluster from '$lib/components/RadialCluster.svelte';
  const tree = { name: 'Root', children: [{ name: 'A' }, { name: 'B' }] };
</script>

<RadialCluster data={tree} width={520} height={520} />`
			}),
			component('Sunburst', '/sunburst', '☀️', 'Zoomable hierarchical chart.', {
				usage: `<script lang="ts">
  import Sunburst from '$lib/components/Sunburst.svelte';
  const tree = {
    name: 'root',
    children: [
      { name: 'A', value: 60 },
      { name: 'B', value: 40, children: [{ name: 'B1', value: 25 }, { name: 'B2', value: 15 }] }
    ]
  };
</script>

<Sunburst data={tree} width={480} height={480} />`
			}),
			component('WordCloud', '/wordcloud', '☁️', 'Frequency-weighted text cloud.', {
				usage: `<script lang="ts">
  import WordCloud from '$lib/components/WordCloud.svelte';
  const words = [
    { text: 'svelte', value: 30 },
    { text: 'runes', value: 22 },
    { text: 'kit', value: 18 },
    { text: 'fast', value: 14 }
  ];
</script>

<WordCloud {words} width={520} height={320} />`
			}),
			component('Sankey', '/sankey', '🌊', 'Expandable flow visualisation.', {
				themeSupport: 'dual',
				source: 'src/lib/components/ExpandableSankey.svelte',
				docs: 'src/lib/components/Sankey.md',
				dependencies: ['@unovis/svelte', '@unovis/ts'],
				relatedFiles: [
					'src/lib/components/sankeyData.ts',
					'src/lib/server/sankeyData.ts',
					'src/routes/sankey/+page.server.ts',
					'src/lib/types.ts'
				],
				usage: `<script lang="ts">
  import ExpandableSankey from '$lib/components/ExpandableSankey.svelte';
  import { FALLBACK_SANKEY_DATA } from '$lib/constants';
</script>

<ExpandableSankey
  nodes={FALLBACK_SANKEY_DATA.nodes}
  links={FALLBACK_SANKEY_DATA.links}
  height={600}
/>`,
				agentHint:
					'Unovis owns the SVG interaction layer; keyboard node expansion is honestly not implemented yet, so document that limitation if you copy it.'
			}),
			component('ExplainerCanvas', '/explainercanvas', '🎓', 'Connected concept-mapping canvas.', {
				source: 'src/lib/components/ExplainerCanvas/ExplainerCanvas.svelte',
				docs: 'src/lib/components/ExplainerCanvas/ExplainerCanvas.md',
				relatedFiles: [
					'src/lib/components/ExplainerCanvas/Card.svelte',
					'src/lib/components/ExplainerCanvas/CardContent.svelte',
					'src/lib/components/ExplainerCanvas/CanvasViewport.svelte',
					'src/lib/components/ExplainerCanvas/CanvasControls.svelte',
					'src/lib/components/ExplainerCanvas/ConnectionLines.svelte',
					'src/lib/components/ExplainerCanvas/MobileView.svelte',
					'src/lib/components/ExplainerCanvas/SearchPanel.svelte',
					'src/lib/components/ExplainerCanvas/TooltipPortal.svelte',
					'src/lib/components/ExplainerCanvas/utils/geometry.ts',
					'src/lib/components/ExplainerCanvas/utils/loader.ts',
					'src/lib/components/ExplainerCanvas/utils/markdown.ts',
					'src/lib/components/ExplainerCanvas/utils/search.ts',
					'src/lib/components/ExplainerCanvas/ExplainerCanvas.test.ts'
				],
				usage: `<script lang="ts">
  import ExplainerCanvas from '$lib/components/ExplainerCanvas/ExplainerCanvas.svelte';
  const data = {
    cards: [
      { id: 'a', title: 'Concept A', body: 'First idea.', x: 100, y: 100 },
      { id: 'b', title: 'Concept B', body: 'Second idea.', x: 400, y: 200 }
    ],
    connections: [{ from: 'a', to: 'b' }]
  };
</script>

<ExplainerCanvas {data} />`,
				agentHint:
					'Copy the whole ExplainerCanvas folder; the public component depends on its local cards, canvas viewport, controls, mobile view, search panel, tooltip portal, and utility modules.'
			})
		]
	},
	{
		name: 'Media & Portfolio',
		icon: '🖼️',
		summary: 'Image comparison, galleries, and portfolio-grade presentation.',
		components: [
			component('BeforeAfter', '/beforeafter', '↔️', 'Draggable before/after image comparison.', {
				usage: `<script lang="ts">
  import BeforeAfter from '$lib/components/BeforeAfter.svelte';
</script>

<BeforeAfter
  beforeImage="/example/before.jpg"
  afterImage="/example/after.jpg"
  beforeAlt="Before retouching"
  afterAlt="After retouching"
/>`
			}),
			component('DomeGallery', '/domegallery', '🎪', '3D spherical image gallery.', {
				usage: `<script lang="ts">
  import DomeGallery from '$lib/components/DomeGallery.svelte';
  const images = ['/photos/01.jpg', '/photos/02.jpg', '/photos/03.jpg'];
</script>

<div style="height: 70vh;">
  <DomeGallery {images} grayscale segments={35} />
</div>`
			}),
			component('PortfolioPhotographer', '/portfolio-photographer', '📷', 'Editorial photo-portfolio hero.', {
				source: 'src/lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte',
				relatedFiles: [
					'src/lib/components/PortfolioPhotographer/PhotoReelHero.svelte',
					'src/lib/components/PortfolioPhotographer/photos.ts',
					'src/lib/components/PortfolioPhotographer/types.ts'
				],
				usage: `<script lang="ts">
  import PortfolioPhotographer from '$lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte';
  import { SAMPLE_PHOTOS } from '$lib/components/PortfolioPhotographer/photos';
</script>

<PortfolioPhotographer photos={SAMPLE_PHOTOS} name="Aria Lindqvist" theme="dark" />`,})
		]
	},
	{
		name: 'Data-Backed Workflows',
		icon: '✏️',
		summary: 'Examples that benefit from real persistence and public demo data.',
		components: [
			component('Editor', '/editor', '✏️', 'CRUD editor backed by database data when configured.', {
				themeSupport: 'dual',
				source: 'src/lib/components/Editor.svelte',
				docs: 'src/lib/components/Editor.md',
				relatedFiles: [
					'src/lib/server/editorData.ts',
					'src/routes/editor/+page.server.ts',
					'src/routes/editor/api/+server.ts'
				],
				usage: `<script lang="ts">
  import Editor from '$lib/components/Editor.svelte';
  import type { EditorData } from '$lib/types';

  let open = $state(false);
  let editingItem = $state<EditorData | null>(null);

  async function handleSave(data: EditorData) {
    await fetch('/editor/api', {
      method: editingItem ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    open = false;
  }
</script>

<button onclick={() => (open = true)}>New item</button>

{#if open}
  <Editor
    mode={editingItem ? 'edit' : 'create'}
    initialData={editingItem ?? {}}
    usingDatabase={true}
    onSave={handleSave}
    onCancel={() => (open = false)}
  />
{/if}`,
				agentHint:
					'Pair the component with editorData server helpers and API routes; create/update/delete require DATABASE_URL.'
			}),
			component('FolderFiles', '/folderfiles', '🗂️', '3D filing cabinet with database-ready folders and files.', {
				usage: `<script lang="ts">
  import FolderFiles from '$lib/components/FolderFiles.svelte';
  import type { Folder, File } from '$lib/types';

  const folders: Folder[] = [
    { id: 1, name: 'Projects', display_order: 1 },
    { id: 2, name: 'Archive', display_order: 2 }
  ];
  const files: File[] = [
    { id: 1, folder_id: 1, name: 'Brief', display_order: 1 }
  ];
</script>

<FolderFiles {folders} {files} usingDatabase={false} />`
			})
		]
	},
	{
		name: 'Maps & Location',
		icon: '🗺️',
		summary: 'Geographic interfaces, routing demos, and location-aware visualisations.',
		components: [
			component('Maps', '/maps', '🗺️', 'Interactive Leaflet maps with markers and search.', {
				source: 'src/lib/components/MapBasic.svelte',
				docs: 'src/lib/components/Maps.md',
				dependencies: ['leaflet', '@types/leaflet'],
				relatedFiles: [
					'src/lib/components/MapSearch.svelte',
					'src/lib/components/MapMarkers.svelte',
					'src/lib/components/MapLive.svelte'
				],
				usage: `<script lang="ts">
  import MapLive from '$lib/components/MapLive.svelte';
</script>

<MapLive
  centre={[51.5074, -0.1278]}
  zoom={10}
  markers={[{ id: 1, lat: 51.5074, lng: -0.1278, title: 'London' }]}
/>`,
				agentHint: 'Include Leaflet CSS in app.html before using these components.'
			}),
			component('Location', '/location', '📍', 'Locate-me, delivery, and routing demos.', {
				source: 'src/lib/components/MapLocateMe.svelte',
				docs: 'src/lib/components/Location.md',
				dependencies: ['leaflet', '@types/leaflet'],
				relatedFiles: ['src/lib/components/MapRouting.svelte'],
				usage: `<script lang="ts">
  import MapLocateMe from '$lib/components/MapLocateMe.svelte';
</script>

<MapLocateMe onLocate={(coords) => console.log('user is at', coords)} />`,
				agentHint: 'Browser geolocation needs HTTPS or localhost; routing uses OSRM demo endpoints by default.'
			}),
			component('GlobePresence', '/globepresence', '🌍', 'High-performance 3D globe visualisation.', {
				usage: `<script lang="ts">
  import GlobePresence from '$lib/components/GlobePresence.svelte';
  const dots = [
    { lat: 51.5, lng: -0.1, label: 'London' },
    { lat: 40.7, lng: -74.0, label: 'New York' },
    { lat: 35.7, lng: 139.7, label: 'Tokyo' }
  ];
</script>

<GlobePresence {dots} autoRotate />`
			}),
			component('GeoViz', '/geo', '🌍', 'Choropleth and spike-map visualisations.', {
				screenshotFile: 'GeoVizShot.png',
				source: 'src/lib/components/GeoChoropleth.svelte',
				docs: 'src/lib/components/GeoViz.md',
				relatedFiles: [
					'src/lib/components/GeoSpikeMap.svelte',
					'src/lib/components/GeoBubbleMap.svelte'
				],
				usage: `<script lang="ts">
  import GeoChoropleth from '$lib/components/GeoChoropleth.svelte';

  const features = []; // GeoJSON FeatureCollection.features
  const values = { 'GB': 42, 'FR': 28, 'DE': 19 };
</script>

<GeoChoropleth {features} {values} />`,})
		]
	},
	{
		name: 'Auth & OSS Demo',
		icon: '🔐',
		summary: 'Better Auth flows and protected-route examples for public demos.',
		components: [
			component('Auth Demo', '/auth', '🔐', 'Better Auth sign-in, sign-up, and demo-account entry.', {
				screenshotFile: 'AuthShot.png',
				source: 'src/routes/auth/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				dependencies: ['better-auth'],
				relatedFiles: [
					'src/hooks.server.ts',
					'src/lib/server/auth.ts',
					'src/lib/server/betterAuth.ts',
					'src/lib/auth-client.ts',
					'src/lib/components/AuthStatus.svelte',
					'src/routes/auth/sign-in/[...rest]/+page.svelte',
					'src/routes/auth/sign-up/[...rest]/+page.svelte',
					'database/schema_better_auth.sql'
				],
				usage: `<script lang="ts">
  // /auth shows the public sign-in / sign-up flow.
  // For protected routes, gate them with the helper:
  // src/routes/(protected)/+layout.server.ts
  import { requireAuth } from '$lib/server/auth';

  export const load = (event) => {
    const userId = requireAuth(event);
    return { userId };
  };
</script>`,
				agentHint:
					'Copy the Better Auth server/client wiring together; do not copy only the visual auth page.'
			}),
			component('Dashboard', '/dashboard', '📊', 'Protected route example with session data.', {
				source: 'src/routes/(protected)/dashboard/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				demo: 'src/routes/(protected)/dashboard/+page.svelte',
				dependencies: ['better-auth'],
				usage: `<script lang="ts">
  // /dashboard is a protected route under the (protected) group.
  // The (protected)/+layout.server.ts calls requireAuth(event).
  // Here you receive the authenticated user via locals.

  // src/routes/(protected)/dashboard/+page.server.ts
  export const load = ({ locals }) => {
    return {
      userId: locals.user?.id ?? null,
      userName: locals.user?.name ?? null
    };
  };
</script>`,
				agentHint:
					'This is a protected route example; pair it with hooks.server.ts and the Better Auth setup.'
			}),
			component('Profile', '/profile', '👤', 'Protected user profile view.', {
				source: 'src/routes/(protected)/profile/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				demo: 'src/routes/(protected)/profile/+page.svelte',
				dependencies: ['better-auth'],
				usage: `<script lang="ts">
  // /profile is a protected route. Display + edit user details
  // through the Better Auth client.

  // src/routes/(protected)/profile/+page.svelte
  import { authClient } from '$lib/auth-client';

  async function signOut() {
    await authClient.signOut();
    window.location.href = '/';
  }
</script>

<button onclick={signOut}>Sign out</button>`,
				agentHint:
					'This is a protected route example; pair it with hooks.server.ts and the Better Auth setup.'
			})
		]
	}
];

export const componentCount = componentCategories.reduce(
	(total, category) => total + category.components.length,
	0
);

const normalizeHref = (href: string) => {
	const [path] = href.split(/[?#]/);
	if (!path || path === '/') return '/';
	return path.endsWith('/') ? path.slice(0, -1) : path;
};

export const componentCatalogEntries: ComponentCatalogEntry[] = componentCategories.flatMap((category) =>
	category.components.map((item) => ({ category, item }))
);

export function getCatalogEntryByHref(href: string): ComponentCatalogEntry | undefined {
	const currentPath = normalizeHref(href);
	return componentCatalogEntries.find(({ item }) => normalizeHref(item.href) === currentPath);
}

export function isCatalogComponentPath(href: string): boolean {
	return Boolean(getCatalogEntryByHref(href));
}

export function themeSupportLabel(themeSupport: ComponentCatalogItem['themeSupport']): string {
	return themeSupport === 'dual' ? 'Light and dark mode' : 'Light mode';
}

/**
 * Derive the bulk of `<ComponentPageShell />` props from a catalog entry.
 *
 * Demo pages should spread the result, then add what only they know about
 * (tags, codeExplanation, sometimes a richer usage snippet, custom resources).
 *
 *   <ComponentPageShell
 *     {...shellPropsFromCatalog(category, item)}
 *     tags={['Svelte 5', 'Hover']}
 *     codeExplanation="..."
 *   >
 *     {#snippet demo()}…{/snippet}
 *     {#snippet api()}…{/snippet}
 *   </ComponentPageShell>
 *
 * Returns Pick<…> rather than the whole shell prop type so we don't import
 * a Svelte component into a plain TS module (which would force the catalog
 * to compile against the Svelte runtime).
 */
export interface CatalogShellProps {
	name: string;
	category: string;
	description: string;
	source: string;
	demoPath: string;
	dependencies: string[];
	usageSnippet?: string;
	agentSteps: string[];
	install: string;
	resources: { label: string; href: string }[];
	codeFileName: string;
	/** Pre-rendered HTML from the sibling .md, sanitised by `renderMarkdown`. */
	docsHtml?: string;
}

const REPO_BLOB = 'https://github.com/Jktfe/tfeSvelteTemplates/blob/main/';

export function shellPropsFromCatalog(
	category: ComponentCatalogCategory,
	item: ComponentCatalogItem
): CatalogShellProps {
	const sourceFile = item.source.split('/').pop() ?? item.source;
	const docsLabel = item.docs.split('/').pop() ?? item.docs;

	const resources: { label: string; href: string }[] = [
		{ label: `Source · ${sourceFile}`, href: REPO_BLOB + item.source }
	];
	for (const file of item.relatedFiles.slice(0, 2)) {
		const label = file.split('/').pop() ?? file;
		resources.push({ label, href: REPO_BLOB + file });
	}
	resources.push({ label: `Docs · ${docsLabel}`, href: REPO_BLOB + item.docs });

	return {
		name: item.name,
		category: category.name,
		description: item.description,
		source: item.source,
		demoPath: item.demo,
		dependencies: item.dependencies.length
			? item.dependencies
			: ['Svelte 5+', 'Zero external dependencies'],
		usageSnippet: item.usage,
		agentSteps: item.agentHint ? [item.agentHint] : [],
		install: `cp ${item.source} ./src/lib/components/`,
		resources,
		codeFileName: sourceFile,
		docsHtml: getDocsHtmlForPath(item.docs)
	};
}

/**
 * Convenience for migrated demo pages: pass the slug, get back the matching
 * (category, item) pair plus the shell-prop bundle in one go.
 *
 *   const { props, item, category } = catalogShellPropsForSlug('/magiccard');
 */
export function catalogShellPropsForSlug(href: string):
	| { props: CatalogShellProps; item: ComponentCatalogItem; category: ComponentCatalogCategory }
	| undefined {
	const entry = getCatalogEntryByHref(href);
	if (!entry) return undefined;
	return {
		props: shellPropsFromCatalog(entry.category, entry.item),
		item: entry.item,
		category: entry.category
	};
}

export const iconColors: Record<string, { bg: string; text: string }> = {
	'☰': { bg: '#dbeafe', text: '#1d4ed8' },
	'⚡': { bg: '#fef3c7', text: '#d97706' },
	'🧲': { bg: '#e0f2fe', text: '#0369a1' },
	'💫': { bg: '#ede9fe', text: '#7c3aed' },
	'🎯': { bg: '#fce7f3', text: '#db2777' },
	'✨': { bg: '#fef3c7', text: '#d97706' },
	'🎭': { bg: '#f3e8ff', text: '#9333ea' },
	'🔗': { bg: '#dbeafe', text: '#2563eb' },
	'🔔': { bg: '#fef3c7', text: '#b45309' },
	'🔎': { bg: '#e0e7ff', text: '#4338ca' },
	'⌨️': { bg: '#f3f4f6', text: '#374151' },
	'🎹': { bg: '#e5e7eb', text: '#1f2937' },
	'🔢': { bg: '#dbeafe', text: '#1d4ed8' },
	'🌀': { bg: '#e0e7ff', text: '#4338ca' },
	'📥': { bg: '#ecfdf5', text: '#047857' },
	'⏱️': { bg: '#fef3c7', text: '#d97706' },
	'🍱': { bg: '#fff7ed', text: '#ea580c' },
	'🃏': { bg: '#dcfce7', text: '#16a34a' },
	'🎴': { bg: '#fef3c7', text: '#ea580c' },
	'🌌': { bg: '#e0e7ff', text: '#4338ca' },
	'🪧': { bg: '#1f2937', text: '#fde68a' },
	'💡': { bg: '#0a0815', text: '#ff3aa9' },
	'🎬': { bg: '#f1f5f9', text: '#0f172a' },
	'🖥️': { bg: '#160d05', text: '#ffb84d' },
	'💯': { bg: '#0f172a', text: '#7dd3fc' },
	'🎰': { bg: '#fee2e2', text: '#dc2626' },
	'📊': { bg: '#e0e7ff', text: '#4f46e5' },
	'📅': { bg: '#d1fae5', text: '#059669' },
	'🫧': { bg: '#cffafe', text: '#0891b2' },
	'☀️': { bg: '#fef9c3', text: '#ca8a04' },
	'🌊': { bg: '#dbeafe', text: '#0284c7' },
	'🗂️': { bg: '#fef3c7', text: '#b45309' },
	'🎓': { bg: '#e0e7ff', text: '#6366f1' },
	'↔️': { bg: '#f3e8ff', text: '#a855f7' },
	'🎪': { bg: '#fce7f3', text: '#ec4899' },
	'📝': { bg: '#dcfce7', text: '#22c55e' },
	'✏️': { bg: '#fef3c7', text: '#f59e0b' },
	'🗺️': { bg: '#dbeafe', text: '#3b82f6' },
	'📍': { bg: '#fee2e2', text: '#ef4444' },
	'🌍': { bg: '#d1fae5', text: '#10b981' },
	'🔐': { bg: '#fce7f3', text: '#be185d' },
	'👤': { bg: '#e0e7ff', text: '#6366f1' },
	'📤': { bg: '#e0f2fe', text: '#0369a1' },
	'👥': { bg: '#ccfbf1', text: '#0d9488' },
	'🪄': { bg: '#f5d0fe', text: '#a21caf' },
	'💧': { bg: '#cffafe', text: '#0e7490' },
	'🏷️': { bg: '#fef3c7', text: '#a16207' },
	'📈': { bg: '#dcfce7', text: '#15803d' },
	'☁️': { bg: '#e0f2fe', text: '#0369a1' },
	'📜': { bg: '#fef3c7', text: '#7c3aed' },
	'📭': { bg: '#fef3c7', text: '#a16207' },
	'💀': { bg: '#e5e7eb', text: '#374151' },
	'⭕': { bg: '#dbeafe', text: '#1d4ed8' },
	'📋': { bg: '#fef9c3', text: '#854d0e' },
	'🪜': { bg: '#e0e7ff', text: '#4338ca' },
	'⭐': { bg: '#fef3c7', text: '#b45309' },
	'🚨': { bg: '#fee2e2', text: '#991b1b' },
	'🎚️': { bg: '#e0f2fe', text: '#0369a1' },
	'🎛️': { bg: '#ede9fe', text: '#5b21b6' },
	'💬': { bg: '#f0fdf4', text: '#166534' },
	'📑': { bg: '#fef3c7', text: '#92400e' },
	'🍞': { bg: '#fef3c7', text: '#a16207' },
	'🔘': { bg: '#dbeafe', text: '#1d4ed8' },
	'🎚': { bg: '#e0e7ff', text: '#4338ca' },
	'🪗': { bg: '#fef9c3', text: '#854d0e' },
	'🗂': { bg: '#fef3c7', text: '#a16207' },
	'🙂': { bg: '#dbeafe', text: '#1d4ed8' },
	'📺': { bg: '#fef3c7', text: '#b45309' },
	'💥': { bg: '#fee2e2', text: '#be123c' },
	'🔀': { bg: '#ede9fe', text: '#5b21b6' },
	'🔦': { bg: '#ffe4e6', text: '#be123c' },
	'🅰️': { bg: '#e0e7ff', text: '#4338ca' },
	'📐': { bg: '#1e293b', text: '#a5b4fc' },
	'📼': { bg: '#0a0a0a', text: '#ff00c8' },
	'🪀': { bg: '#fef3c7', text: '#92400e' },
	'🪩': { bg: '#1a0a2e', text: '#ff7eee' },
	'🛸': { bg: '#1e1b4b', text: '#fbbf24' },
	'🎨': { bg: '#1a1a2e', text: '#ff6b9d' },
	'🌠': { bg: '#0a0a14', text: '#00f0ff' },
	'🌫️': { bg: '#14141a', text: '#c9c9d1' },
	'🛣️': { bg: '#050510', text: '#00f0ff' },
	'🎵': { bg: '#0d0d1a', text: '#38bdf8' },
	'⏳': { bg: '#0d0d1a', text: '#10b981' },
	'🖱️': { bg: '#0d0d1a', text: '#a78bfa' },
	'📖': { bg: '#fef3c7', text: '#92400e' },
	'🎉': { bg: '#1a0a2e', text: '#fde047' },
	'💻': { bg: '#0d1117', text: '#79c0ff' },
	'〰️': { bg: '#e0f2fe', text: '#0e7490' },
	'🎞️': { bg: '#111827', text: '#f9a8d4' },
	'🧬': { bg: '#1c1917', text: '#fbbf24' }
};

export function getIconColors(icon: string) {
	return iconColors[icon] ?? { bg: '#f3f4f6', text: '#374151' };
}

function isActivePath(currentPath: string, href: string) {
	return href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);
}

export function buildMenuCategories(currentPath: string): MenuCategory[] {
	return [
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: isActivePath(currentPath, '/') }]
		},
		...componentCategories.map((category) => ({
			name: category.name,
			icon: category.icon,
			items: category.components.map((item) => ({
				label: item.name,
				href: item.href,
				icon: item.icon,
				active: isActivePath(currentPath, item.href)
			}))
		}))
	];
}

export function getCatalogPageTitle(currentPath: string) {
	for (const category of buildMenuCategories(currentPath)) {
		const activeItem = category.items.find((item) => item.active);
		if (activeItem) return activeItem.label;
	}
	return 'Svelte Templates';
}
