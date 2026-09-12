---
slug: write-request
label: "8"
phase: write
title: Write Request
layers: [bash, syscall-vfs]
keyConcept: write
simple: `write(fd, buf, count)` dispatches through `ksys_write()` to `vfs_write()`.
latency_ns: 500
---

The process copies no data yet; it passes a userspace pointer, length, and file position. `ksys_write()` validates the file descriptor (fd) and dispatches to the file's `write_iter` operation.

## Kernel

`ksys_write()` → `vfs_write()` → `ext4_buffered_write_iter()`.

## Device

No device I/O. Source buffer remains in userspace pages.
