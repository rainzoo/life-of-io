---
slug: allocate-inode
label: "4"
phase: creation
title: Allocate Inode
layers: [ext4, journal]
keyConcept: Inode
simple: `ext4_new_inode()` claims a free index node (inode) and initializes mode, user ID (UID), and timestamps.
latency_ns: 5000
---

`ext4_create()` calls `ext4_new_inode()` for the parent directory's block group. The inode bitmap flips one bit; `i_mode`, `i_uid`, `i_mtime` initialize in memory.

## Kernel

`ext4_new_inode()` scans the inode bitmap and marks the inode used via `ext4_mark_iloc_dirty()`.

## Device

Bitmap delta is journal-bound. No in-place media write yet.
