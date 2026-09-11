---
slug: mmap-teardown
label: "5"
scenario: mmap
phase: read
title: Mapping Torn Down
layers: [syscall-vfs]
keyConcept: Unmap
simple: `munmap()` tears down the virtual memory area (VMA); clean pages drop with no writeback.
latency_ns: 1000
---

`munmap(addr, len)` invokes `__vm_munmap()`, which unmaps page-table entries and drops the area via `remove_vma()`. Clean file pages return to reclaimable memory; nothing reaches the device.

## Kernel

`__vm_munmap()` → `remove_vma()` → `fput()`.

## Device

No device traffic. Reclaimable pages rejoin the free pool under pressure.
