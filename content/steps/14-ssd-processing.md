---
slug: ssd-processing
label: "14"
phase: write
title: SSD Processing
layers: [ssd-ftl, nand]
keyConcept: FTL
simple: The Flash Translation Layer (FTL) maps Logical Block Addresses (LBAs) to physical pages, applies Error Correction Code (ECC), and schedules NAND program operations.
---

The controller translates each LBA through the logical-to-physical (L2P) table, selects a program target with wear leveling, encodes Error Correction Code (ECC), and buffers the page for NAND programming.

## Kernel

Opaque to the kernel. The Solid-State Drive (SSD) presents a flat block device; no kernel structure tracks logical-to-physical (L2P) state.

## Device

Wear leveling spreads programs across erase blocks. Background garbage collection (GC) reclaims invalid pages from overprovisioned capacity.
