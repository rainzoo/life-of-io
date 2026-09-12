---
slug: add-directory-entry
label: "5"
phase: creation
title: Add Directory Entry
layers: [ext4, journal]
keyConcept: Directory entry
simple: `ext4_add_entry()` inserts a directory entry (dirent) binding the filename to the inode number.
latency_ns: 3000
---

The parent directory block (or hash-indexed directory tree [htree] index) gains an `ext4_dir_entry_2` record: inode number, rec_len, name_len, file_type, name. The record belongs to the same journal transaction as the inode.

## Kernel

`ext4_add_entry()` updates the parent block or htree and marks the buffer dirty in the running transaction.

## Device

Directory block delta is journal-bound. No in-place media write yet.
