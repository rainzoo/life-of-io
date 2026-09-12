---
slug: mmap-setup
label: "2"
scenario: mmap
phase: read
title: Mapping Established
layers: [syscall-vfs]
keyConcept: VMA
simple: `mmap()` creates a virtual memory area (VMA) over the file with no data copied.
latency_ns: 2000
---

`mmap(NULL, len, PROT_READ, MAP_SHARED, fd, 0)` traps into `vm_mmap_pgoff()`, which asks `ext4_file_mmap()` to attach the file to a new virtual memory area (VMA). No file bytes move; pages fault in on first touch.

## Kernel

`vm_mmap_pgoff()` → `ext4_file_mmap()` → `generic_file_mmap()`.

## Device

No device I/O. The mapping only records address range and file offset.
