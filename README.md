# Life of IO

Visualize how file creation works in Linux under the hood. It provides a step-by-step animation of the process, making it easier to understand the interactions between different system components.

## 🚀 Features

*   **Step-by-step animation:** Visualizes the flow of I/O operations in a clear and sequential manner.
*   **Playback controls:** Play, pause, step forward, step backward, and restart the animation.
*   **Speed control:** Adjust the animation speed to your preference.
*   **Keyboard navigation:** Use arrow keys, spacebar, and R key for intuitive control.
*   **Responsive design:** Works perfectly on desktop, tablet, and mobile devices.
*   **Metadata display:** Shows detailed information about each step of the animation.
*   **Interactive timeline:** Click and drag to jump to any step instantly.

## 🛠 Implementation

- Built with React 18 and TypeScript
- Styled with Tailwind CSS and shadcn/ui components
- Animations powered by Framer Motion
- Vite for fast development and optimized builds

## 🚀 Deployment

### Cloudflare Pages

This project is configured for seamless deployment on Cloudflare Pages:

1. **Connect your repository** to Cloudflare Pages
2. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `dist` (automatically configured)
3. **Environment variables:** None required
4. **SPA routing:** Automatic fallback to `index.html` configured

The `_redirects` file in the `public` directory ensures all routes serve your React SPA correctly.

### Local Development

```bash
# Install dependencies
npm install

# Development with Vite (recommended)
npm run dev  # → http://localhost:5174

# OR: Development with Wrangler (Cloudflare Pages simulation)
# First install wrangler globally: npm install -g wrangler
# Then build and serve locally:
npm run build && npx wrangler pages dev dist  # → http://localhost:8788

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Manual Deploy

```bash
# Build the project
npm run build

# Deploy the dist folder to any static hosting service
# Cloudflare Pages, Vercel, Netlify, etc. will all work seamlessly
```

## 🏗 Architecture

- `src/App.tsx`: Main application component with timeline logic
- `src/data/visualization-data.json`: Step definitions and metadata
- `src/components/ui/`: Reusable UI components (shadcn/ui)
- `public/_redirects`: SPA routing configuration
