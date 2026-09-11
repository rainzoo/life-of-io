---
slug: open-file-request
label: "2"
phase: creation
title: Open File Request
layers: [bash, syscall-vfs]
keyConcept: System call
simple: `openat()` with O_CREAT traps from ring 3 to ring 0 into `do_sys_openat2()`.
latency_ns: 1000
---

The process issues `openat(AT_FDCWD, "file.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644)`. The `syscall` instruction traps into kernel mode and dispatches to `do_sys_openat2()` → `do_filp_open()` → `path_openat()`.

## Kernel

`do_sys_openat2()` → `build_open_flags()` → `do_filp_open()` → `path_openat()`. Privilege transition from ring 3 to ring 0 on the same CPU.

## Device

No device I/O. Register and stack state conserved across the trap.
