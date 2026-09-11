---
slug: allocate-data-blocks
label: "10"
phase: write
title: Allocate Data Blocks
layers: [ext4, journal]
keyConcept: Extent
simple: `ext4_map_blocks()` reserves logical blocks and extends the extent tree.
---

Delayed allocation reserves blocks; the extent tree maps file offsets to logical block numbers. `i_size` and `i_blocks` update in the in-memory inode.

## Kernel

`ext4_map_blocks()` grows extents; `ext4_mark_iloc_dirty()` journals the inode delta.

## Device

No data media write yet. Allocation metadata is journal-bound.
