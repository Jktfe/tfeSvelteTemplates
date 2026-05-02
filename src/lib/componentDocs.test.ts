/**
 * Component documentation structural tests.
 *
 * Each component listed in `GOLD_STANDARD_DOCS` must:
 *   - load via the eager `import.meta.glob` in `componentDocs.ts`
 *   - start with `# ` (an H1) — never YAML front-matter (`---`)
 *   - contain every required H2 string in `REQUIRED_H2_SECTIONS` verbatim
 *
 * Section names are pinned by exact string. Renaming "Props Reference" to
 * "Props" intentionally breaks the test — the standard is the standard.
 *
 * The list is scoped to the Navigation & Shell shelf for batch 1.
 * Future batches add their components here as they're brought to standard.
 */

import { describe, it, expect } from 'vitest';
import { docsPaths, getDocsRawForPath } from './componentDocs';

const REQUIRED_H2_SECTIONS = [
	'## What Does It Do? (Plain English)',
	'## How It Works (Pseudo-Code)',
	'## State Flow Diagram',
	'## Props Reference',
	'## Edge Cases',
	'## Dependencies',
	'## File Structure'
] as const;

const GOLD_STANDARD_DOCS = [
	// Navigation & Shell
	'src/lib/components/Navbar.md',
	'src/lib/components/SpeedDial.md',
	'src/lib/components/FloatingDock.md',
	'src/lib/components/LiquidTabBar.md',
	'src/lib/components/Drawer.md',
	'src/lib/components/Breadcrumbs.md',
	'src/lib/components/Pagination.md',
	'src/lib/components/ReadingTOC.md',
	'src/lib/components/ScrollProgressBar.md',

	// Controls & Input
	'src/lib/components/forms/Forms.md',
	'src/lib/components/PinInput.md',
	'src/lib/components/UploadDropzone.md',
	'src/lib/components/Switch.md',
	'src/lib/components/Slider.md',
	'src/lib/components/SegmentedControl.md',
	'src/lib/components/FilterChips.md',
	'src/lib/components/RatingStars.md',
	'src/lib/components/Stepper.md',
	'src/lib/components/Accordion.md',
	'src/lib/components/Tabs.md',
	'src/lib/components/CommandPalette.md',
	'src/lib/components/ContextMenu.md',
	'src/lib/components/CopyButton.md',
	'src/lib/components/KbdShortcut.md',
	'src/lib/components/Tooltip.md',

	// Feedback & Identity
	'src/lib/components/ToastNotification.md',
	'src/lib/components/AlertBanner.md',
	'src/lib/components/EmptyState.md',
	'src/lib/components/SkeletonLoader.md',
	'src/lib/components/ProgressRing.md',
	'src/lib/components/ProgressBar.md',
	'src/lib/components/Spinner.md',
	'src/lib/components/BadgePill.md',
	'src/lib/components/Avatar.md',
	'src/lib/components/AvatarStack.md',
	'src/lib/components/StatCard.md',

	// Text, Time & Content Motion
	'src/lib/components/Typewriter.md',
	'src/lib/components/ShinyText.md',
	'src/lib/components/ScrambledText.md',
	'src/lib/components/TrueFocus.md',
	'src/lib/components/VariableProximity.md',
	'src/lib/components/GlitchText.md',
	'src/lib/components/SplitFlap.md',
	'src/lib/components/TickerTape.md',
	'src/lib/components/Marquee.md',
	'src/lib/components/CodeBlock.md',
	'src/lib/components/Countdown.md',
	'src/lib/components/CountUp.md',
	'src/lib/components/Timeline.md',

	// Cards & Layout
	'src/lib/components/CardStack.md',
	'src/lib/components/BentoGrid.md',
	'src/lib/components/Divider.md',
	'src/lib/components/ExpandingCard.md',
	'src/lib/components/ScratchToReveal.md',
	'src/lib/components/StreamShowcase.md',
	'src/lib/components/Cardwall.md',
	'src/lib/components/MagicCard.md',
	'src/lib/components/MorphingDialog.md',

	// Motion Primitives
	'src/lib/components/ShineBorder.md',
	'src/lib/components/SwishButton.md',
	'src/lib/components/MagneticButton.md',
	'src/lib/components/ClickSpark.md',
	'src/lib/components/LinkImageHover.md',
	'src/lib/components/AnimatedBeam.md',
	'src/lib/components/ScrollReveal.md',
	'src/lib/components/OrbitalRing.md',
	'src/lib/components/MagnetGrid.md',
	'src/lib/components/PixelTrail.md',
	'src/lib/components/RippleGrid.md',
	'src/lib/components/EqualizerBars.md',
	'src/lib/components/ConfettiBurst.md',
	'src/lib/components/Tilt3D.md',
	'src/lib/components/Pendulum.md',

	// Ambient Surfaces
	'src/lib/components/AuroraBackdrop.md',
	'src/lib/components/MeshGradient.md',
	'src/lib/components/MembraneHero.md',
	'src/lib/components/PerspectiveGrid.md',
	'src/lib/components/NoiseField.md',
	'src/lib/components/NeonSign.md',
	'src/lib/components/CRTScreen.md',
	'src/lib/components/HoloCard.md',
	'src/lib/components/ElectricBorder.md',

	// Data & Visualisation
	'src/lib/components/DataGrid.md',
	'src/lib/components/CalendarHeatmap.md',
	'src/lib/components/BubblePacking.md',
	'src/lib/components/RadialCluster.md',
	'src/lib/components/Sunburst.md',
	'src/lib/components/WordCloud.md',
	'src/lib/components/Sankey.md',
	'src/lib/components/ExplainerCanvas/ExplainerCanvas.md',

	// Media & Portfolio
	'src/lib/components/BeforeAfter.md',
	'src/lib/components/DomeGallery.md',
	'src/lib/components/PortfolioPhotographer.md',

	// Data-Backed Workflows
	'src/lib/components/Editor.md',
	'src/lib/components/FolderFiles.md',

	// Maps & Location
	'src/lib/components/Maps.md',
	'src/lib/components/Location.md',
	'src/lib/components/GlobePresence.md',
	'src/lib/components/GeoViz.md',

	// Auth & OSS Demo (one shared file documenting the auth system)
	'src/lib/components/AuthStatus.md'
] as const;

// UTF-8 BOM (U+FEFF) — constructed via String.fromCharCode so the literal
// doesn't appear in source (ESLint's no-irregular-whitespace would flag it).
const BOM = String.fromCharCode(0xfeff);

describe('componentDocs glob loader', () => {
	it('registers .md files under src/lib/components', () => {
		expect(docsPaths.length).toBeGreaterThan(0);
		for (const path of docsPaths) {
			expect(path.startsWith('src/lib/components/')).toBe(true);
			expect(path.endsWith('.md')).toBe(true);
		}
	});

	it('returns undefined for unknown paths', () => {
		expect(getDocsRawForPath('src/lib/components/__nope__.md')).toBeUndefined();
		expect(getDocsRawForPath('')).toBeUndefined();
	});
});

describe('Navigation & Shell — gold-standard docs', () => {
	for (const path of GOLD_STANDARD_DOCS) {
		describe(path.replace('src/lib/components/', ''), () => {
			const raw = getDocsRawForPath(path);

			it('loads via import.meta.glob', () => {
				expect(raw).toBeDefined();
			});

			it('starts with an H1 (no YAML front-matter)', () => {
				if (!raw) return;
				const trimmed = raw.startsWith(BOM) ? raw.slice(BOM.length) : raw;
				const head = trimmed.trimStart();
				expect(head.startsWith('# ')).toBe(true);
				expect(head.startsWith('---')).toBe(false);
			});

			for (const section of REQUIRED_H2_SECTIONS) {
				it(`contains required section: ${section}`, () => {
					if (!raw) return;
					expect(raw).toContain(section);
				});
			}
		});
	}
});
