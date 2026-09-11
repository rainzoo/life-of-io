# Phases

| id | label | blurb |
|----|-------|-------|
| bash | Phase 0 — Command | Shell parses the command and issues syscalls |
| creation | Phase 1 — File Creation | Virtual File System (VFS) and ext4 allocate index node (inode), directory entry (dirent), and journal transaction |
| write | Phase 2 — Data Write and Persistence | Page cache, block layer, Non-Volatile Memory Express (NVMe), and NAND persist data |
