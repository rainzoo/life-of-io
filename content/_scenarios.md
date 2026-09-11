# Scenarios

| id | label | command | persistent | blurb |
|----|-------|---------|------------|-------|
| write | Write path | echo "Hello" > file.txt | true | Buffered write from shell redirection to NAND persistence |
| read | Read path | cat file.txt | false | Page-cache lookup, readahead, and copy-out to userspace |
| touch | Metadata only | touch file.txt | true | Create plus timestamp update with no file data |
| mmap | Memory map | ./reader (mmap) | false | Lazy mapping, page-fault driven reads, direct CPU access |
| direct | Direct I/O | ./direct_reader (O_DIRECT) | false | Page-cache bypass with pinned user buffers |
