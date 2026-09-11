---
slug: writeback-begins
label: "11"
phase: write
title: Writeback Begins
layers: [page-cache, block, nvme]
keyConcept: Writeback
simple: `ext4_writepages()` converts dirty folios to bios; data precedes metadata commit in data=ordered.
---

Writeback scans the address_space for dirty folios, locks them, and maps each range through allocated blocks. Each range becomes a `bio` with `REQ_OP_WRITE`.

## Kernel

`ext4_writepages()` → `mpage_map_and_submit_buffers()` → `submit_bio()`.

## Device

Data LBAs enter the block queue ahead of the metadata commit block.
