# Scenarios

| id | label | command | persistent | blurb |
|----|-------|---------|------------|-------|
| write | Write path | echo "Hello" > file.txt | true | Buffered write from shell redirection to NAND persistence |
| read | Read path | cat file.txt | false | Page-cache lookup, readahead, and copy-out to userspace |
| touch | Metadata only | touch file.txt | true | Create plus timestamp update with no file data |
| mmap | Memory map | grep "Hello" file.txt | false | Lazy mapping, page-fault driven reads, direct CPU access |
| direct | Direct I/O | dd if=file.txt of=/dev/null iflag=direct | false | Page-cache bypass with pinned user buffers |
