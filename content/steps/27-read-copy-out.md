---
slug: read-copy-out
label: "7"
scenario: read
phase: read
title: Copy to Userspace
layers: [page-cache]
keyConcept: copy
simple: `copy_page_to_iter()` moves bytes to the userspace buffer; folios stay clean.
latency_ns: 1000
---

The read path copies bytes from up-to-date kernel folios into the userspace buffer via `copy_to_user()`. No folio is marked dirty, so nothing queues for writeback.

## Kernel

`ext4_file_read_iter()` → `generic_file_read_iter()` → `copy_page_to_iter()`.

## Device

No device traffic. Clean folios remain cached for rereads and reclaim.
