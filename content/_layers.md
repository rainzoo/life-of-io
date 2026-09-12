# Layers

| id | name | description |
|----|------|-------------|
| bash | Shell Process | Command parsing and syscall issuance |
| syscall-vfs | VFS Layer | Virtual File System (VFS) dispatch and path resolution |
| ext4 | ext4 Filesystem | Inode (index node), extent, and directory management |
| journal | Journal (Journaling Block Device 2 [JBD2]) | Ordered transaction logging for crash atomicity |
| page-cache | Page Cache | Folio cache for buffered file data |
| block | Block Layer | block I/O (bio) construction, merging, and block multi-queue (blk-mq) scheduling |
| nvme | NVMe Driver | Non-Volatile Memory Express (NVMe) submission and completion queue management over Peripheral Component Interconnect Express (PCIe) |
| ssd-ftl | SSD Controller | Solid-State Drive (SSD) logical-to-physical (L2P) mapping, wear leveling, garbage collection (GC) |
| nand | NAND Flash | Charge-based persistent cell storage |
| completion | Completion | Interrupt-driven I/O completion signaling |
