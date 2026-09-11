---
slug: trim-deleted-blocks
label: "20"
phase: write
title: TRIM Deleted Blocks
layers: [block, nvme, ssd-ftl, nand]
keyConcept: TRIM
simple: `blkdev_issue_discard()` sends Dataset Management (AD) for freed LBAs; the FTL erases blocks lazily.
---

On unlink or `fstrim`, the filesystem reports freed ranges. The FTL marks physical blocks erasable, reducing write amplification and restoring program performance.

## Kernel

`blkdev_issue_discard()` → NVMe Dataset Management with the AD (Deallocate) attribute.

## Device

Erase blocks return to the free pool after background erase. Subsequent writes avoid read-modify-write.
