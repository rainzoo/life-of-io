---
slug: metadata-commit
label: "18"
phase: write
title: Metadata Commit
layers: [ext4, journal, block, nvme, ssd-ftl, nand]
keyConcept: Journal commit
simple: `jbd2_journal_commit_transaction()` writes the commit block after data reaches final LBAs.
---

The size and extent updates commit only after the ordered data writes complete. The commit block makes the transaction replay-safe; checkpointing later writes metadata in place.

## Kernel

`jbd2_journal_commit_transaction()` emits the commit block and wakes checkpointing.

## Device

Sequential commit write. Metadata in final locations updates during checkpoint.
