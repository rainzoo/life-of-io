---
slug: fsync-durability
label: "19"
phase: write
title: fsync Durability
layers: [syscall-vfs, ext4, journal, block, nvme, ssd-ftl, nand, completion]
keyConcept: fsync
simple: `ext4_sync_file()` forces writeback, journal commit, and cache flush before return.
---

`fsync()` blocks until data pages, metadata transaction, and device volatile caches reach stable storage. Return value zero means power-loss safe.

## Kernel

`ext4_sync_file()` → `file_write_and_wait_range()` → journal commit → `blkdev_issue_flush()`.

## Device

Non-Volatile Memory Express (NVMe) FLUSH or cache flush drains controller Dynamic Random-Access Memory (DRAM) to NAND before completion.
