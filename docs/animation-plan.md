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

Slug -> scene mapping lives in `src/components/viz/scenes/index.ts`.

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
