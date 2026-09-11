---
slug: path-resolution
label: "3"
phase: creation
title: Path Resolution
layers: [syscall-vfs]
keyConcept: dentry
simple: `link_path_walk()` resolves the parent directory entry (dentry) and returns a negative dentry for the new name.
---

`link_path_walk()` traverses the directory entry (dentry) cache component by component. Permission checks run via `inode_permission()` at each level. The final lookup yields a negative dentry in the parent.

## Kernel

`link_path_walk()` hits dentry cache and `inode_permission()` verifies `MAY_WRITE | MAY_EXEC` on the parent.

## Device

No media access when directory entries (dentries) and index nodes (inodes) are cached in RAM.
