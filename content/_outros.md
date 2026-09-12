# Outros

One completion row per scenario: `scenario | title | outcome | guarantee`.
Rendered as a banner under the canvas on the scenario's final step.

| scenario | title | outcome | guarantee |
|----------|-------|---------|-----------|
| write | Write complete — file durable | Bytes traveled shell → page cache → journal → NAND; TRIM reclaims what the file replaced. | `fsync` returned, so a crash loses nothing; step 20 TRIM is lifecycle hygiene, not the durability point. |
| read | Read complete — bytes delivered | Bytes traveled NAND → folios → userspace buffer; the cache stays warm for the next read. | No data changed, so there is nothing to persist; repeat reads are served from DRAM. |
| touch | Metadata complete — timestamps durable | Timestamps traveled VFS → inode → one journal commit. | The commit record makes the update atomic: replay all of it or none of it. |
| mmap | Mapping complete — access without copies | Pages faulted into the VMA on demand; the CPU read DRAM directly with no `copy_to_user`. | Clean pages need no writeback; teardown simply unmaps them. |
| direct | Direct I/O complete — zero cache footprint | Pinned user buffers DMAed straight to and from the device, bypassing the page cache entirely. | Nothing was cached, so nothing needs flushing; a later buffered read will miss and refetch. |
