# Animation Plan — Life of IO (Motion, calm concept illustrations)

Reference: OpenAI scaling-storage article used only for interaction language
(Play/Replay, staged captions, fixed diagrams). Not copied. Adapted to I/O stack.

## Decisions (expert)

- Library: `motion` package (`motion/react`), successor of `framer-motion`.
  Springs, variants+stagger, AnimatePresence, SVG pathLength. No GSAP/canvas.
- UX: one fixed hero canvas, one moving packet, one concept illustration per step.
  No container layout animation, no card resizing, no multi-lane flashing.
  Active station opacity 1 + glow; inactive 0.35. Max ~5 animated shapes,
  250–500ms, transform/opacity/`pathLength` only, `prefers-reduced-motion`
  renders the final frame.
- Text: eyebrow + title + 1-line `simple` caption in the title card. Full
  description plus stacked Kernel/Device sections, Terms list, and layer tags
  in the right inspector (no toggles hiding content).
- Storage correctness (invariants the visuals must preserve):
  1. Dirty folio in DRAM != durable. Durable only after journal COMMIT + fsync + NAND program.
  2. `data=ordered`: data bios complete before journal COMMIT (blocking arrow).
  3. Journal is sequential append on a ring, not random writes.
  4. Bio merge (N:1) happens in block layer before NVMe.
  5. NVMe = SQ slots + MMIO doorbell + DMA fetch + async CQ up separate rail.
  6. FTL overwrite = remap LBA->new PBA, old PBA invalid (no in-place overwrite).
  7. NAND program = page fill; erase-block constraint in caption only.
  8. Read hit / mmap-access STOP at Page Cache (packet never reaches SSD).
     O_DIRECT skips Page Cache entirely (pinned buffers). mmap fault has no copy.

## Architecture

- `/` landing page (`src/components/landing/`), `/explore` viz app.
  Legacy `/?scenario=…` links rewrite to `/explore?...` (`src/lib/route.ts`).
- `src/App.tsx` is a router shell; all viz state lives in
  `src/components/viz/VizApp.tsx` (playback, dwell, deep links).
- Center: title card (badge + caption) → `LatencyWaterfall` → `PipelineCanvas`
  (stations + spring packet + CQ rail + concept panel + color key) → `OutroBanner`
  on final steps. Left: `PhaseRail` with event dots. Right: `StepInspector`.
  Footer: `ControlBar` (transport + clean slider + `i/N` status).

## Scene map (8 shared SVG scenes for 42 steps)

1. `trap-path`: ring3->ring0 + `/ -> parent -> file.txt` walk, negative dentry for creates.
2. `ext4-alloc`: extent fill + dirent append.
3. `journal`: `descriptor -> data -> COMMIT` sequential stamp; ordered-mode gate.
4. `folio`: folios amber volatile dirty / sky clean / readahead fill.
5. `bio-merge`: 3 bios drawn into 1 request segment.
6. `nvme-queue`: SQ slots + doorbell; completion returns up the CQ rail.
7. `ftl-nand`: L2P redraw + invalidate old PBA + page program fill.
8. `read-path`: hit (stop at cache) / miss (full depth) / copy-out / fault / bypass.

Slug -> scene mapping + per-scene autoplay holds live in
`src/components/viz/scenes/hero/scene-map.ts` (`sceneForSlug`,
`SCENE_DWELL_MS`); `index.tsx` exports only the component. Hero helpers in
`hero.tsx`: `HG` stagger wrapper, `DrawLine` pathLength connectors, `Tag`
labeled boxes (fill/stroke glide on focus change), `HeroFrame` svg + caption.

## Pacing (autoplay holds after content completes)

- `SCENE_DWELL_MS` per scene at 1x (trap/ext4 3000, folio/read 3200,
  bio-merge/nvme 3600, journal/ftl 3800): enter animations finish by ~1.5s,
  the rest is hold time to read the staged caption.
- `ANIM_FLOOR_MS = 1600` in `VizApp.tsx`: `max(floor, dwell / speed)` so 3x
  never cuts content mid-animation.

## Persistence (same-scene steps don't replay)

- Concept inset keyed by **scene**, not step: elements shown in an earlier step
  stay mounted; only genuinely new elements (delta) run their entrance.
- Station glow + spring packet persist (`initial={false}`).
- Full staggered entrance plays only on first mount and on scene change.

## Content systems (source of truth in `content/`)

- `_terms.md`: 29 glossary one-liners → dotted-underline tooltips everywhere
  technical text renders + per-step "Terms in this step" list in the inspector.
- `_outros.md`: one completion row per scenario → `OutroBanner` (summary +
  guarantee + Replay) on each final step.
- Exact scenario commands (`grep` for mmap, `dd iflag=direct` for Direct I/O)
  shown as labels on the scenario tabs.
- Key events (`events.ts` map) render as dots on PhaseRail rows (including
  collapsed phase headers) with tooltips; the footer scrubber stays clean.
- Durability badge lives in the title card; canvas legend is the semantic
  color key only (amber volatile · green durable · yellow COMMIT).
- All validated by `npm run content:check` (terms parse, outros 1:1 with
  scenarios, budgets, cross-references).
