/**
 * Shared constants for the CardStack template project
 *
 * This file contains all shared constant values to ensure consistency
 * across the application and prevent duplication.
 */

import type {
	Card,
	Testimonial,
	ExpandingCardData,
	LinkPreview,
	EditorData,
	Employee,
	Folder,
	FileItem,
	MapMarker,
	LatLng,
	BeamNode,
	BeamConnection,
	CalendarDataPoint,
	SunburstNode,
	RadialClusterNode
} from './types';

/**
 * Fallback card data for when database is unavailable
 * Used by +page.server.ts when DATABASE_URL is not configured
 *
 * These cards use Unsplash images and are kept in sync with database/schema.sql seed data
 */
export const FALLBACK_CARDS: Card[] = [
	{
		title: 'Mountain Vista',
		content:
			'Breathtaking views from the highest peaks, where the air is crisp and the horizon endless.',
		image:
			'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
	},
	{
		title: 'Ocean Waves',
		content: 'The rhythmic dance of waves meeting shore, a timeless symphony of nature.',
		image:
			'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop'
	},
	{
		title: 'Forest Path',
		content: 'Wandering through ancient woods, where sunlight filters through emerald canopies.',
		image:
			'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
	},
	{
		title: 'Desert Dunes',
		content: 'Golden sands sculpted by wind, creating an ever-changing landscape of beauty.',
		image:
			'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop'
	},
	{
		title: 'City Lights',
		content: 'Urban brilliance illuminating the night, a testament to human achievement.',
		image:
			'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop'
	},
	{
		title: 'Northern Lights',
		content:
			"Aurora borealis painting the sky with ethereal colours, nature's greatest light show.",
		image:
			'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop'
	}
];

/**
 * Fallback testimonial data for when database is unavailable
 * Used by Marquee component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_TESTIMONIALS: Testimonial[] = [
	// Static marquee testimonials
	{
		name: 'Sarah Chen',
		role: 'Product Designer',
		company: 'TechCorp',
		quote: 'These components saved us weeks of development time. Absolutely brilliant!',
		avatar: '👩‍💼',
		category: 'static'
	},
	{
		name: 'James Rodriguez',
		role: 'Engineering Lead',
		company: 'StartupXYZ',
		quote: 'Clean, performant, and beautifully designed. Exactly what we needed.',
		avatar: '👨‍💻',
		category: 'static'
	},
	{
		name: 'Emily Watson',
		role: 'Frontend Developer',
		company: 'DesignStudio',
		quote: 'The TypeScript support and documentation are top-notch. Highly recommend!',
		avatar: '👩‍🎨',
		category: 'static'
	},
	{
		name: 'Michael Park',
		role: 'CTO',
		company: 'InnovateLabs',
		quote: 'Production-ready components that just work. Our team loves them!',
		avatar: '👨‍💼',
		category: 'static'
	},
	{
		name: 'Lisa Thompson',
		role: 'UI Engineer',
		company: 'CloudSystems',
		quote: 'Responsive, accessible, and easy to customise. Perfect for our projects.',
		avatar: '👩‍🔬',
		category: 'static'
	},
	// Interactive/draggable marquee testimonials
	{
		name: 'Alex Morgan',
		role: 'UX Designer',
		company: 'TechFlow',
		quote: 'The drag interaction is incredibly smooth and intuitive!',
		avatar: '👨‍💼',
		category: 'interactive'
	},
	{
		name: 'Sophia Chen',
		role: 'Product Manager',
		company: 'InnovateHub',
		quote: 'Users love being able to control the marquee speed themselves.',
		avatar: '👩‍💻',
		category: 'interactive'
	},
	{
		name: 'Marcus Johnson',
		role: 'Developer',
		company: 'CodeCraft',
		quote: 'Easy to implement and the momentum feels natural.',
		avatar: '👨‍🔬',
		category: 'interactive'
	},
	{
		name: 'Emma Wilson',
		role: 'Marketing Lead',
		company: 'BrandBoost',
		quote: 'Perfect for showcasing content in an engaging way!',
		avatar: '👩‍💼',
		category: 'interactive'
	}
];

/**
 * Fallback expanding card data for when database is unavailable
 * Used by ExpandingCard component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_EXPANDING_CARDS: ExpandingCardData[] = [
	{
		heading: 'Mountain Vista',
		compactText: 'Towering peaks pierce the clouds',
		expandedText:
			"Experience the majesty of towering mountain peaks that pierce through ethereal clouds, creating a breathtaking panorama of nature's grandeur. The crisp mountain air and pristine snow-capped summits offer an escape into pure wilderness.",
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
		imageAlt: 'Mountain landscape with snow-capped peaks',
		bgColor: 'bg-blue-100',
		category: 'nature'
	},
	{
		heading: 'Ocean Depths',
		compactText: 'The rhythmic dance of azure waves',
		expandedText:
			'Discover the mesmerising rhythm of azure waves as they dance endlessly across the vast ocean expanse. The deep blue waters hold countless mysteries, from vibrant coral reefs to majestic marine life that calls these depths home.',
		imageSrc: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
		imageAlt: 'Ocean waves and deep blue water',
		bgColor: 'bg-cyan-100',
		category: 'nature'
	},
	{
		heading: 'Forest Trail',
		compactText: 'Sunlight filters through emerald canopies',
		expandedText:
			'Wander along peaceful forest trails where golden sunlight filters through dense emerald canopies, creating a magical interplay of light and shadow. Ancient trees stand as silent sentinels, their roots deep in the rich forest soil.',
		imageSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
		imageAlt: 'Forest path with sunlight through trees',
		bgColor: 'bg-green-100',
		category: 'nature'
	},
	{
		heading: 'Desert Dunes',
		compactText: 'Golden sands sculpted by endless winds',
		expandedText:
			'Marvel at the endless expanse of golden desert dunes, each one sculpted by ancient winds into flowing curves of sand. As the sun sets, the dunes transform into a canvas of warm oranges and deep purples, creating an otherworldly landscape.',
		imageSrc: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
		imageAlt: 'Desert sand dunes in golden light',
		bgColor: 'bg-amber-100',
		category: 'nature'
	}
];

/**
 * Fallback link preview data for when database is unavailable
 * Used by LinkImageHover component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_LINK_PREVIEWS: LinkPreview[] = [
	// City links
	{
		text: 'Mumbai',
		href: 'https://en.wikipedia.org/wiki/Mumbai',
		imageSrc: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=400&fit=crop',
		imageAlt: 'Mumbai City',
		category: 'cities'
	},
	{
		text: 'New York',
		href: 'https://en.wikipedia.org/wiki/New_York_City',
		imageSrc: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
		imageAlt: 'New York City',
		category: 'cities'
	},
	{
		text: 'Tokyo',
		href: 'https://en.wikipedia.org/wiki/Tokyo',
		imageSrc: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop',
		imageAlt: 'Tokyo City',
		category: 'cities'
	},
	{
		text: 'London',
		href: 'https://en.wikipedia.org/wiki/London',
		imageSrc: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop',
		imageAlt: 'London City',
		category: 'cities'
	},
	// Nature links
	{
		text: 'Mount Everest',
		href: 'https://en.wikipedia.org/wiki/Mount_Everest',
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
		imageAlt: 'Mount Everest peak',
		category: 'nature'
	},
	{
		text: 'Amazon Rainforest',
		href: 'https://en.wikipedia.org/wiki/Amazon_rainforest',
		imageSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
		imageAlt: 'Amazon Rainforest canopy',
		category: 'nature'
	},
	{
		text: 'Great Barrier Reef',
		href: 'https://en.wikipedia.org/wiki/Great_Barrier_Reef',
		imageSrc: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400',
		imageAlt: 'Great Barrier Reef coral',
		category: 'nature'
	}
];

/**
 * Fallback editor data for when database is unavailable
 * Used by Editor component CRUD demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_editor.sql seed data
 */
export const FALLBACK_EDITOR_DATA: EditorData[] = [
	{
		id: -1,
		heading: 'Mountain Wilderness',
		compactText: 'Explore the untamed beauty of mountain landscapes and discover nature at its finest.',
		expandedText:
			"The mountain wilderness offers breathtaking vistas, challenging trails, and an escape from the bustle of everyday life. From snow-capped peaks to alpine meadows, every season brings its own unique charm. Whether you're an experienced mountaineer or a casual hiker, there's something magical about standing atop a summit and viewing the world from above.",
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
		imageAlt: 'Majestic mountain landscape with snow-capped peaks',
		bgColor: 'bg-blue-100',
		category: 'editor-demo'
	},
	{
		id: -2,
		heading: 'Ocean Serenity',
		compactText: 'Dive into the calming waves and peaceful shores of our coastal paradise.',
		expandedText:
			"The ocean has a way of putting everything into perspective. The rhythmic sound of waves, the endless horizon, and the salty breeze create a sense of peace that's hard to find elsewhere. Whether you're surfing the breaks, swimming in crystal-clear waters, or simply walking along the shore, the ocean offers renewal and inspiration. It's a reminder of nature's power and beauty.",
		imageSrc: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&auto=format&fit=crop',
		imageAlt: 'Peaceful ocean waves at sunset',
		bgColor: 'bg-cyan-100',
		category: 'editor-demo'
	},
	{
		id: -3,
		heading: 'Urban Energy',
		compactText: 'Experience the vibrant pulse of city life where innovation meets culture.',
		expandedText:
			"Cities are living organisms, constantly evolving and buzzing with energy. From towering skyscrapers to hidden alleyways, every corner tells a story. The urban landscape is where cultures collide, ideas flourish, and opportunities abound. Street art, diverse cuisines, cutting-edge technology, and historic architecture all coexist in a beautiful chaos. It's a place where you can reinvent yourself daily and find inspiration around every corner.",
		imageSrc: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop',
		imageAlt: 'Dynamic city skyline at night with lights',
		bgColor: 'bg-purple-100',
		category: 'editor-demo'
	}
];

/**
 * Fallback employee data for DataGrid demos when database is unavailable
 * Used by DataGrid components when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_datagrid.sql seed data
 * Sample data demonstrating various employee records for grid features
 */
export const FALLBACK_EMPLOYEES: Employee[] = [
	{
		id: 1,
		firstName: 'Sarah',
		lastName: 'Johnson',
		email: 'sarah.johnson@company.com',
		department: 'Engineering',
		position: 'Senior Developer',
		salary: 95000,
		hireDate: new Date('2020-03-15'),
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0958',
		notes: 'Team lead for backend services'
	},
	{
		id: 2,
		firstName: 'James',
		lastName: 'Smith',
		email: 'james.smith@company.com',
		department: 'Engineering',
		position: 'DevOps Engineer',
		salary: 88000,
		hireDate: new Date('2021-06-01'),
		status: 'active',
		location: 'Manchester',
		phone: '+44 161 850 2000',
		notes: 'AWS infrastructure specialist'
	},
	{
		id: 3,
		firstName: 'Emily',
		lastName: 'Brown',
		email: 'emily.brown@company.com',
		department: 'Design',
		position: 'UX Designer',
		salary: 72000,
		hireDate: new Date('2019-09-20'),
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0123',
		notes: 'Leading design system initiative'
	},
	{
		id: 4,
		firstName: 'Michael',
		lastName: 'Davis',
		email: 'michael.davis@company.com',
		department: 'Sales',
		position: 'Account Executive',
		salary: 65000,
		hireDate: new Date('2022-01-10'),
		status: 'active',
		location: 'Birmingham',
		phone: '+44 121 234 5678',
		notes: 'Enterprise accounts focus'
	},
	{
		id: 5,
		firstName: 'Jessica',
		lastName: 'Wilson',
		email: 'jessica.wilson@company.com',
		department: 'Marketing',
		position: 'Marketing Manager',
		salary: 78000,
		hireDate: new Date('2020-11-05'),
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0456',
		notes: 'Digital marketing campaigns'
	},
	{
		id: 6,
		firstName: 'David',
		lastName: 'Taylor',
		email: 'david.taylor@company.com',
		department: 'Engineering',
		position: 'Frontend Developer',
		salary: 82000,
		hireDate: new Date('2021-03-22'),
		status: 'active',
		location: 'Leeds',
		phone: '+44 113 243 2635',
		notes: 'React and Svelte specialist'
	},
	{
		id: 7,
		firstName: 'Laura',
		lastName: 'Anderson',
		email: 'laura.anderson@company.com',
		department: 'HR',
		position: 'HR Manager',
		salary: 70000,
		hireDate: new Date('2018-07-14'),
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0789',
		notes: 'Recruitment and onboarding'
	},
	{
		id: 8,
		firstName: 'Robert',
		lastName: 'Thomas',
		email: 'robert.thomas@company.com',
		department: 'Finance',
		position: 'Financial Analyst',
		salary: 68000,
		hireDate: new Date('2021-08-30'),
		status: 'active',
		location: 'Edinburgh',
		phone: '+44 131 225 2383',
		notes: 'Budget planning and analysis'
	},
	{
		id: 9,
		firstName: 'Sophie',
		lastName: 'Jackson',
		email: 'sophie.jackson@company.com',
		department: 'Engineering',
		position: 'QA Engineer',
		salary: 75000,
		hireDate: new Date('2020-05-18'),
		status: 'active',
		location: 'Bristol',
		phone: '+44 117 927 7000',
		notes: 'Automated testing framework'
	},
	{
		id: 10,
		firstName: 'Daniel',
		lastName: 'White',
		email: 'daniel.white@company.com',
		department: 'Design',
		position: 'Product Designer',
		salary: 76000,
		hireDate: new Date('2019-12-03'),
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0321',
		notes: 'Mobile app design'
	}
];

/**
 * Dropdown options for DataGrid inline editing
 * These define the allowed values for select/dropdown fields
 * Keeps data consistent and prevents invalid entries
 */

/**
 * Department options for employee records
 * Based on schema and seed data
 */
export const DEPARTMENT_OPTIONS = [
	'Engineering',
	'Design',
	'Sales',
	'Marketing',
	'HR',
	'Finance',
	'Customer Success'
] as const;

/**
 * Employment status options
 * Used for filtering and inline editing
 */
export const STATUS_OPTIONS = [
	'active',
	'on-leave',
	'terminated'
] as const;

/**
 * Position/role options
 * Comprehensive list of job titles used in the organisation
 */
export const POSITION_OPTIONS = [
	'Junior Developer',
	'Frontend Developer',
	'Senior Developer',
	'DevOps Engineer',
	'QA Engineer',
	'Data Engineer',
	'Security Engineer',
	'Platform Engineer',
	'Mobile Developer',
	'ML Engineer',
	'CTO',
	'UX Designer',
	'UI Designer',
	'Product Designer',
	'Design Director',
	'Account Executive',
	'Sales Representative',
	'Business Development',
	'Sales Director',
	'Marketing Manager',
	'Content Manager',
	'SEO Specialist',
	'Brand Manager',
	'HR Manager',
	'Recruiter',
	'Financial Analyst',
	'Accountant',
	'CFO',
	'Support Manager',
	'Support Engineer'
] as const;

/**
 * Office location options
 * UK cities and remote option
 */
export const LOCATION_OPTIONS = [
	'London',
	'Manchester',
	'Birmingham',
	'Leeds',
	'Edinburgh',
	'Bristol',
	'Glasgow',
	'Brighton',
	'Liverpool',
	'Cardiff',
	'Cambridge',
	'Oxford',
	'Nottingham',
	'Remote'
] as const;

/**
 * Validation fields mapping for dropdown columns
 * Used by both client-side and server-side validation to ensure consistency
 * Maps employee property names to their allowed values
 */
export const VALIDATION_FIELDS: Record<string, readonly string[]> = {
	department: DEPARTMENT_OPTIONS,
	status: STATUS_OPTIONS,
	position: POSITION_OPTIONS,
	location: LOCATION_OPTIONS
};

/**
 * Transform string array to SVAR Grid options format
 * SVAR Grid expects options as array of objects with { id, label } properties
 *
 * @param options - Array of string values
 * @returns Array of objects with id and label properties
 */
export function transformToGridOptions(options: readonly string[]): Array<{ id: string; label: string }> {
	return options.map(value => ({ id: value, label: value }));
}

/**
 * Pre-transformed options for SVAR Grid editors
 * These are used in DataGridAdvanced for dropdown/select editors
 */
export const DEPARTMENT_OPTIONS_GRID = transformToGridOptions(DEPARTMENT_OPTIONS);
export const STATUS_OPTIONS_GRID = transformToGridOptions(STATUS_OPTIONS);
export const POSITION_OPTIONS_GRID = transformToGridOptions(POSITION_OPTIONS);
export const LOCATION_OPTIONS_GRID = transformToGridOptions(LOCATION_OPTIONS);

// =============================================================================
// SANKEY VISUALIZATION FALLBACK DATA
// =============================================================================

/**
 * Fallback data for Expandable Sankey diagram
 *
 * Hierarchy Structure:
 * - Level 0: Root node (Energy Sources)
 * - Level 1: Main categories (Coal, Gas, Solar) - children of root
 * - Level 2: Subcategories (Plants) - children of categories
 * - Level 3: Destinations (Residential, Industrial) - final nodes
 *
 * Expected Behavior:
 * - Initially show: Root → Coal, Gas, Solar → Residential, Industrial
 * - Click Coal: Expand to show Coal Plant A
 * - Click Coal again: Collapse back to just Coal
 * - Same pattern for Gas (shows Gas Plant A, Gas Plant B)
 * - Solar has no children (not expandable)
 */
export const FALLBACK_SANKEY_DATA = {
	nodes: [
		// Source (single root node - this is what expands)
		{ id: 'energy', label: 'Energy Sources', color: '#6366f1' },

		// Categories (these are expandable groups)
		{ id: 'coal', label: 'Coal', color: '#8B4513', expandable: true },
		{ id: 'gas', label: 'Natural Gas', color: '#4682B4', expandable: true },
		{ id: 'solar', label: 'Solar', color: '#FFD700' },

		// Subcategories (shown when parent is expanded)
		{ id: 'coal-plant-a', label: 'Coal Plant A', color: '#8B4513', parent: 'coal' },
		{ id: 'coal-bbqs', label: 'Coal BBQs', color: '#8B4513', parent: 'coal' },
		{ id: 'gas-plant-a', label: 'Gas Plant A', color: '#4682B4', parent: 'gas' },
		{ id: 'gas-plant-b', label: 'Gas Plant B', color: '#4682B4', parent: 'gas', expandable: true },

		// Sub-subcategories (nested children - shown when grandparent is expanded)
		{ id: 'substation-z', label: 'Substation Z', color: '#4682B4', parent: 'gas-plant-b' },
		{ id: 'substation-y', label: 'Substation Y', color: '#4682B4', parent: 'gas-plant-b' },
		{ id: 'substation-x', label: 'Substation X', color: '#4682B4', parent: 'gas-plant-b' },

		// Destinations (targets - always visible)
		{ id: 'residential', label: 'Residential', color: '#32CD32' },
		{ id: 'industrial', label: 'Industrial', color: '#A0522D' }
	],
	links: [
		// Source to categories
		{ source: 'energy', target: 'coal', value: 12 },
		{ source: 'energy', target: 'gas', value: 29 },
		{ source: 'energy', target: 'solar', value: 13 },

		// Coal to subcategories (only shown when expanded)
		{ source: 'coal', target: 'coal-plant-a', value: 8 },
		{ source: 'coal', target: 'coal-bbqs', value: 4 },

		// Gas to subcategories (only shown when expanded)
		{ source: 'gas', target: 'gas-plant-a', value: 15 },
		{ source: 'gas', target: 'gas-plant-b', value: 14 },

		// Gas Plant B to substations (only shown when Gas Plant B is expanded)
		{ source: 'gas-plant-b', target: 'substation-z', value: 10 },
		{ source: 'gas-plant-b', target: 'substation-y', value: 2 },
		{ source: 'gas-plant-b', target: 'substation-x', value: 2 },

		// Coal subcategories to destinations
		{ source: 'coal-plant-a', target: 'residential', value: 2 },
		{ source: 'coal-plant-a', target: 'industrial', value: 6 },
		{ source: 'coal-bbqs', target: 'residential', value: 4 },

		// Gas Plant A to destinations
		{ source: 'gas-plant-a', target: 'residential', value: 5 },
		{ source: 'gas-plant-a', target: 'industrial', value: 10 },

		// Substations to destinations
		{ source: 'substation-z', target: 'residential', value: 7 },
		{ source: 'substation-z', target: 'industrial', value: 3 },
		{ source: 'substation-y', target: 'residential', value: 2 },
		{ source: 'substation-x', target: 'industrial', value: 2 },

		// Gas Plant B aggregate links (shown when Gas Plant B is NOT expanded)
		{ source: 'gas-plant-b', target: 'residential', value: 9 },
		{ source: 'gas-plant-b', target: 'industrial', value: 5 },

		// Solar direct to destinations (no subcategories)
		{ source: 'solar', target: 'residential', value: 5 },
		{ source: 'solar', target: 'industrial', value: 8 },

		// Coal aggregate links (shown when Coal is NOT expanded)
		{ source: 'coal', target: 'residential', value: 6 },
		{ source: 'coal', target: 'industrial', value: 6 },

		// Gas aggregate links (shown when Gas is NOT expanded)
		{ source: 'gas', target: 'residential', value: 14 },
		{ source: 'gas', target: 'industrial', value: 15 }
	]
};

/**
 * Fallback folder data for FolderFiles component
 * Used when database is unavailable
 *
 * Kept in sync with database/schema_folderfiles.sql seed data
 */
export const FALLBACK_FOLDERS: Folder[] = [
	{
		id: 1,
		label: 'Lexical Interruptions',
		color: '#a855f7', // purple-500
		textColor: 'white',
		icon: '📘',
		description: 'Research on lexical patterns in conversation',
		category: 'folderfiles-demo'
	},
	{
		id: 2,
		label: 'Concord Variants',
		color: '#14b8a6', // teal-500
		textColor: 'white',
		icon: '📗',
		description: 'Analysis of concordance variations across dialects',
		category: 'folderfiles-demo'
	},
	{
		id: 3,
		label: 'Prosodic Features',
		color: '#3b82f6', // blue-500
		textColor: 'white',
		icon: '📙',
		description: 'Studies on prosodic elements in speech',
		category: 'folderfiles-demo'
	},
	{
		id: 4,
		label: 'Ink Displacement',
		color: '#6366f1', // indigo-500
		textColor: 'white',
		icon: '🖋️',
		description: 'Examination of ink displacement patterns in handwriting',
		category: 'folderfiles-demo'
	},
	{
		id: 5,
		label: 'Referent Ghosts',
		color: '#374151', // gray-700
		textColor: 'white',
		icon: '👻',
		description: 'Analysis of referent ambiguity in discourse',
		category: 'folderfiles-demo'
	},
	{
		id: 6,
		label: 'Unanchored Statements',
		color: '#f97316', // orange-500
		textColor: 'white',
		icon: '⚓',
		description: 'Study of context-free utterances in dialogue',
		category: 'folderfiles-demo'
	}
];

/**
 * Fallback file data for FolderFiles component
 * Used when database is unavailable
 *
 * Kept in sync with database/schema_folderfiles.sql seed data
 */
export const FALLBACK_FILES: FileItem[] = [
	// Files for 'Lexical Interruptions' folder
	{
		id: 1,
		folderId: 1,
		title: 'Introduction to Lexical Interruptions',
		subtitle: 'Chapter 1: Foundations',
		previewText:
			'This document explores the fundamental concepts of lexical interruptions in natural conversation, examining how speakers interject, pause, and modify their speech patterns.',
		pages: [
			'<h1>Introduction to Lexical Interruptions</h1><p>Lexical interruptions represent a fascinating aspect of conversational dynamics. When speakers engage in dialogue, they frequently interrupt their own or others\' speech patterns with various lexical elements...</p><p>This phenomenon occurs across all languages and cultures, though the specific patterns and social acceptability vary significantly. Understanding these patterns helps us decode the underlying cognitive processes of speech production.</p>',
			'<h2>Types of Interruptions</h2><p>We can categorise lexical interruptions into several distinct types:</p><ul><li><strong>Self-corrections:</strong> When speakers pause to correct their own speech</li><li><strong>Filler words:</strong> Um, uh, like, you know</li><li><strong>Clarifications:</strong> Interjections to clarify meaning</li><li><strong>Emphasis markers:</strong> Words added for emphasis</li></ul>',
			'<h2>Research Methodology</h2><p>Our research employed a mixed-methods approach, combining quantitative analysis of conversation transcripts with qualitative interviews. We analysed over 500 hours of natural conversation across different contexts...</p>'
		],
		metadata: {
			author: 'Dr. Sarah Johnson',
			date: 'Mar 15, 1966',
			tags: ['linguistics', 'conversation', 'interruptions'],
			pageCount: 3,
			wordCount: 450,
			fileNumber: 'LXC'
		},
		fileType: 'document'
	},
	{
		id: 2,
		folderId: 1,
		title: 'Filler Words Across Cultures',
		subtitle: 'Comparative Study',
		previewText:
			'A comprehensive analysis of filler words (um, uh, like) across 12 different languages and their cultural implications.',
		pages: [
			'<h1>Filler Words Across Cultures</h1><p>Filler words serve as conversational lubricants, giving speakers time to think whilst maintaining the flow of dialogue. However, their usage, acceptability, and frequency vary dramatically across cultures...</p>',
			'<h2>English Filler Words</h2><p>In English, the most common fillers include \'um\', \'uh\', \'like\', \'you know\', and \'so\'. Younger speakers tend to use \'like\' more frequently, whilst older generations favour \'um\' and \'uh\'.</p>'
		],
		metadata: {
			author: 'Prof. Michael Chen',
			date: 'Feb 20, 1966',
			tags: ['linguistics', 'cross-cultural', 'fillers'],
			pageCount: 2,
			wordCount: 320
		},
		fileType: 'document'
	},
	{
		id: 3,
		folderId: 1,
		title: 'Turn-Taking Mechanisms',
		subtitle: 'Sequential Analysis',
		previewText:
			'Examination of how speakers negotiate turn-taking through lexical cues and interruption patterns in multi-party conversations.',
		content:
			'<h1>Turn-Taking Mechanisms</h1><p>Turn-taking in conversation is a remarkably sophisticated coordination system. Speakers use subtle lexical and prosodic cues to signal when they\'re finishing a turn or intending to continue...</p>',
		metadata: {
			author: 'Dr. Emily Watson',
			date: 'Jan 10, 1966',
			tags: ['conversation-analysis', 'turn-taking'],
			pageCount: 1,
			wordCount: 280
		},
		fileType: 'document'
	},
	// Files for 'Concord Variants' folder
	{
		id: 4,
		folderId: 2,
		title: 'Subject-Verb Agreement Patterns',
		subtitle: 'Regional Variations in British English',
		previewText:
			'Analysis of subject-verb agreement variations across different British dialects, exploring both standard and non-standard forms.',
		content:
			'<h1>Subject-Verb Agreement Patterns</h1><p>Subject-verb agreement represents one of the most variable aspects of English grammar across dialects...</p>',
		metadata: {
			author: 'Dr. James Morrison',
			date: 'Mar 1, 1966',
			tags: ['grammar', 'dialects', 'British-English'],
			pageCount: 1,
			wordCount: 190
		},
		fileType: 'document'
	},
	{
		id: 5,
		folderId: 2,
		title: 'Number Concordance Study',
		subtitle: 'Corpus Analysis',
		previewText:
			'Large-scale corpus study examining number concordance patterns in formal vs informal written English.',
		content:
			'<h1>Number Concordance Study</h1><p>Using a 10-million-word corpus, we examined patterns of number concordance...</p>',
		metadata: {
			author: 'Prof. Lisa Anderson',
			date: 'Feb 15, 1966',
			tags: ['corpus-linguistics', 'concordance'],
			pageCount: 1,
			wordCount: 240
		},
		fileType: 'document'
	},
	// Files for 'Prosodic Features' folder
	{
		id: 6,
		folderId: 3,
		title: 'Intonation Patterns in Questions',
		subtitle: 'Acoustic Analysis',
		previewText:
			'Detailed acoustic analysis of rising and falling intonation patterns in interrogative sentences across English dialects.',
		pages: [
			'<h1>Intonation Patterns in Questions</h1><p>Intonation plays a crucial role in signalling question types in English...</p>',
			'<h2>Rising Intonation</h2><p>Rising intonation typically indicates yes/no questions or uncertainty...</p>'
		],
		metadata: {
			author: 'Dr. Robert Taylor',
			date: 'Mar 10, 1966',
			tags: ['prosody', 'intonation', 'phonetics'],
			pageCount: 2,
			wordCount: 380
		},
		fileType: 'document'
	},
	// Files for other folders
	{
		id: 7,
		folderId: 4,
		title: 'Excerpt A',
		subtitle: 'Peripheral Entry',
		previewText:
			'Believed to be part of a larger set. No other parts located. Retrieved unbound. Source pending.',
		pages: [
			'<h1 style="font-style: italic; font-family: Georgia, serif;">Excerpt A</h1><p>The original arrives already altered—a copy turned latter by its journey through the gauntlet of scepticism. Interrogation loops back on itself, turning layers of erasure and silence.</p><p>The sequence, if it ever was one, appears broken, but each break insists on secondary logic of its annotation.</p>'
		],
		metadata: {
			author: 'Unknown',
			date: 'Jan 21, 1966',
			fileNumber: 'File 003',
			pageCount: 1
		},
		fileType: 'document'
	},
	{
		id: 8,
		folderId: 5,
		title: 'Unverified',
		subtitle: 'Margin Events',
		previewText:
			'There are signs of use: annotations, omissions, the pressure of someone else\'s urgency. No conclusion is evident, but the document resists being closed.',
		content:
			'<h1 style="font-style: italic; font-family: Georgia, serif;">Unverified</h1><p>There are signs of use: annotations, omissions, the pressure of someone else\'s urgency. No conclusion is evident, but the document resists being closed. It remains held in transit, not as an answer but as evidence of asking.</p>',
		metadata: {
			date: 'Jan 23, 1966',
			fileNumber: 'File 004',
			pageCount: 1
		},
		fileType: 'document'
	},
	{
		id: 9,
		folderId: 6,
		title: 'Varnell Collection',
		subtitle: 'Duplicated Silence',
		previewText:
			'Filed without status. Referenced frequently, yet volume titer in full. Peripheral impact.',
		content:
			'<h1 style="font-style: italic; font-family: Georgia, serif;">Varnell Collection</h1><p>Filed without status. Referenced frequently, yet volume titer in full. Peripheral impact on discourse remains substantial despite lack of formal acknowledgement.</p>',
		metadata: {
			date: 'Jan 18, 1966',
			pageCount: 1
		},
		fileType: 'document'
	}
];

// =============================================================================
// MAPPING COMPONENT FALLBACK DATA
// =============================================================================

/**
 * Default map center for UK-focused demos
 * Central London coordinates
 */
export const DEFAULT_MAP_CENTER: LatLng = { lat: 51.5074, lng: -0.1278 };

/**
 * Category options for map markers
 * Used for filtering in MapMarkers component
 */
export const MAP_MARKER_CATEGORIES = [
	'landmark',
	'museum',
	'attraction',
	'restaurant',
	'hotel',
	'park'
] as const;

/**
 * Fallback map marker data for when database is unavailable
 * Used by MapMarkers component when DATABASE_URL is not configured
 *
 * Showcases UK landmarks for demo purposes
 * Kept in sync with database/schema_maps.sql seed data
 */
export const FALLBACK_MAP_MARKERS: MapMarker[] = [
	// London landmarks
	{
		id: 1,
		position: { lat: 51.5014, lng: -0.1419 },
		title: 'Buckingham Palace',
		description:
			"The official London residence of the UK's sovereigns since 1837, featuring the famous Changing of the Guard ceremony.",
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'Westminster, London SW1A 1AA',
			website: 'https://www.royal.uk/royal-residences-buckingham-palace',
			hours: 'Seasonal opening hours'
		}
	},
	{
		id: 2,
		position: { lat: 51.5081, lng: -0.0759 },
		title: 'Tower of London',
		description:
			'Historic castle and former royal residence. Home to the Crown Jewels and famous Beefeater guards.',
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'London EC3N 4AB',
			phone: '+44 20 3166 6000',
			website: 'https://www.hrp.org.uk/tower-of-london/'
		}
	},
	{
		id: 3,
		position: { lat: 51.5194, lng: -0.127 },
		title: 'British Museum',
		description:
			'World-famous museum housing a vast collection of world art and artefacts, including the Rosetta Stone.',
		category: 'museum',
		iconType: 'default',
		metadata: {
			address: 'Great Russell St, London WC1B 3DG',
			hours: 'Daily 10:00-17:00',
			rating: 4.8
		}
	},
	{
		id: 4,
		position: { lat: 51.5033, lng: -0.1195 },
		title: 'London Eye',
		description:
			'Iconic 135m observation wheel on the South Bank offering stunning views across London.',
		category: 'attraction',
		iconType: 'default',
		metadata: {
			address: 'Riverside Building, London SE1 7PB',
			website: 'https://www.londoneye.com/'
		}
	},
	{
		id: 5,
		position: { lat: 51.5007, lng: -0.1246 },
		title: 'Houses of Parliament',
		description:
			'The meeting place of the House of Commons and House of Lords, home to Big Ben.',
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'Westminster, London SW1A 0AA',
			website: 'https://www.parliament.uk/'
		}
	},
	// Other UK cities
	{
		id: 6,
		position: { lat: 53.4808, lng: -2.2426 },
		title: 'Manchester Town Hall',
		description:
			'Victorian neo-Gothic building and iconic Manchester landmark. Grade I listed.',
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'Albert Square, Manchester M2 5DB',
			tags: ['architecture', 'victorian']
		}
	},
	{
		id: 7,
		position: { lat: 55.9533, lng: -3.1883 },
		title: 'Edinburgh Castle',
		description:
			'Historic fortress dominating the skyline of Edinburgh from its position atop Castle Rock.',
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'Castlehill, Edinburgh EH1 2NG',
			website: 'https://www.edinburghcastle.scot/'
		}
	},
	{
		id: 8,
		position: { lat: 51.4545, lng: -2.5879 },
		title: 'Clifton Suspension Bridge',
		description:
			'Iconic suspension bridge spanning the Avon Gorge, designed by Isambard Kingdom Brunel.',
		category: 'landmark',
		iconType: 'default',
		metadata: {
			address: 'Bridge Road, Leigh Woods, Bristol BS8 3PA',
			tags: ['engineering', 'brunel']
		}
	},
	// Restaurants (for category filtering demo)
	{
		id: 9,
		position: { lat: 51.5116, lng: -0.1197 },
		title: 'Dishoom Covent Garden',
		description:
			'Bombay-style cafe serving Indian comfort food in a colonial-era setting.',
		category: 'restaurant',
		iconType: 'pin',
		metadata: {
			address: "12 Upper St Martin's Lane, London WC2H 9FB",
			phone: '+44 20 7420 9320',
			hours: '08:00-23:00'
		}
	},
	{
		id: 10,
		position: { lat: 51.5137, lng: -0.0988 },
		title: 'Borough Market',
		description:
			"London's most renowned food market, offering fresh produce and street food.",
		category: 'restaurant',
		iconType: 'pin',
		metadata: {
			address: '8 Southwark St, London SE1 1TL',
			hours: 'Mon-Sat 10:00-17:00'
		}
	}
];

// =============================================================================
// ANIMATED BEAM FALLBACK DATA
// =============================================================================

/**
 * Default node configuration for uni-directional beam demo
 * Shows a simple source-to-target flow with one animated beam
 */
export const DEFAULT_BEAM_NODES_UNI: BeamNode[] = [
	{ id: 'source', x: 100, y: 200, label: 'Source' },
	{ id: 'target', x: 500, y: 200, label: 'Target' }
];

/**
 * Default connection for uni-directional demo
 * Single beam flowing from source to target
 */
export const DEFAULT_BEAM_CONNECTIONS_UNI: BeamConnection[] = [
	{ from: 'source', to: 'target' }
];

/**
 * Default node configuration for bi-directional beam demo
 * Shows two nodes with beams flowing both directions simultaneously
 */
export const DEFAULT_BEAM_NODES_BI: BeamNode[] = [
	{ id: 'a', x: 100, y: 200, label: 'A' },
	{ id: 'b', x: 500, y: 200, label: 'B' }
];

/**
 * Default connection for bi-directional demo
 * Beam flows both ways between nodes A and B
 */
export const DEFAULT_BEAM_CONNECTIONS_BI: BeamConnection[] = [
	{ from: 'a', to: 'b', bidirectional: true }
];

/**
 * Default node configuration for multiple inputs demo
 * Shows three input sources converging to a single output
 */
export const DEFAULT_BEAM_NODES_MULTI: BeamNode[] = [
	{ id: 'input1', x: 100, y: 100, label: 'Input 1' },
	{ id: 'input2', x: 100, y: 200, label: 'Input 2' },
	{ id: 'input3', x: 100, y: 300, label: 'Input 3' },
	{ id: 'output', x: 500, y: 200, label: 'Output' }
];

/**
 * Default connections for multiple inputs demo
 * Three beams from different sources converging to one target
 */
export const DEFAULT_BEAM_CONNECTIONS_MULTI: BeamConnection[] = [
	{ from: 'input1', to: 'output' },
	{ from: 'input2', to: 'output' },
	{ from: 'input3', to: 'output' }
];

// =============================================================================
// CALENDAR HEATMAP FALLBACK DATA
// =============================================================================

/**
 * Fallback calendar activity data for past 365 days
 * Simulates realistic contribution patterns:
 * - Lower activity on weekends (0-5 contributions)
 * - Higher activity on weekdays (5-20 contributions)
 * - Occasional zero days for realism
 * - Some random variation to create visual patterns
 */
export const FALLBACK_CALENDAR_DATA: CalendarDataPoint[] = (() => {
	const data: CalendarDataPoint[] = [];
	const today = new Date();

	for (let i = 0; i < 365; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		// Get day of week (0 = Sunday, 6 = Saturday)
		const dayOfWeek = date.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

		// Generate realistic activity value
		let value: number;
		if (Math.random() < 0.1) {
			// 10% chance of zero activity (no contribution)
			value = 0;
		} else if (isWeekend) {
			// Weekend: 0-5 contributions
			value = Math.floor(Math.random() * 6);
		} else {
			// Weekday: 5-20 contributions with some higher spikes
			const baseActivity = 5 + Math.floor(Math.random() * 10);
			const spike = Math.random() < 0.15 ? Math.floor(Math.random() * 6) : 0;
			value = baseActivity + spike;
		}

		// Format date as YYYY-MM-DD
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const dateString = `${year}-${month}-${day}`;

		data.push({ date: dateString, value });
	}

	// Reverse to have oldest first (more natural for calendar display)
	return data.reverse();
})();

// =============================================================================
// SUNBURST CHART FALLBACK DATA
// =============================================================================

/**
 * Default colour scheme for Sunburst chart segments
 * Categorical palette with good visual distinction
 */
export const SUNBURST_COLOR_SCHEME = [
	'#3b82f6', // blue-500
	'#10b981', // emerald-500
	'#f59e0b', // amber-500
	'#ef4444', // red-500
	'#8b5cf6', // violet-500
	'#06b6d4', // cyan-500
	'#f97316', // orange-500
	'#84cc16', // lime-500
	'#ec4899', // pink-500
	'#6366f1' // indigo-500
];

/**
 * Fallback Sunburst data representing a file system structure
 * Demonstrates hierarchical data visualization with multiple levels
 *
 * Structure:
 * - Root (Website)
 *   - src/ (source code)
 *     - components/
 *     - routes/
 *     - lib/
 *   - public/ (static assets)
 *   - config/ (configuration files)
 */
export const FALLBACK_SUNBURST_DATA: SunburstNode = {
	id: 'root',
	name: 'Website',
	children: [
		{
			id: 'src',
			name: 'src',
			color: '#3b82f6',
			children: [
				{
					id: 'components',
					name: 'components',
					children: [
						{ id: 'ui', name: 'UI', value: 120 },
						{ id: 'layout', name: 'Layout', value: 80 },
						{ id: 'forms', name: 'Forms', value: 95 },
						{ id: 'charts', name: 'Charts', value: 65 }
					]
				},
				{
					id: 'routes',
					name: 'routes',
					children: [
						{ id: 'home', name: 'Home', value: 45 },
						{ id: 'about', name: 'About', value: 30 },
						{ id: 'blog', name: 'Blog', value: 85 },
						{ id: 'api', name: 'API', value: 110 }
					]
				},
				{
					id: 'lib',
					name: 'lib',
					children: [
						{ id: 'utils', name: 'Utils', value: 55 },
						{ id: 'types', name: 'Types', value: 40 },
						{ id: 'server', name: 'Server', value: 75 }
					]
				}
			]
		},
		{
			id: 'public',
			name: 'public',
			color: '#10b981',
			children: [
				{ id: 'images', name: 'Images', value: 200 },
				{ id: 'fonts', name: 'Fonts', value: 45 },
				{ id: 'icons', name: 'Icons', value: 35 }
			]
		},
		{
			id: 'config',
			name: 'config',
			color: '#f59e0b',
			children: [
				{ id: 'svelte', name: 'Svelte Config', value: 15 },
				{ id: 'vite', name: 'Vite Config', value: 20 },
				{ id: 'tailwind', name: 'Tailwind', value: 25 },
				{ id: 'typescript', name: 'TypeScript', value: 18 }
			]
		}
	]
};

/**
 * Alternative Sunburst data: Sales breakdown by region and product
 * Useful for business analytics visualizations
 */
export const FALLBACK_SUNBURST_SALES: SunburstNode = {
	id: 'sales',
	name: 'Sales 2024',
	children: [
		{
			id: 'europe',
			name: 'Europe',
			color: '#3b82f6',
			children: [
				{
					id: 'uk',
					name: 'UK',
					children: [
						{ id: 'uk-electronics', name: 'Electronics', value: 450 },
						{ id: 'uk-clothing', name: 'Clothing', value: 320 },
						{ id: 'uk-home', name: 'Home', value: 180 }
					]
				},
				{
					id: 'germany',
					name: 'Germany',
					children: [
						{ id: 'de-electronics', name: 'Electronics', value: 380 },
						{ id: 'de-automotive', name: 'Automotive', value: 520 },
						{ id: 'de-home', name: 'Home', value: 210 }
					]
				},
				{
					id: 'france',
					name: 'France',
					children: [
						{ id: 'fr-fashion', name: 'Fashion', value: 290 },
						{ id: 'fr-food', name: 'Food', value: 340 },
						{ id: 'fr-electronics', name: 'Electronics', value: 260 }
					]
				}
			]
		},
		{
			id: 'americas',
			name: 'Americas',
			color: '#10b981',
			children: [
				{
					id: 'usa',
					name: 'USA',
					children: [
						{ id: 'us-tech', name: 'Tech', value: 780 },
						{ id: 'us-retail', name: 'Retail', value: 560 },
						{ id: 'us-services', name: 'Services', value: 420 }
					]
				},
				{
					id: 'canada',
					name: 'Canada',
					children: [
						{ id: 'ca-resources', name: 'Resources', value: 340 },
						{ id: 'ca-tech', name: 'Tech', value: 280 }
					]
				}
			]
		},
		{
			id: 'asia',
			name: 'Asia Pacific',
			color: '#f59e0b',
			children: [
				{
					id: 'japan',
					name: 'Japan',
					children: [
						{ id: 'jp-electronics', name: 'Electronics', value: 620 },
						{ id: 'jp-automotive', name: 'Automotive', value: 480 }
					]
				},
				{
					id: 'australia',
					name: 'Australia',
					children: [
						{ id: 'au-mining', name: 'Mining', value: 390 },
						{ id: 'au-services', name: 'Services', value: 270 }
					]
				}
			]
		}
	]
};

// =============================================================================
// RADIAL CLUSTER FALLBACK DATA
// =============================================================================

/**
 * Fallback hierarchical data for RadialCluster component
 * Represents a software package hierarchy similar to the D3 flare dataset
 * Used when database is unavailable
 *
 * Structure demonstrates:
 * - Multiple levels of nesting (3-4 levels deep)
 * - Varying number of children per node
 * - Mix of branch and leaf nodes
 */
export const FALLBACK_RADIAL_CLUSTER_DATA: RadialClusterNode = {
	name: 'flare',
	children: [
		{
			name: 'analytics',
			children: [
				{
					name: 'cluster',
					children: [
						{ name: 'AgglomerativeCluster', value: 3938 },
						{ name: 'CommunityStructure', value: 3812 },
						{ name: 'HierarchicalCluster', value: 6714 },
						{ name: 'MergeEdge', value: 743 }
					]
				},
				{
					name: 'graph',
					children: [
						{ name: 'BetweennessCentrality', value: 3534 },
						{ name: 'LinkDistance', value: 5731 },
						{ name: 'MaxFlowMinCut', value: 7840 },
						{ name: 'ShortestPaths', value: 5914 },
						{ name: 'SpanningTree', value: 3416 }
					]
				},
				{
					name: 'optimization',
					children: [
						{ name: 'AspectRatioBanker', value: 7074 }
					]
				}
			]
		},
		{
			name: 'animate',
			children: [
				{ name: 'Easing', value: 17010 },
				{ name: 'FunctionSequence', value: 5842 },
				{
					name: 'interpolate',
					children: [
						{ name: 'ArrayInterpolator', value: 1983 },
						{ name: 'ColorInterpolator', value: 2047 },
						{ name: 'DateInterpolator', value: 1375 },
						{ name: 'Interpolator', value: 8746 },
						{ name: 'MatrixInterpolator', value: 2202 },
						{ name: 'NumberInterpolator', value: 1382 },
						{ name: 'ObjectInterpolator', value: 1629 },
						{ name: 'PointInterpolator', value: 1675 },
						{ name: 'RectangleInterpolator', value: 2042 }
					]
				},
				{ name: 'ISchedulable', value: 1041 },
				{ name: 'Parallel', value: 5176 },
				{ name: 'Pause', value: 449 },
				{ name: 'Scheduler', value: 5593 },
				{ name: 'Sequence', value: 5534 },
				{ name: 'Transition', value: 9201 },
				{ name: 'Transitioner', value: 19975 },
				{ name: 'TransitionEvent', value: 1116 },
				{ name: 'Tween', value: 6006 }
			]
		},
		{
			name: 'data',
			children: [
				{ name: 'converters', children: [
					{ name: 'Converters', value: 721 },
					{ name: 'DelimitedTextConverter', value: 4294 },
					{ name: 'GraphMLConverter', value: 9800 },
					{ name: 'IDataConverter', value: 1314 },
					{ name: 'JSONConverter', value: 2220 }
				]},
				{ name: 'DataField', value: 1759 },
				{ name: 'DataSchema', value: 2165 },
				{ name: 'DataSet', value: 586 },
				{ name: 'DataSource', value: 3331 },
				{ name: 'DataTable', value: 772 },
				{ name: 'DataUtil', value: 3322 }
			]
		},
		{
			name: 'display',
			children: [
				{ name: 'DirtySprite', value: 8833 },
				{ name: 'LineSprite', value: 1732 },
				{ name: 'RectSprite', value: 3623 },
				{ name: 'TextSprite', value: 10066 }
			]
		},
		{
			name: 'flex',
			children: [
				{ name: 'FlareVis', value: 4116 }
			]
		},
		{
			name: 'physics',
			children: [
				{ name: 'DragForce', value: 1082 },
				{ name: 'GravityForce', value: 1336 },
				{ name: 'IForce', value: 319 },
				{ name: 'NBodyForce', value: 10498 },
				{ name: 'Particle', value: 2822 },
				{ name: 'Simulation', value: 9983 },
				{ name: 'Spring', value: 2213 },
				{ name: 'SpringForce', value: 1681 }
			]
		},
		{
			name: 'query',
			children: [
				{ name: 'AggregateExpression', value: 1616 },
				{ name: 'And', value: 1027 },
				{ name: 'Arithmetic', value: 3891 },
				{ name: 'Average', value: 891 },
				{ name: 'BinaryExpression', value: 2893 },
				{ name: 'Comparison', value: 5103 },
				{ name: 'CompositeExpression', value: 3677 },
				{ name: 'Count', value: 781 },
				{ name: 'DateUtil', value: 4141 },
				{ name: 'Distinct', value: 933 },
				{ name: 'Expression', value: 5130 },
				{ name: 'ExpressionIterator', value: 3617 },
				{ name: 'Fn', value: 3240 },
				{ name: 'If', value: 2732 },
				{ name: 'IsA', value: 2039 },
				{ name: 'Literal', value: 1214 },
				{ name: 'Match', value: 3748 },
				{ name: 'Maximum', value: 843 },
				{ name: 'methods', children: [
					{ name: 'add', value: 593 },
					{ name: 'and', value: 330 },
					{ name: 'average', value: 287 },
					{ name: 'count', value: 277 },
					{ name: 'distinct', value: 292 },
					{ name: 'div', value: 595 },
					{ name: 'eq', value: 594 },
					{ name: 'fn', value: 460 },
					{ name: 'gt', value: 603 },
					{ name: 'gte', value: 625 },
					{ name: 'iff', value: 748 },
					{ name: 'isa', value: 461 },
					{ name: 'lt', value: 597 },
					{ name: 'lte', value: 619 },
					{ name: 'max', value: 283 },
					{ name: 'min', value: 283 },
					{ name: 'mod', value: 591 },
					{ name: 'mul', value: 603 },
					{ name: 'neq', value: 599 },
					{ name: 'not', value: 386 },
					{ name: 'or', value: 323 },
					{ name: 'orderby', value: 307 },
					{ name: 'range', value: 772 },
					{ name: 'select', value: 296 },
					{ name: 'stddev', value: 363 },
					{ name: 'sub', value: 600 },
					{ name: 'sum', value: 280 },
					{ name: 'update', value: 307 },
					{ name: 'variance', value: 335 },
					{ name: 'where', value: 299 },
					{ name: 'xor', value: 354 }
				]},
				{ name: 'Minimum', value: 843 },
				{ name: 'Not', value: 1554 },
				{ name: 'Or', value: 970 },
				{ name: 'Query', value: 13896 },
				{ name: 'Range', value: 1594 },
				{ name: 'StringUtil', value: 4130 },
				{ name: 'Sum', value: 791 },
				{ name: 'Variable', value: 1124 },
				{ name: 'Variance', value: 1876 },
				{ name: 'Xor', value: 1101 }
			]
		},
		{
			name: 'scale',
			children: [
				{ name: 'IScaleMap', value: 2105 },
				{ name: 'LinearScale', value: 1316 },
				{ name: 'LogScale', value: 3151 },
				{ name: 'OrdinalScale', value: 3770 },
				{ name: 'QuantileScale', value: 2435 },
				{ name: 'QuantitativeScale', value: 4839 },
				{ name: 'RootScale', value: 1756 },
				{ name: 'Scale', value: 4268 },
				{ name: 'ScaleType', value: 1821 },
				{ name: 'TimeScale', value: 5833 }
			]
		},
		{
			name: 'util',
			children: [
				{ name: 'Arrays', value: 8258 },
				{ name: 'Colors', value: 10001 },
				{ name: 'Dates', value: 8217 },
				{ name: 'Displays', value: 12555 },
				{ name: 'Filter', value: 2324 },
				{ name: 'Geometry', value: 10993 },
				{
					name: 'heap',
					children: [
						{ name: 'FibonacciHeap', value: 9354 },
						{ name: 'HeapNode', value: 1233 }
					]
				},
				{ name: 'IEvaluable', value: 335 },
				{ name: 'IPredicate', value: 383 },
				{ name: 'IValueProxy', value: 874 },
				{
					name: 'math',
					children: [
						{ name: 'DenseMatrix', value: 3165 },
						{ name: 'IMatrix', value: 2815 },
						{ name: 'SparseMatrix', value: 3366 }
					]
				},
				{ name: 'Maths', value: 17705 },
				{ name: 'Orientation', value: 1486 },
				{
					name: 'palette',
					children: [
						{ name: 'ColorPalette', value: 6367 },
						{ name: 'Palette', value: 1229 },
						{ name: 'ShapePalette', value: 2059 },
						{ name: 'SizePalette', value: 2291 }
					]
				},
				{ name: 'Property', value: 5559 },
				{ name: 'Shapes', value: 19118 },
				{ name: 'Sort', value: 6887 },
				{ name: 'Stats', value: 6557 },
				{ name: 'Strings', value: 22026 }
			]
		},
		{
			name: 'vis',
			children: [
				{
					name: 'axis',
					children: [
						{ name: 'Axes', value: 1302 },
						{ name: 'Axis', value: 24593 },
						{ name: 'AxisGridLine', value: 652 },
						{ name: 'AxisLabel', value: 636 },
						{ name: 'CartesianAxes', value: 6703 }
					]
				},
				{
					name: 'controls',
					children: [
						{ name: 'AnchorControl', value: 2138 },
						{ name: 'ClickControl', value: 3824 },
						{ name: 'Control', value: 1353 },
						{ name: 'ControlList', value: 4665 },
						{ name: 'DragControl', value: 2649 },
						{ name: 'ExpandControl', value: 2832 },
						{ name: 'HoverControl', value: 4896 },
						{ name: 'IControl', value: 763 },
						{ name: 'PanZoomControl', value: 5222 },
						{ name: 'SelectionControl', value: 7862 },
						{ name: 'TooltipControl', value: 8435 }
					]
				},
				{
					name: 'data',
					children: [
						{ name: 'Data', value: 20544 },
						{ name: 'DataList', value: 19788 },
						{ name: 'DataSprite', value: 10349 },
						{ name: 'EdgeSprite', value: 3301 },
						{ name: 'NodeSprite', value: 19382 },
						{
							name: 'render',
							children: [
								{ name: 'ArrowType', value: 698 },
								{ name: 'EdgeRenderer', value: 5569 },
								{ name: 'IRenderer', value: 353 },
								{ name: 'ShapeRenderer', value: 2247 }
							]
						},
						{ name: 'ScaleBinding', value: 11275 },
						{ name: 'Tree', value: 7147 },
						{ name: 'TreeBuilder', value: 9930 }
					]
				},
				{
					name: 'events',
					children: [
						{ name: 'DataEvent', value: 2313 },
						{ name: 'SelectionEvent', value: 1880 },
						{ name: 'TooltipEvent', value: 1701 },
						{ name: 'VisualizationEvent', value: 1117 }
					]
				},
				{
					name: 'legend',
					children: [
						{ name: 'Legend', value: 20859 },
						{ name: 'LegendItem', value: 4614 },
						{ name: 'LegendRange', value: 10530 }
					]
				},
				{
					name: 'operator',
					children: [
						{
							name: 'distortion',
							children: [
								{ name: 'BifocalDistortion', value: 4461 },
								{ name: 'Distortion', value: 6314 },
								{ name: 'FisheyeDistortion', value: 3444 }
							]
						},
						{
							name: 'encoder',
							children: [
								{ name: 'ColorEncoder', value: 3179 },
								{ name: 'Encoder', value: 4060 },
								{ name: 'PropertyEncoder', value: 4138 },
								{ name: 'ShapeEncoder', value: 1690 },
								{ name: 'SizeEncoder', value: 1830 }
							]
						},
						{
							name: 'filter',
							children: [
								{ name: 'FisheyeTreeFilter', value: 5219 },
								{ name: 'GraphDistanceFilter', value: 3165 },
								{ name: 'VisibilityFilter', value: 3509 }
							]
						},
						{ name: 'IOperator', value: 1286 },
						{
							name: 'label',
							children: [
								{ name: 'Labeler', value: 9956 },
								{ name: 'RadialLabeler', value: 3899 },
								{ name: 'StackedAreaLabeler', value: 3202 }
							]
						},
						{
							name: 'layout',
							children: [
								{ name: 'AxisLayout', value: 6725 },
								{ name: 'BundledEdgeRouter', value: 3727 },
								{ name: 'CircleLayout', value: 9317 },
								{ name: 'CirclePackingLayout', value: 12003 },
								{ name: 'DendrogramLayout', value: 4853 },
								{ name: 'ForceDirectedLayout', value: 8411 },
								{ name: 'IcicleTreeLayout', value: 4864 },
								{ name: 'IndentedTreeLayout', value: 3174 },
								{ name: 'Layout', value: 7881 },
								{ name: 'NodeLinkTreeLayout', value: 12870 },
								{ name: 'PieLayout', value: 2728 },
								{ name: 'RadialTreeLayout', value: 12348 },
								{ name: 'RandomLayout', value: 870 },
								{ name: 'StackedAreaLayout', value: 9121 },
								{ name: 'TreeMapLayout', value: 9191 }
							]
						},
						{ name: 'Operator', value: 2490 },
						{ name: 'OperatorList', value: 5248 },
						{ name: 'OperatorSequence', value: 4190 },
						{ name: 'OperatorSwitch', value: 2581 },
						{ name: 'SortOperator', value: 2023 }
					]
				},
				{ name: 'Visualization', value: 16540 }
			]
		}
	]
};
