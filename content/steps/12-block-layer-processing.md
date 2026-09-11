---
slug: block-layer-processing
label: "12"
phase: write
title: Block Layer Processing
layers: [block, nvme]
keyConcept: blk-mq
simple: `submit_bio()` builds multi-page bios; blk-mq dispatches across hardware queues.
---

Adjacent bios merge into larger segments. The mq-deadline or none scheduler orders them across blk-mq hardware contexts, tagged for NCQ depth (up to 32/128).

## Kernel

`submit_bio()` → blk-mq queue mapping → scheduler dispatch → `nvme_queue_rq()`.

## Device

No media write yet. Requests wait in submission queues with NCQ tags.
