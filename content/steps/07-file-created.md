---
slug: file-created
label: "7"
phase: creation
title: File Created
layers: [syscall-vfs, ext4]
keyConcept: File descriptor
simple: `dentry_open()` instantiates the struct file; `get_unused_fd_flags()` returns the fd.
---

VFS instantiates the dentry/inode pair and allocates the lowest free file descriptor. `open()` returns the fd; `ls` resolves the new dirent.

## Kernel

`dentry_open()` constructs `struct file`; `get_unused_fd_flags()` plus `fd_install()` publishes the fd to the process table.

## Device

Metadata durable after journal commit. No file data exists yet (`i_size = 0`).
