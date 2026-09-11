---
slug: touch-timestamps
label: "3"
scenario: touch
phase: creation
title: Timestamps Committed
layers: [syscall-vfs, ext4, journal]
keyConcept: Timestamps
simple: `futimens()` refreshes access and modification timestamps through one journal commit.
latency_ns: 30000
---

`futimens(fd, NULL)` invokes `do_futimens()`, which routes through `notify_change()` to update `i_atime` and `i_mtime` in memory. The inode delta joins a Journaling Block Device 2 (JBD2) transaction and commits.

## Kernel

`do_futimens()` → `notify_change()` → `jbd2_journal_commit_transaction()`.

## Device

Sequential journal write carries the timestamp delta; checkpoint writes it in place.
