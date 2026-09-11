# Life of IO

Visualize the life of a single I/O operation in Linux: from file creation command to data persistence on disk. This interactive web application provides a step-by-step animation that reveals the complex interactions between user space, file systems, kernel subsystems, and SSD hardware, making low-level I/O operations accessible and understandable.

## 🚀 Features

*   **Interactive Timeline:** Navigate through 34+ steps of I/O operations with play/pause controls
*   **Layer-by-layer Visualization:** See data flow across User Space, File System (ext4), Kernel subsystems, and NVMe/SSD hardware
*   **Playback Controls:** Play, pause, step forward/backward, restart, and speed adjustment (1x-3x)
*   **Keyboard Navigation:** Arrow keys for prev/next, Space/Enter for play/pause, R for restart
*   **Responsive Design:** Optimized layouts for desktop, tablet, and mobile devices
*   **Detailed Metadata:** Kernel and hardware focus sections explain each step's technical details
*   **Interactive Slider:** Jump directly to any step in the I/O path
*   **Phase Overview:** Colored sections for Bash command, File creation, and Data persistence
*   **Collapsible Step Navigator:** Quick access to jump between visualization steps

## 🛠 Implementation

- Built with React 18, TypeScript, and Suspense for optimized performance
- Styled with Tailwind CSS and shadcn/ui component library
- Smooth animations powered by Framer Motion with AnimatePresence
- Fast development and production builds with Vite
- Static deployment ready with SPA routing support

## 📊 Data Structure

The visualization is structured in three main phases with detailed step-by-step progression:

### Phases
1. **Bash** (Steps 0.1–0.6): User space command execution
2. **Creation** (Steps 1–15): File creation and metadata operations
3. **Write & Persist** (Steps 16–34): Data writing and persistence

### Layers Overview
The I/O path spans multiple system layers:

- **User Space**: `bash` shell execution
- **File System**: `syscall-vfs`, `ext4` file system, `journal` (JBD2)
- **Kernel**: `page-cache`, `block` layer I/O scheduling, `completion` queue
- **Storage Device**: `nvme` driver, `ssd-ftl` flash translation layer, `nand` flash memory

Each step highlights active layers and provides kernel/hardware-specific technical context.

## 🚀 Deployment

### Cloudflare Pages (Recommended)

This project is optimized for Cloudflare Pages static hosting:

1. **Repository Connection**: Link your GitHub/GitLab repository
2. **Build Configuration:**
   - Build command: `npm run build`
   - Build output: `dist/`
   - Node.js version: 18+
3. **Automatic Routing**: SPA fallback handled by `_redirects` file

### Local Development

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev  # → http://localhost:5173

# OR: Cloudflare Pages simulation
npm run build && npx wrangler pages dev dist  # → http://localhost:8788

# Production build
npm run build

# Preview build locally
npm run preview
```

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ directory contents to any static hosting provider
# Compatible with: Cloudflare Pages, Vercel, Netlify, GitHub Pages, etc.
```

## 🏗 Project Structure

```
content/                         # Source of truth — pure Markdown, edit these
├── README.md                    # Authoring guide + rules
├── _meta.md                     # Document title, command, filesystem, device
├── _phases.md                   # Phase table (id, label, blurb)
├── _layers.md                   # Layer table (id, name, description)
└── steps/                       # One Markdown file per step (01-…N)
    ├── 01-command-execution.md
    └── …                         # frontmatter (slug, label, phase, layers,…)
                                   # + body, `## Kernel`, `## Device`

src/
├── App.tsx                    # State, keyboard nav, playback, layout
├── main.tsx                   # React application entry point
├── index.css                  # Tailwind CSS styles and theme variables
├── content/
│   ├── schema.ts              # Canonical types (PhaseId, LayerId, Step, …)
│   ├── theme.ts               # Design mapping — labels, classes, pipeline lanes
│   └── load.ts                # Parses + validates Markdown at build time
├── components/
│   ├── ui/                    # shadcn/ui component library re-exports
│   └── viz/                   # Custom visualization components
│       ├── PhaseBadge.tsx     # Phase indicator badges
│       ├── PhaseRail.tsx      # Phase navigation rail
│       ├── PipelineStack.tsx  # Request-travels-through cross-section + durability
│       ├── StepInspector.tsx  # Current step details (Kernel/Device tabs)
│       └── TraceScrubber.tsx  # Step scrubber with event markers
├── lib/
│   └── utils.ts               # Utility functions

scripts/
└── content-check.mjs          # Validates content/ (`npm run content:check`)

public/
├── _redirects                 # SPA routing configuration for static hosting
├── favicon.svg                # Site favicon
└── ...
```

## 🔧 Configuration

- **ESLint**: Flat config with React hooks and refresh rules
- **TypeScript**: Strict mode with path mapping
- **Vite**: Optimized for React with preload and minification
- **Tailwind**: Responsive design with dark theme support
