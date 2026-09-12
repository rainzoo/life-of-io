---
slug: mmap-access
label: "4"
scenario: mmap
phase: read
title: Direct CPU Access
layers: [page-cache]
keyConcept: Direct access
simple: Later loads hit resident pages with no system calls and no copies.
latency_ns: 100
---

Subsequent accesses resolve through the page tables straight into page-cache pages. No trap, no file descriptor use, and no byte copying occurs on the hot path.

## Kernel

No kernel entry. The memory management unit (MMU) serves the mapping from resident pages.

## Device

Zero media traffic. Hot-path latency is memory latency.
