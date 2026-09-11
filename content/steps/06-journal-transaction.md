---
slug: journal-transaction
label: "6"
phase: creation
title: Journal Transaction
layers: [ext4, journal, block, nvme, ssd-ftl, nand]
keyConcept: JBD2
simple: `jbd2_journal_start()` batches inode and dirent buffers; commit writes descriptor, data, and commit blocks.
---

In `data=ordered` mode, metadata buffers join the running JBD2 transaction. `jbd2_journal_commit_transaction()` writes the transaction as sequential journal blocks: descriptor, metadata, commit.

## Kernel

`jbd2_journal_start()` → buffer credits → `jbd2_journal_commit_transaction()` issues journal bios.

## Device

Journal commit is a sequential write. Crash recovery replays or discards the transaction atomically.
