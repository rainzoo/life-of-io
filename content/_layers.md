# Layers

| id | name | description |
|----|------|-------------|
| bash | Shell Process | Command parsing and syscall issuance |
| syscall-vfs | VFS Layer | Virtual filesystem dispatch and path resolution |
| ext4 | ext4 Filesystem | Inode, extent, and directory management |
| journal | Journal (JBD2) | Ordered transaction logging for crash atomicity |
| page-cache | Page Cache | Folio cache for buffered file data |
| block | Block Layer | bio construction, merging, and blk-mq scheduling |
| nvme | NVMe Driver | Submission and completion queue management over PCIe |
| ssd-ftl | SSD Controller | Logical-to-physical mapping, wear leveling, GC |
| nand | NAND Flash | Charge-based persistent cell storage |
| completion | Completion | Interrupt-driven I/O completion signaling |
