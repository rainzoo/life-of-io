---
slug: read-close
label: "9"
scenario: read
phase: read
title: File Closed
layers: [bash, syscall-vfs]
keyConcept: File release
simple: `close()` drops the last file reference; `fput()` releases the struct file.
latency_ns: 500
---

`close(fd)` invokes `__close_fd()`, which detaches the descriptor and calls `fput()`. With no remaining references the struct file is freed; clean folios stay cached.

## Kernel

`__close_fd()` → `filp_close()` → `fput()`.

## Device

No device traffic. Cache and allocator state are unchanged.
