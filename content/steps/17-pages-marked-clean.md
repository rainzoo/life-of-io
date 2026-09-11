---
slug: pages-marked-clean
label: "17"
phase: write
title: Pages Marked Clean
layers: [page-cache, completion]
keyConcept: Clean folio
simple: `end_page_writeback()` clears dirty and writeback flags after successful media write.
---

Folio flags transition from dirty + writeback to clean and up-to-date. Clean folios remain cached for reads and become reclaim candidates under memory pressure.

## Kernel

`end_buffer_async_write()` → `end_page_writeback()` clears `PG_dirty` and `PG_writeback`.

## Device

Page state now matches media. No further device traffic for these bytes.
