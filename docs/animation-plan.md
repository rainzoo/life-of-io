# Animation Plan — Life of IO (Motion, calm concept illustrations)

Reference: OpenAI scaling-storage article used only for interaction language
(Play/Replay, staged captions, fixed diagrams). Not copied. Adapted to I/O stack.

## Decisions (expert)

- Library: `motion` package (`motion/react`), successor of `framer-motion`.
  Springs, variants+stagger, AnimatePresence, SVG pathLength. No GSAP/canvas.
- UX: one fixed vertical spine, one moving packet, one concept inset per step.
  No container layout animation (`layout={false}`), no card resizing, no multi-lane flashing.
  Active node opacity 1 + accent ring; inactive 0.35. Max 5 animated shapes, 250–500ms,
  transform/opacity only, `prefers-reduced-motion` renders final frame.
- Text: eyebrow + title + 1-line `simple` caption. Full description/Kernel/Device in tabs.
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

## Scene map (8 shared SVG scenes for 42 steps)

1. `trap-path`: ring3->ring0 + `/ -> parent -> file.txt` walk, negative dentry for creates.
2. `ext4-alloc`: extent fill + dirent append.
3. `journal`: `descriptor -> data -> COMMIT` sequential stamp; ordered-mode gate.
4. `folio`: 6 folios amber-dashed dirty / sky-solid clean / readahead fill.
5. `bio-merge`: 3 rects merge to 1 segment.
6. `nvme-queue`: SQ slots + doorbell pulse; completion dot returns up right rail.
7. `ftl-nand`: L2P redraw + invalidate old PBA + page program fill.
8. `read-path`: hit (stop at cache) / miss (full depth) / copy-out arrow / fault / bypass.

Slug -> scene mapping lives in `src/components/viz/scenes/hero/index.tsx`
(`sceneForSlug` + `SCENE_DWELL_MS` autoplay holds).

## Pacing (autoplay holds after content completes)

- `SCENE_DWELL_MS` per scene at 1x (trap/ext4 3000, folio/read 3200,
  bio-merge/nvme 3600, journal/ftl 3800): enter animations finish by ~1.5s,
  the rest is hold time to read the staged caption.
- `ANIM_FLOOR_MS = 1600` in `App.tsx`: `max(floor, dwell / speed)` so 3x
  never cuts content mid-animation.

## Persistence (same-scene steps don't replay)

- Concept inset keyed by **scene**, not step: elements shown in an earlier step
  stay mounted; only genuinely new elements (delta) run their entrance.
- `Tag` fill/stroke/text glide via CSS 0.3s so focus recoloring cross-fades.
- Station glow + spring packet already persist (`initial={false}`).
- Full staggered entrance plays only on first mount and on scene change.

## Spine topology (fixed, never re-layouts)

Process -> VFS/Syscall -> ext4+Journal -> PageCache/Block/NVMe -> SSD+NAND,
plus permanent right completion rail. Packet = single spring-driven `motion.circle`.

## Build order

0. `framer-motion` -> `motion` imports.
1. `PipelineStack.tsx`: frozen nodes, spring packet, completion rail, inset slot.
2. `scenes/` 8 files + index.
3. `App.tsx` (caption-only card), `ControlBar.tsx` (Replay at end + i/N),
   `LatencyWaterfall.tsx` (animated heights), `StepInspector.tsx` (motion/react import).
4. `npm run content:check && npm run build`. Pilot on write path, scenes reuse for others.

## Hero canvas (write-path pilot) — cards removed

`src/components/viz/PipelineCanvas.tsx`: one fixed SVG (`viewBox 0 0 244 520`,
left rail) + concept panel (hero scenes, `viewBox 0 0 400 400`).

- Five stations at fixed cy (70/175/280/385/480), accent per lane
  (emerald/cyan/orange/amber/red). Active = opacity 1 + glow; inactive 0.35.
- Spring packet travels the spine; CQ dot returns up the permanent dashed rail.
- `src/components/viz/scenes/hero/`: 8 rescaled scenes (`hero.tsx` helpers:
  `HG` stagger wrapper, `DrawLine` pathLength connectors, `Tag` labeled boxes,
  `Stage` row annotations, `HeroFrame` svg + staged caption). Mapping reuses
  `sceneForSlug` from `src/components/viz/scenes/index.tsx`.
- Layer chips dropped; static legend row under canvas
  (amber volatile · green durable · yellow COMMIT). Layer detail stays in
  StepInspector tags.
- `App.tsx` rendered `PipelineCanvas` for `scenarioId === "write"`,
  `PipelineStack` for all other scenarios. Rollout: DONE — canvas serves all
  scenarios; `PipelineStack.tsx` and the small `scenes/` insets deleted.
  Slug mapping + per-scene dwell live in `src/components/viz/scenes/hero/`.
