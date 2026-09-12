---
slug: read-readahead
label: "6"
scenario: read
phase: read
title: Readahead Fetch
layers: [page-cache, block, nvme]
keyConcept: Readahead
simple: `ext4_mpage_readpages()` maps extents and submits Non-Volatile Memory Express (NVMe) READ commands (opcode `0x02`).
latency_ns: 100000
---

Readahead maps the file range through allocated extents into one or more block I/O (bio) buffers with `REQ_OP_READ`. Each bio becomes an NVMe READ command carrying namespace, Logical Block Address (LBA), and Physical Region Page (PRP) addresses.

## Kernel

`ext4_mpage_readpages()` → `ext4_map_blocks()` → `submit_bio()`.

## Device

Data arrives via Peripheral Component Interconnect Express (PCIe) Direct Memory Access (DMA); completion marks folios up-to-date.
