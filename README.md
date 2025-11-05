# TFE Svelte Templates

A collection of reusable, well-documented Svelte 5 component templates. Each component is production-ready, fully commented, and designed to be easily copied into your projects.

## 🎯 Project Goals

- **Human Readable**: Clear, extensive comments explaining every part of the code
- **Easily Editable**: Simple to customise and adapt to your needs
- **Copy-Paste Ready**: Just copy the component files and use them
- **Production Quality**: Built with best practices and performance in mind

## 📚 Available Templates

### CardStack Component

Interactive card fan displays with drag/swipe navigation. Perfect for image galleries, product showcases, or content carousels.

**Features:**
- Drag horizontally (desktop) or swipe vertically (mobile)
- Smooth cubic-bezier animations
- Responsive design
- Two variants: Basic and Advanced (with keyboard support)
- Fully accessible with ARIA labels

**Files:**
- [`src/lib/components/CardStack.svelte`](src/lib/components/CardStack.svelte) - Basic version
- [`src/lib/components/CardStackAdvanced.svelte`](src/lib/components/CardStackAdvanced.svelte) - Enhanced version

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
   npm install
   ```

3. **Set up environment variables (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your Neon database URL
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup (Optional)

The demo includes Neon database integration, but components work with any data source.

### Setting up Neon Database:

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy your connection string
4. Run the schema in your Neon SQL Editor:
   ```bash
   # Copy contents of database/schema.sql
   # Paste into Neon SQL Editor and execute
   ```
5. Add connection string to `.env`:
   ```
   DATABASE_URL=your_connection_string_here
   ```

**Note:** If you don't set up a database, the app will use fallback data automatically.

## 📁 Project Structure

```
tfeSvelteTemplates/
├── src/
│   ├── lib/
│   │   └── components/          # Reusable components
│   │       ├── CardStack.svelte
│   │       └── CardStackAdvanced.svelte
│   ├── routes/
│   │   ├── api/cards/
│   │   │   └── +server.ts       # API endpoint
│   │   ├── +page.svelte         # Demo page
│   │   └── +page.server.ts      # Server-side data loading
│   └── app.html                 # HTML template
├── database/
│   └── schema.sql               # Database schema & seed data
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
| `cards` | `Array` | `[]` | Array of card objects with `image`, `title`, `content` |
| `cardWidth` | `number` | `300` | Width of card container in pixels |
| `cardHeight` | `number` | `400` | Height of card container in pixels |

### Card Object Structure

```typescript
{
  image: string;      // Image URL
  title?: string;     // Optional title text
  content?: string;   // Optional HTML content
}
```

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
3. Consult the database schema for data structure

## 🎓 Learning Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Vercel Documentation](https://vercel.com/docs)

---

Built with ❤️ using Svelte 5, TypeScript, and modern web technologies.
