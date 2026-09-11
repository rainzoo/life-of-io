---
slug: direct-contrast
label: "5"
scenario: direct
phase: read
title: Bypass Tradeoff
layers: [page-cache]
keyConcept: Folio
simple: A later buffered read still misses because direct I/O cached nothing.
latency_ns: 500
---

A buffered `read()` after direct I/O finds no resident folio: bypassed bytes were never cached. The miss costs a full device fetch, showing the locality tradeoff of cache bypass.

## Kernel

`__filemap_get_folio()` misses; `page_cache_sync_readahead()` refetches from the device.

## Device

One more full device read. Bypass trades repeat-read speed for zero cache pollution.
