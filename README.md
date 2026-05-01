# TFE Svelte Templates

A collection of reusable, well-documented Svelte 5 component templates. Each component is production-ready, fully commented, and designed to be easily copied into your projects.

## 🎯 Project Goals

- **Human Readable**: Clear, extensive comments explaining every part of the code
- **Easy to Edit**: Simple to customise and adapt to your needs
- **Copy-Paste Ready**: Just copy the component files and use them
- **Production Quality**: Built with best practices and performance in mind

## 📚 Available Templates

### 1. CardStack Component (2 variants)

Interactive horizontal card displays with hover and swipe interactions. Perfect for image galleries, product showcases, or content carousels.

**Variants:**
- [`CardStack.svelte`](src/lib/components/CardStack.svelte) - Interactive selection with direction-detecting hover, keyboard nav, swipe gestures
- [`CardStackMotionFlip.svelte`](src/lib/components/CardStackMotionFlip.svelte) - 3D roll effect with 4-directional swipe using FLIP animation

### 2. Marquee Component (2 variants)

Infinite scrolling content displays for logos, testimonials, or featured content.

**Variants:**
- [`Marquee.svelte`](src/lib/components/Marquee.svelte) - Static scroll with pause-on-hover
- [`MarqueeDraggable.svelte`](src/lib/components/MarqueeDraggable.svelte) - Interactive with drag-to-scroll and momentum

### 3. MagicCard Component

Cards with mouse-tracking spotlight effects and dynamic border glow. Perfect for feature highlights or premium content.

**File:** [`MagicCard.svelte`](src/lib/components/MagicCard.svelte)

### 4. ShineBorder Component

Animated border wrapper with horizontal shine animation. Zero dependencies, pure CSS animations.

**File:** [`ShineBorder.svelte`](src/lib/components/ShineBorder.svelte)

### 5. SwishButton Component

Animated CTA button with text slide animation and background expansion. No icon library dependencies.

**File:** [`SwishButton.svelte`](src/lib/components/SwishButton.svelte)

### 6. ExpandingCard Component

Card with layout transitions between compact and expanded states using Svelte's built-in transitions.

**File:** [`ExpandingCard.svelte`](src/lib/components/ExpandingCard.svelte)

### 7. LinkImageHover Component

Links with image preview on hover using blur transitions. Perfect for documentation and references.

**File:** [`LinkImageHover.svelte`](src/lib/components/LinkImageHover.svelte)

### 8. Navbar Component

Responsive navigation with mobile hamburger menu and smooth panel animations.

**File:** [`Navbar.svelte`](src/lib/components/Navbar.svelte)

### 9. StaggeredMenu Component

Animated navigation menu with staggered entrance animations and active state highlighting.

**File:** [`StaggeredMenu.svelte`](src/lib/components/StaggeredMenu.svelte)

## 🚀 Quick Start

### Option 1: Copy Components Only

1. Copy the component file(s) you need from `src/lib/components/`
2. Paste into your Svelte 5 project
3. Import and use:

```svelte
<script>
  import CardStack from '$lib/components/CardStack.svelte';

  const cards = [
    { image: '/image.jpg', title: 'Title', content: 'Description' }
  ];
</script>

<CardStack {cards} />
```

### Option 2: Run the Full Demo

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tfeSvelteTemplates
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your Neon database URL
   ```

4. **Run the development server:**
   ```bash
   bun run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

The component demos now label whether data came from the database, static fixtures, or a database error path. Authentication and write flows require a real Postgres connection.

### Setting up Neon Database:

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy your connection string
4. Run the database schemas in your Neon SQL Editor:
   ```bash
   # Auth tables
   database/schema_better_auth.sql

   # Component demo tables
   database/schema.sql
   database/schema_v2.sql
   ```
5. Add connection string to `.env`:
   ```
   DATABASE_URL=your_connection_string_here
   BETTER_AUTH_SECRET=your_long_random_secret
   BETTER_AUTH_URL=http://localhost:5173
   ```

Auth pages show "Auth Offline" until `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` are configured.

For local OSS demos, you can seed an explicit demo login after the auth schema exists:

```bash
bun run seed:demo-user
```

That creates `tester@test.com` with password `test1`. The seed is manual-only and refuses to run with `NODE_ENV=production` unless explicitly overridden.

For the hosted OSS demo, set `PUBLIC_DEMO_AUTH=true` after seeding the demo database. That exposes a "Try demo" login on the sign-in page. The public demo account is treated as read-only for mutating API routes until user-owned demo data is in place.

## 📁 Project Structure

```
tfeSvelteTemplates/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable components
│   │   │   ├── CardStack.svelte
│   │   │   ├── Marquee.svelte
│   │   │   ├── ExpandingCard.svelte
│   │   │   ├── LinkImageHover.svelte
│   │   │   └── DatabaseStatus.svelte
│   │   ├── server/              # Server utilities
│   │   │   ├── cards.ts
│   │   │   ├── testimonials.ts
│   │   │   ├── expandingCards.ts
│   │   │   └── linkPreviews.ts
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── constants.ts         # Demo fixture data
│   │   └── utils.ts             # Helper functions
│   ├── routes/
│   │   ├── api/cards/
│   │   │   └── +server.ts       # API endpoint
│   │   ├── +page.svelte         # Home page
│   │   ├── +page.server.ts      # Server-side data loading
│   │   ├── cardstack/
│   │   ├── marquee/
│   │   ├── expandingcard/
│   │   └── linkimagehover/
│   └── app.html                 # HTML template
├── database/
│   ├── schema.sql               # CardStack data schema
│   └── schema_v2.sql            # Additional components schema
├── static/                      # Static assets
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
├── svelte.config.js             # SvelteKit configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Language**: TypeScript
- **Database**: [Neon](https://neon.tech) (Serverless Postgres)
- **Hosting**: [Vercel](https://vercel.com)
- **Styling**: Scoped CSS (no external dependencies)

## 📝 Component Documentation

Each component includes:
- **Extensive inline comments** explaining logic and behaviour
- **JSDoc-style documentation** for props and functions
- **Usage examples** in the demo page
- **Customisation guidance** in comments

### CardStack Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `Card[]` | `[]` | Array of card objects with `image`, `title`, `content` |
| `cardWidth` | `number` | `300` | Width of card container in pixels |
| `cardHeight` | `number` | `400` | Height of card container in pixels |
| `partialRevealSide` | `'left' \| 'right'` | `'right'` | Which side stays hidden on hover |

### Card Object Structure

```typescript
interface Card {
  image?: string;      // Optional image URL
  title?: string;      // Optional title text
  content?: string;    // Optional HTML content
}
```

All properties are optional, allowing flexibility in card content.

## 🎨 Customisation

All components are designed to be easily customised:

1. **Colours**: Modify the CSS variables and colours in the `<style>` section
2. **Dimensions**: Pass `cardWidth` and `cardHeight` props
3. **Animations**: Adjust transition timings in the CSS
4. **Rotation**: Modify rotation calculations in the transform functions

## 🚢 Deployment

### Deploy to Vercel:

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (DATABASE_URL if using Neon)
4. Deploy!

The project is pre-configured with the Vercel adapter.

## 🔒 Security

- `.env` files are excluded from git via `.gitignore`
- `.env.example` provided as a template (no sensitive data)
- Database credentials only used server-side
- No hardcoded secrets in the codebase

## 📜 License

This project is intended as a template collection. Feel free to use, modify, and integrate these components into your projects.

## 🤝 Contributing

This is a template library. If you create additional templates following the same principles (well-commented, easy to use, production-ready), contributions are welcome!

## 📞 Support

For issues or questions:
1. Check component comments for implementation details
2. Review the demo page for usage examples
3. Consult the database schema at [database/schema.sql](database/schema.sql) for data structure

## 🌐 Browser Compatibility

### Modern Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Opera 76+

### Features Used
- CSS Grid and Flexbox
- CSS Custom Properties (CSS Variables)
- CSS Transforms and Transitions
- Touch Events API
- Backdrop Filter (progressive enhancement)

**Note:** Backdrop filter may not work on older browsers but degrades gracefully.

## 💻 Requirements

### Development
- Node.js 18.x or higher
- bun 1.0.0 or higher

### Optional
- Neon account for database hosting
- Vercel account for deployment

## 🐛 Troubleshooting

### Cards Not Displaying
- Ensure `cards` array is passed to the component
- Check browser console for errors
- Verify images URLs are accessible

### Database Connection Issues
- Verify `DATABASE_URL` is set in `.env`
- Check Neon database is running
- Review server console for error messages
- Verify `database/schema_better_auth.sql` has been run before using auth

### Build Errors
- Run `bun install` to ensure dependencies are up-to-date
- Clear `.svelte-kit` directory and rebuild
- Check Node.js version matches requirements

## 🎓 Learning Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Vercel Documentation](https://vercel.com/docs)

---

Built with Svelte 5, TypeScript, and modern web technologies.
