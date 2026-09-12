---
slug: read-path
label: "3"
scenario: read
phase: read
title: Cached Path Walk
layers: [syscall-vfs]
keyConcept: dentry
simple: `link_path_walk()` hits the cached parent directory entry (dentry) and returns a positive dentry.
latency_ns: 1000
---

`link_path_walk()` traverses the directory entry (dentry) cache component by component. Permission checks run via `inode_permission()` at each level. The final lookup returns the positive dentry for the existing file, unlike the negative dentry of a create path.

## Kernel

`link_path_walk()` hits dentry cache and `inode_permission()` verifies `MAY_READ` on the file.

## Device

No media access. Dentries and index nodes (inodes) are cached in RAM.
