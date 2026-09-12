---
slug: read-inode
label: "4"
scenario: read
phase: read
title: File Opened for Read
layers: [syscall-vfs, ext4]
keyConcept: File descriptor
simple: `dentry_open()` instantiates the struct file; `get_unused_fd_flags()` returns the file descriptor (fd).
latency_ns: 1000
---

Virtual File System (VFS) instantiates the directory entry (dentry)/index node (inode) pair and allocates the lowest free file descriptor (fd). Access-time refresh is usually skipped under relative atime (relatime).

## Kernel

`dentry_open()` constructs `struct file`; `get_unused_fd_flags()` plus `fd_install()` publishes the fd.

## Device

No media write. A first read after a write may journal an atime refresh; steady rereads skip it.
