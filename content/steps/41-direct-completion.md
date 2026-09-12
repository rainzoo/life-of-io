---
slug: direct-completion
label: "4"
scenario: direct
phase: read
title: Direct Completion
layers: [nvme, block, completion]
keyConcept: Interrupt
simple: The controller posts completion entries; `blk_mq_complete_request()` ends the block I/O (bio).
latency_ns: 5000
---

The Solid-State Drive (SSD) writes completion queue entries and raises a Message Signaled Interrupts Extended (MSI-X) interrupt. The driver completes the request and wakes the process; pages never entered the page cache.

## Kernel

Non-Volatile Memory Express (NVMe) interrupt request (IRQ) → `blk_mq_complete_request()` → `bio_endio()`.

## Device

Completion entry consumed; doorbell head updated with no cache side effects.
