---
slug: nvme-command-submission
label: "13"
phase: write
title: NVMe Command Submission
layers: [nvme]
keyConcept: Submission queue
simple: `nvme_queue_rq()` posts WRITE commands and rings the doorbell register.
---

Each block I/O (bio) maps to Non-Volatile Memory Express (NVMe) WRITE commands with namespace, Logical Block Address (LBA), and Physical Region Page (PRP)/Scatter-Gather List (SGL) addresses. A doorbell write notifies the controller over Peripheral Component Interconnect Express (PCIe).

## Kernel

`nvme_queue_rq()` builds WRITE command (opcode `0x01`), updates the submission queue tail, and rings the memory-mapped I/O (MMIO) doorbell.

## Device

Controller fetches commands via PCIe Direct Memory Access (DMA). Gen4 x4 link: ~7 GB/s, sub-10 µs submission latency.
