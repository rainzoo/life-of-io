---
slug: read-cache-miss
label: "5"
scenario: read
phase: read
title: Cache Miss
layers: [page-cache]
keyConcept: Folio
simple: `__filemap_get_folio()` finds no up-to-date folio and flags a cache miss for the file offset.
latency_ns: 500
---

The address_space (`file->f_mapping`) holds no up-to-date folio for the offset. The miss triggers synchronous readahead instead of blocking on a single page.

## Kernel

`__filemap_get_folio()` returns no folio; `page_cache_sync_readahead()` starts sequential readahead.

## Device

No media traffic yet. The miss only marks which ranges readahead must fetch.
