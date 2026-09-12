---
slug: copy-to-page-cache
label: "9"
phase: write
title: Copy to Page Cache
layers: [page-cache]
keyConcept: Folio
simple: `__filemap_get_folio()` allocates folios; `copy_from_user()` fills them and sets dirty.
latency_ns: 500
---

The address_space (`file->f_mapping`) provides folios for the file offset. `copy_from_user()` moves bytes into kernel pages; `set_page_dirty()` marks them for writeback.

## Kernel

`__filemap_get_folio()` → `filemap_alloc_folio()` → `_copy_from_user()` → `set_page_dirty()`.

## Device

No media write. Dirty state exists only in RAM.
