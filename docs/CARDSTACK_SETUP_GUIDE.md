# Setup Guide

Quick start guide for getting the CardStack template example working.

## ✅ What's Done

The project is now fully set up and ready to use:

- ✅ SvelteKit project initialized with TypeScript
- ✅ Two CardStack components (Basic & Advanced) with extensive comments
- ✅ Neon database integration with fallback data
- ✅ Demo page showing both components
- ✅ API routes for dynamic data
- ✅ Public-ready .gitignore
- ✅ Complete documentation

## 🚀 Quick Start

### 1. Install Dependencies (Done)
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit http://localhost:5173 to see the demo.

### 3. (Optional) Set Up Neon Database

If you want to use dynamic data from Neon:

1. **Create a Neon Account**
   - Go to https://neon.tech
   - Create a free account

2. **Create a Database**
   - Create a new project in Neon
   - Copy your connection string from the dashboard

3. **Run the Schema**
   - Open your Neon SQL Editor
   - Copy the contents of `database/schema.sql`
   - Paste and execute in the SQL Editor
   - This creates the `cards` table and inserts sample data

4. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Neon connection string:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

5. **Restart the Dev Server**
   ```bash
   npm run dev
   ```

**Note:** The app works without database setup - it uses beautiful fallback images from Unsplash.

## 📦 Using the Components in Your Project

### Option 1: Copy Component Files

1. Copy the component(s) you need:
   - `src/lib/components/CardStack.svelte` (Basic version)
   - `src/lib/components/CardStackAdvanced.svelte` (Enhanced version)

2. Paste into your Svelte 5 project

3. Import and use:
   ```svelte
   <script>
     import CardStack from '$lib/components/CardStack.svelte';

     const cards = [
       {
         image: '/image.jpg',
         title: 'Title',
         content: 'Description'
       }
     ];
   </script>

   <CardStack {cards} />
   ```

### Option 2: Fork This Repository

1. Fork this repository on GitHub
2. Clone your fork
3. Customize the components as needed
4. Deploy to Vercel

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import project in Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository

3. Add environment variable (if using Neon):
   - In Vercel project settings
   - Add `DATABASE_URL` with your Neon connection string

4. Deploy!

The project is pre-configured with the Vercel adapter, so deployment is automatic.

## 📝 What's Included

### Components
- **CardStack.svelte** - Basic interactive card fan with drag/swipe
- **CardStackAdvanced.svelte** - Enhanced version with keyboard navigation

### Features
- Svelte 5 with runes ($state, $props)
- TypeScript support
- Responsive design (desktop & mobile)
- Accessible (ARIA labels, keyboard navigation)
- Extensive inline comments
- Server-side rendering
- API routes for data fetching

### Database (Optional)
- Neon Serverless Postgres integration
- SQL schema with seed data
- Fallback data if database not configured

## 🔧 Project Structure

```
tfeSvelteTemplates/
├── src/
│   ├── lib/components/      # Reusable components
│   ├── routes/              # Pages and API routes
│   └── app.html             # HTML template
├── database/                # SQL schema
├── static/                  # Static assets
├── .env.example             # Environment template
├── README.md                # Main documentation
└── SETUP_GUIDE.md           # This file
```

## 💡 Next Steps

1. **Explore the Demo**
   - Run `npm run dev`
   - On mobile, try swiping horizontally
   - Use arrow keys (Advanced version)

2. **Read the Code**
   - Open `src/lib/components/CardStack.svelte`
   - Read the extensive comments
   - Understand how transforms work

3. **Customize**
   - Modify colours in the CSS
   - Adjust animation timings
   - Change card dimensions
   - Add your own data

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Share your creation!

## 🐛 Troubleshooting

### "DATABASE_URL not configured" Warning
- This is normal if you haven't set up Neon
- The app will use fallback data
- Set up Neon database or ignore the warning

### TypeScript Errors in svelte-check
- These are false positives in +page.svelte
- The app runs correctly despite these warnings
- Svelte 5 syntax is sometimes misinterpreted by svelte-check

### Cards Not Showing
- Check browser console for errors
- Verify card data has `image`, `title`, and `content` properties
- Ensure image URLs are accessible

## 📚 Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

Found a bug or want to improve the templates? Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Need help? Check the inline comments in the component files - they explain everything in detail!
