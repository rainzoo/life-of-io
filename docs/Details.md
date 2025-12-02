# Life of IO

Here is the **verified and updated detailed step-by-step flow** for creating a file and persisting data in it on a modern Linux system using **ext4 on a modern SSD** (NVMe or SATA SSD with TRIM, NCQ, and flash translation layer).

This version incorporates verification based on Linux kernel documentation (e.g., VFS overviews from kernel.org and LWN-inspired sources), ext4 specifics (e.g., journaling modes and SSD interactions from man pages, stack exchanges, and filesystem labs), and bash execution details (e.g., from TLDp and bash manuals). The previous steps were largely accurate but have been refined for precision:

- Clarified bash parsing and forking (bash doesn’t always fork for builtins, but does for external commands like touch or echo with redirection).
- Emphasized that ext4’s default journaling is metadata-only (data=ordered mode ensures data is written before metadata commit, but data isn’t journaled unless data=journal is set, which is rare for SSDs due to wear).
- Noted SSD FTL wear leveling happens transparently; journaling adds minimal wear with TRIM enabled (common on modern Linux).
- Minor tweaks to kernel function names and sequences based on current kernel (6.x as of 2025) docs.
- No major inaccuracies found; the flow aligns with VFS abstraction, ext4 inode ops, and block layer.

This is optimized for an **interactive visualization** — each step can be a clickable/timeline stage with animated components.

**Phase 0 – Bash shell command entry and execution (new addition)**

These initial steps occur before any kernel involvement, in user space via the bash shell.

| **Step** | **Detailed Action** | **Components Involved** | **Visualization Idea** |
| --- | --- | --- | --- |
| 0.1 | User types command in bash prompt (e.g., echo "Hello world" > newfile or touch newfile) and presses Enter. | Bash shell (stdin via terminal emulator like GNOME Terminal or xterm). | Green terminal window with cursor blinking; text appears as typed. |
| 0.2 | Bash reads the input line from stdin (using readline library for editing/history). | readline() or internal bash reader; handles quoting, escaping. | Input buffer fills; highlight parsing for spaces/quotes. |
| 0.3 | Bash parses the command line: tokenizes into words, handles redirection (> for stdout to file, creates if missing), expansions (variables, globs), and aliases. For redirection, bash notes O_WRONLY | O_CREAT | O_TRUNC flags implicitly. |
| 0.4 | If command is a builtin (e.g., pure echo without redirection), bash executes it directly in the current process. For external binaries or redirection, bash calls fork() to create a child process. | fork() syscall; child inherits environment, fd table. | Process tree: parent bash → child pid. |
| 0.5 | In child: bash calls execve() to replace itself with the binary (e.g., /bin/echo or /bin/touch), passing args and env. For redirection, child sets up fds (e.g., dup2 to stdout). Parent waits for child exit. | execve() syscall; loads ELF binary into memory. | Binary load animation; fd table shows stdout → file. |
| 0.6 | The executed program (e.g., echo or touch) runs and issues syscalls for file creation/write. | Program’s main() → libc wrappers. | Transition to yellow kernel entry. |

**Phase 1 – File creation**

| **Step** | **Detailed Action** | **Kernel Function / Structure** | **SSD / Hardware Action** | **Visualization Idea** |
| --- | --- | --- | --- | --- |
| 1 | Program (e.g., touch) resolves pathname in user space if needed (e.g., via getcwd() or relative paths). | libc helpers. | — | Green user-space path walk. |
| 2 | Program issues creation syscall (e.g., `open(“newfile”, O_CREAT | O_WRONLY | O_TRUNC, 0644)forecho >, or creat()fortouch`). | Syscall via libc. |
| 3 | CPU traps into kernel mode. | Syscall instruction (syscall/sysenter). | — | Yellow trap gate. |
| 4 | Syscall dispatcher routes to handler. | do_sys_open() → do_filp_open() → path_openat(). | — | Dispatcher branch. |
| 5 | Pathname resolution (namei): Walk components to parent dir, last component not found → negative dentry. | link_path_walk(); dentry/inode caches. | — | Dentry tree traversal. |
| 6 | Permission checks on parent dir. | inode_permission(); ACLs/SELinux. | — | Lock icon check. |
| 7 | Call filesystem-specific create. | inode->i_op->create() → ext4_create(). | — | FS branch to ext4. |
| 8 | Inode allocation: Find free inode from bitmap. | ext4_new_inode(); sets mode, UID, timestamps. | — | Inode bitmap flip (0→1). |
| 9 | Directory entry creation: Add dirent in parent (name → inode num). | ext4_add_entry(); htree for large dirs. | — | Dir block: new entry slot. |
| 10 | Journaling (metadata-only default): Start transaction, journal inode/dirent/bitmap changes. | jbd2_journal_start(); metadata to journal. | Sequential journal writes. | Yellow journal bracket opens. |
| 11 | Commit transaction; ensures crash consistency (data=ordered: data written before commit if any). | jbd2_journal_commit_transaction(). | Journal area updated. | “COMMIT” stamp. |
| 12 | Instantiate VFS objects: Add inode/dentry to caches, create struct file. | dentry_open(). | — | Memory structures appear. |
| 13 | Allocate file descriptor in process fd table. | get_unused_fd_flags(). | — | FD table slot fills. |
| 14 | Syscall returns fd to user space. | — | — | Blue return arrow. |
| 15 | File visible (e.g., via ls). | — | — | File icon appears. |

**Phase 2 – First write → data persistence (for non-empty files like `echo >`)**

| **Step** | **Detailed Action** | **Kernel Function / Structure** | **SSD / Hardware Action** | **Visualization Idea** |
| --- | --- | --- | --- | --- |
| 16 | write() syscall traps into kernel. | ksys_write() → vfs_write(). | — | Yellow trap. |
| 17 | Locate inode and address space. | file->f_mapping->host. | — | Inode highlight. |
| 18 | Page cache check: Allocate new pages if missing. | __filemap_get_folio() → folio_alloc(). | RAM alloc. | Empty cache slots fill. |
| 19 | Copy user data to page cache. | _copy_from_user(). | — | Data flow in. |
| 20 | Mark pages dirty. | set_page_dirty(). | — | Pages turn red. |
| 21 | Allocate on-disk blocks. | ext4_map_blocks() → extents or indirect. | FTL preps mapping. | Extent tree grows. |
| 22 | Update inode (i_size, i_blocks). | ext4_mark_iloc_dirty(). | — | Inode fields change. |
| 23 | Journal transaction: Journal metadata (inode, extents, bitmap); data written directly (data=ordered). | jbd2_journal_start(); no data journaling by default. | Journal seq writes. | Yellow bracket. |
| 24 | Write dirty data pages to final locations (before metadata commit in data=ordered). | ext4_writepages() via writeback. | Data to LBA. | Red → blue pages. |
| 25 | Commit journal (guarantees durability). | jbd2_journal_commit_transaction(). | Commit block. | “COMMIT” stamp. |
| 26 | Block layer: Build bio for data/metadata writes. | submit_bio(). | — | Bio boxes. |
| 27 | I/O scheduler queues/optimizes. | mq-deadline or none for NVMe. | NCQ tags (up to 32/128). | Queue with tags. |
| 28 | Driver sends to SSD. | nvme_queue_rq() → PCIe. | NVMe WRITE cmds. | PCIe arrow. |
| 29 | SSD FTL: Map logical to physical, write to NAND (with ECC), update map, wear level. | Internal controller (transparent). | Program op (~100-500 µs); overprovisioning. | Flash die: page orange. |
| 30 | Mark old pages invalid (if overwrite). | FTL background GC. | Invalid counter up. | Gray invalid pages. |
| 31 | Completion: Interrupt → bio end_io. | blk_mq_complete_request(). | — | Green check. |
| 32 | Pages marked clean. | clear_page_dirty_for_io(). | — | Blue clean. |
| 33 | For fsync(): Wait for all to disk. | ext4_sync_file(). | Durable post-commit. | “Durable!” badge. |
| 34 | TRIM (on delete/fstrim): Issue discard to free blocks. | blkdev_issue_discard(); online or cron. | FTL erases blocks. | Cells fade white. |

**Summary of All Layers for the Interactive Visualization**

| **Layer** | **Key Components to Animate** | **Color Code** |
| --- | --- | --- |
| Bash/User Process | Prompt, parsing, fork/exec, fd → write() | Green |
| Syscall & VFS | Trap → inode → page cache | Yellow |
| ext4 File System | Inode, extents, block bitmap, journal | Orange |
| JBD2 Journal | Transaction, commit block | Bright Yellow |
| Page Cache & Writeback | Dirty → clean pages | Red → Blue |
| Block Layer | Bio, I/O scheduler, queue | Purple |
| NVMe/Block Driver | PCIe commands, NCQ tags | Indigo |
| SSD Firmware/FTL | Mapping update, NAND program, wear leveling | Deep Red |
| NAND Flash Chips | Physical pages programmed | Orange flash |
| Completion Path | Interrupt → page clean → durable | Bright Green |

**Suggested Interactive Timeline (now 43 clickable steps)**

A timeline/slider where steps light up sequentially, with tooltips for kernel functions/hardware effects. Group by phases: Bash (green, steps 0.1–0.6), Creation (orange/red), Write/Persistence (purple/red/green). This full chain covers from terminal input to NAND electrons, accurate for ext4 on SSD in Linux 6.x (2025).