---
slug: allocate-data-blocks
label: "10"
phase: write
title: Allocate Data Blocks
layers: [ext4, journal]
keyConcept: Extent
simple: `ext4_da_write_begin()` records a delayed extent; physical blocks are chosen at writeback.
---

`ext4_insert_delayed_block()` tracks the logical range in the extent status tree with no physical blocks; `i_size` grows in memory. Physical allocation and `i_blocks` wait for writeback.

## Kernel

`ext4_buffered_write_iter()` → `ext4_da_write_begin()` → `ext4_insert_delayed_block()` (delayed extent, no blocks).

## Device

No media write and no metadata delta yet; physical allocation is deferred to writeback.
