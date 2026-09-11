---
slug: ssd-processing
label: "14"
phase: write
title: SSD Processing
layers: [ssd-ftl, nand]
keyConcept: FTL
simple: The FTL maps LBAs to physical pages, applies ECC, and schedules NAND program operations.
---

The controller translates each LBA through the L2P table, selects a program target with wear leveling, encodes ECC, and buffers the page for NAND programming.

## Kernel

Opaque to the kernel. The SSD presents a flat block device; no kernel structure tracks L2P state.

## Device

Wear leveling distributes programs across erase blocks. Background GC reclaims invalid pages using overprovisioned capacity.
