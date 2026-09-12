# Terms

Plain-English one-liners for the most technical nouns in the visualization.
Each entry: `term | blurb`. Keep blurbs to one line; they render as tooltips.

| term | blurb |
|------|-------|
| ring 3 | Unprivileged CPU mode where user programs run; cannot touch hardware or kernel memory directly. |
| ring 0 | Privileged CPU mode where kernel code runs; user programs trap here to request services. |
| syscall trap | Controlled CPU jump from ring 3 to ring 0 that enters the kernel to perform a system call. |
| dentry | Directory entry in the kernel's path cache; maps each path component to its inode. |
| inode | Filesystem record holding a file's metadata and block map (not its name or its data). |
| folio | Kernel memory unit backing file data in the page cache; a dirty folio differs from disk. |
| dirty | Modified in RAM but not yet written to durable storage; lost on crash. |
| VMA | Virtual memory area: a process address range with permissions and a backing file or mapping. |
| page fault | CPU trap when accessing an unmapped page; the kernel maps it on demand and resumes. |
| JBD2 | Journaling Block Device 2: ext4's journaling layer that batches metadata into atomic transactions. |
| journal commit | Sealing record that makes a journal transaction atomic: replay all of it or none of it. |
| bio | Block I/O descriptor: the kernel's unit for moving folio data to and from the device. |
| blk-mq | Block multi-queue layer: merges and schedules bios across parallel hardware queues. |
| submission queue | NVMe queue where the driver posts commands for the controller to fetch. |
| completion queue | NVMe queue where the controller posts finished commands; arrival raises an interrupt. |
| doorbell | Memory-mapped register write that tells the NVMe controller new commands are queued. |
| MMIO | Memory-mapped I/O: hardware registers exposed as memory addresses the CPU reads and writes. |
| DMA | Direct memory access: hardware moving data to or from RAM without CPU involvement. |
| LBA | Logical block address: the flat block number the SSD presents to the kernel. |
| PBA | Physical block address: the actual NAND location the FTL maps each LBA to. |
| FTL | Flash translation layer: SSD firmware mapping LBAs to physical pages, since NAND cannot overwrite in place. |
| ECC | Error correction code: redundant bits letting the controller fix NAND bit errors. |
| NAND page | Smallest programmable NAND unit (tens of KiB); pages program once until their whole block erases. |
| erase block | Large NAND unit (MiB) that erases as a whole; garbage collection reclaims blocks with stale pages. |
| TRIM | Advisory command telling the SSD freed blocks need no data preserved, easing garbage collection. |
| fsync | System call forcing all of a file's dirty data and metadata to durable storage before returning. |
| O_DIRECT | Open flag bypassing the page cache: DMA transfers straight between device and pinned user buffers. |
| readahead | Kernel fetching file pages ahead of demand after observing sequential reads. |
| writeback | Background flushing of dirty folios to the device, after which they are marked clean. |
