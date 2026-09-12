# Life of IO

Visualize the life of a single I/O operation in Linux: from file command to data persistence on disk. This interactive web application provides step-by-step animations that reveal the complex interactions between user space, file systems, kernel subsystems, and SSD hardware, making low-level I/O operations accessible and understandable.

## 🚀 Features

*   **Five scenarios:** Write path (`echo > file`, 20 steps), Read path (`cat`, 9 steps), Metadata only (`touch`, 3 steps), Memory map (`grep`, 5 steps), Direct I/O (`dd iflag=direct`, 5 steps)
*   **Interactive Timeline:** Navigate steps with play/pause controls and per-scenario auto-play pacing
*   **Layer-by-layer Visualization:** See data flow across User Space, File System (ext4), Kernel subsystems, and NVMe/SSD hardware, with animated per-lane state (folios, journal, bio merge, L2P map, NAND cells)
*   **Latency Waterfall:** Order-of-magnitude per-step timings on a log scale — click any bar to jump
*   **Playback Controls:** Play, pause, step forward/backward, restart, and speed adjustment (1x-3x)
*   **Keyboard Navigation:** Arrow keys for prev/next, Space/Enter for play/pause, R for restart
*   **Responsive Design:** Optimized layouts for desktop, tablet, and mobile devices
*   **Detailed Metadata:** Kernel and hardware focus sections explain each step's technical details
*   **Interactive Slider:** Jump directly to any step in the I/O path, with event markers (COMMIT, CQ, TRIM, …)
*   **Phase Overview:** Colored sections for Command, File creation, Data persistence, and Data read
*   **Collapsible Step Navigator:** Quick access to jump between visualization steps

## 🛠 Implementation

- Built with React 19, TypeScript, and Vite for fast development and production builds
- Styled with Tailwind CSS and shadcn/ui component library
- Smooth animations powered by Motion (gated by `prefers-reduced-motion`)
- Static deployment ready with SPA routing support

## 📊 Data Structure

The visualization is structured in scenarios, each with its own step sequence.
Labels restart at "1" per scenario; slugs are globally unique for deep links
(`?scenario=read&step=2`).

### Scenarios

| Scenario | Command | Steps | Persistence |
|----------|---------|-------|-------------|
| Write path | `echo "Hello" > file.txt` | 20 | Yes (durability badge) |
| Read path | `cat file.txt` | 9 | No |
| Metadata only | `touch file.txt` | 3 | Yes |
| Memory map | `grep "Hello" file.txt` | 5 | No |
| Direct I/O | `dd if=file.txt of=/dev/null iflag=direct` | 5 | No |

### Phases

1. **Bash** (Command): User space command execution
2. **Creation** (File Creation): File creation and metadata operations
3. **Write** (Data Write & Persistence): Data writing and persistence
4. **Read** (Data Read): Opens, cache lookup, readahead, and copy-out

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
├── _meta.md                     # Document title, filesystem, device, intro
├── _scenarios.md                # Scenario table (id, label, command, persistent, blurb)
├── _phases.md                   # Phase table (id, label, blurb)
├── _layers.md                   # Layer table (id, name, description)
└── steps/                       # One Markdown file per step, filename-ordered
    ├── 01-command-execution.md
    └── …                         # frontmatter (slug, label, scenario, phase,
                                    # title, layers, latency_ns, …)
                                    # + body, `## Kernel`, `## Device`

src/
├── App.tsx                    # State, keyboard nav, playback, layout
├── main.tsx                   # React application entry point
├── index.css                  # Tailwind CSS styles and theme variables
├── content/
│   ├── schema.ts              # Canonical types (PhaseId, LayerId, Step, …)
│   ├── theme.ts               # Design mapping — labels, classes, pipeline lanes
│   └── load.ts                # Parses + validates Markdown at build time
│                               # (per-scenario ordering, latency, scenarios)
├── components/
│   ├── ui/                    # shadcn/ui component library re-exports
│   └── viz/                   # Custom visualization components
│       ├── PhaseBadge.tsx     # Phase indicator badges
│       ├── PhaseRail.tsx      # Phase navigation rail (per-scenario phases)
│       ├── PipelineCanvas.tsx # Hero I/O cross-section + durability (all scenarios)
│       ├── scenes/hero/       # Shared SVG concept scenes (slug-mapped, 8 scenes)
│       ├── LatencyWaterfall.tsx # Log-scale per-step latency strip
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
