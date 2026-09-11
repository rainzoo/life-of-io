---
slug: nvme-command-submission
label: "13"
phase: write
title: NVMe Command Submission
layers: [nvme]
keyConcept: Submission queue
simple: `nvme_queue_rq()` posts WRITE commands and rings the doorbell register.
---

Each bio maps to one or more NVMe WRITE commands (opcode `0x01`) with namespace, LBA, and PRP/SGL addresses. The doorbell write notifies the controller over PCIe.

## Kernel

`nvme_queue_rq()` constructs the command, updates the submission queue tail, and performs the MMIO doorbell write.

## Device

Controller fetches commands via PCIe DMA. Gen4 x4 link: ~7 GB/s, sub-10 µs submission latency.
