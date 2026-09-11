---
slug: direct-submit
label: "3"
scenario: direct
phase: read
title: Direct Submission
layers: [block, nvme]
keyConcept: Direct I/O
simple: `ext4_dio_read_iter()` pins user pages and submits Non-Volatile Memory Express (NVMe) READ commands (opcode `0x02`).
latency_ns: 10000
---

The read builds block I/O (bio) buffers directly over pinned user pages, skipping the page cache entirely. Each bio becomes an NVMe READ command with namespace, Logical Block Address (LBA), and Physical Region Page (PRP) addresses.

## Kernel

`ext4_dio_read_iter()` → `iomap_dio_rw()` → `submit_bio()`.

## Device

Direct Memory Access (DMA) lands data straight into userspace pages; no folio is allocated.
