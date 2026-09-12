---
slug: read-open
label: "2"
scenario: read
phase: read
title: Open for Read
layers: [bash, syscall-vfs]
keyConcept: System call
simple: `openat()` with O_RDONLY traps from ring 3 to ring 0 into `do_sys_openat2()`.
latency_ns: 1000
---

The process issues `openat(AT_FDCWD, "file.txt", O_RDONLY)`. The `syscall` instruction traps into kernel mode and dispatches to `do_sys_openat2()` → `do_filp_open()` → `path_openat()`.

## Kernel

`do_sys_openat2()` → `build_open_flags()` → `do_filp_open()` → `path_openat()`.

## Device

No device I/O. Register and stack state conserved across the trap.
