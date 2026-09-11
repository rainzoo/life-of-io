---
slug: mmap-fault
label: "3"
scenario: mmap
phase: read
title: First Fault
layers: [page-cache, block, nvme]
keyConcept: Page fault
simple: First touch faults; `filemap_fault()` resolves the folio and fetches it from the device on a miss.
latency_ns: 100000
---

The first load from the mapping raises a page fault. `filemap_fault()` looks up the folio in the address_space and, on a miss, drives `ext4_mpage_readpages()` to submit the device read; the faulting thread sleeps until completion.

## Kernel

`filemap_fault()` → `__filemap_get_folio()` → `ext4_mpage_readpages()`.

## Device

One device read fills the faulted folio; the page table then maps it.
