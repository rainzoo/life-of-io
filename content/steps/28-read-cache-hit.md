---
slug: read-cache-hit
label: "8"
scenario: read
phase: read
title: Cache Hit
layers: [page-cache]
keyConcept: Clean folio
simple: A reread finds up-to-date folios and serves bytes with zero device I/O.
latency_ns: 300
---

The second `read()` hits resident, up-to-date folios in the address_space. Bytes copy straight to userspace; the block layer and device stay idle.

## Kernel

`__filemap_get_folio()` returns the resident folio; `copy_page_to_iter()` fills the buffer.

## Device

Zero media traffic. The hit path never leaves the CPU and RAM.
