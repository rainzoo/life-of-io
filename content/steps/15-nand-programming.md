---
slug: nand-programming
label: "15"
phase: write
title: NAND Programming
layers: [nand]
keyConcept: NAND page
simple: Charge pumps program 16 KiB pages in ~100 µs–2 ms depending on cell type; cells store 1–4 bits per cell (Single-Level Cell [SLC], Multi-Level Cell [MLC], Triple-Level Cell [TLC], Quad-Level Cell [QLC]).
---

Program operations inject charge into the charge-trap layer (planar NAND used floating gates). The controller verifies thresholds and retries or relocates on bit errors beyond Error Correction Code (ECC) correction capacity.

## Kernel

No kernel involvement. Completion arrives later via interrupt.

## Device

Page program latency ~100 µs–2 ms depending on cell density (SLC→TLC). Block erase (128–512 pages) precedes reuse and takes milliseconds.
