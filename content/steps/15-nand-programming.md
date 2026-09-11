---
slug: nand-programming
label: "15"
phase: write
title: NAND Programming
layers: [nand]
keyConcept: NAND page
simple: Charge pumps program 16 KiB pages in ~100–500 µs; cells store 1–4 bits (SLC/MLC/TLC/QLC).
---

Program operations inject charge into floating gates. The controller verifies thresholds and retries or relocates on bit errors beyond ECC correction capacity.

## Kernel

No kernel involvement. Completion arrives later via interrupt.

## Device

Page program latency ~100–500 µs. Block erase (128–512 pages) precedes reuse and takes milliseconds.
