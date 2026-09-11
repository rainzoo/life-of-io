---
slug: direct-open
label: "2"
scenario: direct
phase: read
title: Open with O_DIRECT
layers: [bash, syscall-vfs]
keyConcept: O_DIRECT
simple: `openat()` with O_DIRECT and O_RDONLY traps into `do_sys_openat2()` with alignment rules armed.
latency_ns: 1000
---

The process issues `openat(AT_FDCWD, "file.txt", O_RDONLY | O_DIRECT)`. Flag validation rejects misaligned later use; the open itself follows the standard `do_filp_open()` path and returns a file descriptor (fd).

## Kernel

`do_sys_openat2()` → `build_open_flags()` → `do_filp_open()`.

## Device

No device I/O. Alignment is enforced on later reads, not at open.
