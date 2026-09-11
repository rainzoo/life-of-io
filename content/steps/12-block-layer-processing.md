---
slug: block-layer-processing
label: "12"
phase: write
title: Block Layer Processing
layers: [block, nvme]
keyConcept: blk-mq
simple: `submit_bio()` builds multi-page block I/O (bio) buffers; block multi-queue (blk-mq) dispatches across hardware queues.
---

Adjacent block I/O (bio) buffers merge into larger segments. The mq-deadline or none scheduler orders them across blk-mq hardware contexts, each carrying a Non-Volatile Memory Express (NVMe) command ID with far deeper queues than Serial ATA (SATA) Native Command Queuing (NCQ)'s 32.

## Kernel

`submit_bio()` → blk-mq queue mapping → scheduler dispatch → `nvme_queue_rq()`.

## Device

No media write yet. Requests wait in submission queues with Non-Volatile Memory Express (NVMe) command IDs.
