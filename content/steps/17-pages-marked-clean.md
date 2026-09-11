---
slug: pages-marked-clean
label: "17"
phase: write
title: Pages Marked Clean
layers: [page-cache, completion]
keyConcept: Clean folio
simple: `end_page_writeback()` clears the writeback flag after successful media write; dirty cleared at writeback start.
---

Folio flags transition from writeback to clean and up-to-date; the dirty flag cleared when writeback began. Clean folios remain cached for reads and become reclaim candidates under memory pressure.

## Kernel

`end_buffer_async_write()` → `end_page_writeback()` clears `PG_writeback` (`PG_dirty` was cleared when writeback began).

## Device

Page state now matches media. No further device traffic for these bytes.
