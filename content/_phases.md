# Phases

| id | label | blurb |
|----|-------|-------|
| bash | Phase 0 — Command | Shell parses the command and issues syscalls |
| creation | Phase 1 — File Creation | VFS and ext4 allocate inode, dirent, and journal transaction |
| write | Phase 2 — Data Write and Persistence | Page cache, block layer, NVMe, and NAND persist data |
