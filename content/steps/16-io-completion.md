---
slug: io-completion
label: "16"
phase: write
title: I/O Completion
layers: [nvme, block, completion]
keyConcept: Interrupt
simple: The controller posts completion entries; `blk_mq_complete_request()` ends the bio.
---

The SSD writes completion queue entries and raises an MSI-X interrupt. The driver reaps entries, completes the request, and `bio_endio()` propagates status up the stack.

## Kernel

NVMe IRQ → `blk_mq_complete_request()` → `bio_endio()` → `end_page_writeback()` per folio.

## Device

Completion entry consumed from the completion queue; doorbell head updated.
