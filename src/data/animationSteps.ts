
import { AnimationStep } from '../types/animation';

export const animationSteps: AnimationStep[] = [
  {
    id: 0,
    title: "Shell Processing",
    description: "User executes the touch command in terminal",
    color: "#3498db",
    duration: 3000,
    details: [
      "User types: touch newfile.txt in terminal",
      "Shell parses the command and arguments",
      "Shell forks a new process to execute touch",
      "Exec system call loads the touch binary"
    ],
    codeExample: `// Shell command execution
$ touch newfile.txt

// Shell processing steps:
1. Parse command line
2. Locate touch executable
3. Fork new process
4. Execute /bin/touch`
  },
  {
    id: 1,
    title: "System Call Interface",
    description: "Touch command makes system calls to kernel",
    color: "#e67e22",
    duration: 4000,
    details: [
      "open() system call with O_CREAT flag",
      "O_WRONLY for write-only access",
      "O_TRUNC to truncate to zero length",
      "0666 default permissions",
      "Returns file descriptor on success"
    ],
    codeExample: `// System call made by touch
int fd = open("newfile.txt", 
              O_CREAT | O_WRONLY | O_TRUNC, 
              0666);

// If file doesn't exist, it's created
// If file exists, it's truncated to 0 bytes`,
    metadataChanges: [
      { field: "permissions", oldValue: "N/A", newValue: "rw-rw-r--" },
      { field: "size", oldValue: "N/A", newValue: 0 }
    ]
  },
  {
    id: 2,
    title: "VFS Layer",
    description: "Virtual File System processes the request",
    color: "#2ecc71",
    duration: 5000,
    details: [
      "VFS receives the open() system call",
      "Checks directory cache for file existence",
      "File not found - delegates to file system",
      "Calls file system's create() method"
    ],
    codeExample: `// VFS operations
struct file *filp;
filp = do_filp_open(AT_FDCWD, "newfile.txt", 
                    O_CREAT | O_WRONLY | O_TRUNC, 
                    0666);

// VFS handles path resolution
// and delegates to appropriate file system`
  },
  {
    id: 3,
    title: "File System Layer",
    description: "File system creates inode and directory entry",
    color: "#9b59b6",
    duration: 6000,
    details: [
      "Allocates new inode for the file",
      "Sets initial metadata (permissions, timestamps)",
      "Creates directory entry linking filename to inode",
      "Updates parent directory metadata",
      "Uses journaling for consistency (ext4)"
    ],
    codeExample: `// Ext4 file creation
struct inode *inode;
inode = ext4_new_inode_start_handle(...);

// Initialize inode metadata
inode->i_mode = S_IFREG | 0666;
inode->i_size = 0;
inode->i_mtime = inode->i_atime = inode->i_ctime = current_time;

// Add directory entry
ext4_add_entry(dir_inode, "newfile.txt", inode);`,
    metadataChanges: [
      { field: "inodeNumber", oldValue: "N/A", newValue: 12345 },
      { field: "modifyTime", oldValue: "N/A", newValue: "Current time" },
      { field: "accessTime", oldValue: "N/A", newValue: "Current time" },
      { field: "changeTime", oldValue: "N/A", newValue: "Current time" }
    ]
  },
  {
    id: 4,
    title: "Block Layer",
    description: "Block allocation and buffering operations",
    color: "#f1c40f",
    duration: 4000,
    details: [
      "Block allocator assigns physical blocks",
      "Data is buffered in page cache",
      "I/O scheduler optimizes disk operations",
      "Dirty blocks queued for writeback"
    ],
    codeExample: `// Block allocation
sector_t block;
block = ext4_new_meta_blocks(inode, ...);

// Page cache operations
struct page *page;
page = grab_cache_page(inode->i_mapping, 0);

// I/O scheduling
submit_bio(REQ_OP_WRITE, bio);`
  },
  {
    id: 5,
    title: "Device Driver",
    description: "Hardware communication with storage device",
    color: "#e74c3c",
    duration: 3000,
    details: [
      "Device driver receives block I/O requests",
      "Translates logical to physical addresses",
      "Communicates with storage hardware",
      "Handles hardware-specific protocols"
    ],
    codeExample: `// Device driver operations
static int ext4_submit_bio(struct bio *bio) {
    bio->bi_end_io = ext4_end_bio;
    submit_bio(bio);
    return 0;
}

// Hardware communication
sd_init_command(cmd);
scsi_execute(cmd, ...);`
  },
  {
    id: 6,
    title: "Physical Storage",
    description: "Data written to actual disk sectors",
    color: "#e74c3c",
    duration: 5000,
    details: [
      "Inode written to inode table block",
      "Directory entry written to directory block",
      "File data block allocated (empty)",
      "Metadata updated in superblock"
    ],
    codeExample: `// Physical storage layout
Superblock: Filesystem metadata
Inode Table: Inode 12345 (newfile.txt)
  - File type: Regular file
  - Permissions: 0666
  - Size: 0 bytes
Directory Block: "newfile.txt" → inode 12345
Data Blocks: Empty (0 bytes)`
  },
  {
    id: 7,
    title: "Completion",
    description: "File creation process completes successfully",
    color: "#2ecc71",
    duration: 3000,
    details: [
      "Device driver signals I/O completion",
      "VFS updates cache with new file info",
      "Kernel returns file descriptor to process",
      "Touch command closes file descriptor",
      "File appears in directory listing"
    ],
    codeExample: `// Completion steps
fd = get_unused_fd_flags(O_WRONLY);
fd_install(fd, filp);

// Touch closes the file
close(fd);

// File is now accessible
ls -l newfile.txt`
  }
];