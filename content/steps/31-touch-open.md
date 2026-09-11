---
slug: touch-open
label: "2"
scenario: touch
phase: creation
title: Create on Open
layers: [bash, syscall-vfs, ext4, journal]
keyConcept: File descriptor
simple: `openat()` with O_CREAT claims the index node (inode); the dirent and bitmaps join one journal transaction.
latency_ns: 50000
---

The process issues `openat(AT_FDCWD, "file.txt", O_WRONLY | O_CREAT, 0666)`. Path resolution yields a negative directory entry (dentry); `ext4_create()` claims a free index node (inode), inserts the directory entry (dirent), and journals both with the bitmap delta.

## Kernel

`do_sys_openat2()` → `ext4_create()` → `ext4_new_inode()` → journal commit.

## Device

One sequential journal write makes the empty file durable (`i_size = 0`).
