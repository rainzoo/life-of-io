# Visualisation

Create an interactive timeline slider visualization for the process of creating a file and persisting data in Linux using ext4 on a modern SSD (NVMe/SATA with TRIM, NCQ, FTL). Base it on these exact 43 steps, grouped into phases, with color-coded layers and animated components for technical detail:

**Phase 0: Bash Shell Command Entry (Steps 0.1–0.6, Green)**

- 0.1: User types command (e.g., echo "Hello world" > newfile) in bash prompt and presses Enter.
- 0.2: Bash reads input via readline, handles editing/history.
- 0.3: Parse command: Tokenize, handle redirection (> implies O_WRONLY|O_CREAT|O_TRUNC), expansions.
- 0.4: Fork child process for external binary/redirection (inherits fds/env).
- 0.5: Child execve binary (e.g., /bin/echo), sets up fds (e.g., dup2 stdout to file). Parent waits.
- 0.6: Program runs, issues syscalls for create/write.

**Phase 1: File Creation (Steps 1–15, Yellow/Orange/Red)**

- 1: Resolve pathname in user space (e.g., getcwd).
- 2: Issue syscall (e.g., open with O_CREAT).
- 3: Trap to kernel mode (syscall instr).
- 4: Dispatcher to handler (do_sys_open → do_filp_open → path_openat).
- 5: Namei path walk (dentry/inode caches; negative dentry for new file).
- 6: Permission checks (inode_permission; ACLs/SELinux).
- 7: FS-specific create (inode->i_op->create → ext4_create).
- 8: Allocate inode (ext4_new_inode; set mode/UID/timestamps; bitmap flip).
- 9: Add dirent in parent (ext4_add_entry; htree).
- 10: Journal metadata (jbd2_journal_start; data=ordered mode).
- 11: Commit transaction (jbd2_journal_commit_transaction).
- 12: Instantiate VFS objects (dentry_open; inode/dentry caches).
- 13: Allocate fd (get_unused_fd_flags).
- 14: Return fd to user space.
- 15: File visible (e.g., ls shows it).

**Phase 2: Data Persistence/Write (Steps 16–34, Red/Blue/Purple/Indigo/Deep Red/Orange/Bright Green)**

- 16: write() syscall (ksys_write → vfs_write).
- 17: Locate inode/address_space (file->f_mapping->host).
- 18: Page cache alloc (filemap_get_folio → folio_alloc).
- 19: Copy user data (copy_from_user).
- 20: Mark dirty (set_page_dirty).
- 21: Allocate blocks (ext4_map_blocks; extents/indirect).
- 22: Update inode (ext4_mark_iloc_dirty; i_size/i_blocks).
- 23: Journal metadata (jbd2_journal_start; no data journaling default).
- 24: Write data pages before commit (ext4_writepages; data=ordered).
- 25: Commit journal (jbd2_journal_commit_transaction).
- 26: Build bio (submit_bio).
- 27: I/O scheduler (mq-deadline/none; NCQ tags).
- 28: Driver send (nvme_queue_rq → PCIe; NVMe WRITE).
- 29: FTL map logical→physical, write NAND+ECC, update map, wear level (~100-500µs).
- 30: Mark invalid pages (FTL GC; overprovisioning).
- 31: Completion interrupt (blk_mq_complete_request; bio_end_io).
- 32: Mark pages clean (clear_page_dirty_for_io).
- 33: fsync wait (ext4_sync_file; durable).
- 34: TRIM on delete (blkdev_issue_discard; FTL erase).

**Visualization Specs:**

- Horizontal/vertical timeline with 43 clickable steps/slider; “Next” buttons, tooltips with kernel funcs/hardware effects.
- Color codes: Green (user/bash), Yellow (syscall/VFS), Orange (ext4), Bright Yellow (JBD2 journal), Red→Blue (page cache dirty/clean), Purple (block layer/bio), Indigo (NVMe driver/NCQ), Deep Red (SSD FTL/wear), Orange flash (NAND program/erase), Bright Green (completion/durable).
- Animate: Data flow arrows, bitmap flips, extent growth, journal brackets, bio queues, PCIe transfers, NAND page programming, invalid counters.
- Phases grouped; show layers (User → VFS → ext4 → Journal → Page Cache → Block → NVMe → SSD/FTL → NAND → Completion).
- Title: “Linux File Creation & Persistence: ext4 on SSD (Kernel 6.x, 2025)”. Ensure accuracy to ext4 data=ordered, no data journaling.