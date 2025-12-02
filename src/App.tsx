import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

type PhaseId = "bash" | "creation" | "write";

type LayerId =
  | "bash"
  | "syscall-vfs"
  | "ext4"
  | "journal"
  | "page-cache"
  | "block"
  | "nvme"
  | "ssd-ftl"
  | "nand"
  | "completion";

interface VisualizationStep {
  id: number;
  /** Human-facing label, e.g. \"0.1\", \"17\" */
  stepLabel: string;
  phase: PhaseId;
  title: string;
  description: string;
  kernelDetails?: string;
  hardwareDetails?: string;
  layers: LayerId[];
}

interface LayerDefinition {
  id: LayerId;
  name: string;
  description: string;
  colorClass: string;
  accentClass: string;
}

const LAYERS: LayerDefinition[] = [
  {
    id: "bash",
    name: "Bash / User Process",
    description: "User command line, parsing, fork/exec, stdio redirection.",
    colorClass: "bg-emerald-900/40 border-emerald-400/70",
    accentClass: "from-emerald-500/80 to-emerald-300/80",
  },
  {
    id: "syscall-vfs",
    name: "Syscall & VFS",
    description: "Syscall trap, path walk, inode lookup, VFS abstractions.",
    colorClass: "bg-yellow-900/40 border-yellow-400/70",
    accentClass: "from-yellow-400/90 to-amber-300/80",
  },
  {
    id: "ext4",
    name: "ext4 Filesystem",
    description: "Inodes, extents, block bitmaps, directory entries.",
    colorClass: "bg-orange-900/40 border-orange-400/70",
    accentClass: "from-orange-500/90 to-amber-400/80",
  },
  {
    id: "journal",
    name: "JBD2 Journal",
    description: "Metadata transactions and commit records.",
    colorClass: "bg-amber-900/40 border-amber-300/80",
    accentClass: "from-amber-300/90 to-yellow-200/80",
  },
  {
    id: "page-cache",
    name: "Page Cache & Writeback",
    description: "Dirty/clean page lifecycle in the cache.",
    colorClass: "bg-gradient-to-r from-red-900/50 to-sky-900/50 border-red-400/70",
    accentClass: "from-red-500/90 to-sky-400/90",
  },
  {
    id: "block",
    name: "Block Layer",
    description: "Bio construction and I/O scheduling.",
    colorClass: "bg-purple-900/50 border-purple-400/70",
    accentClass: "from-purple-500/90 to-fuchsia-400/80",
  },
  {
    id: "nvme",
    name: "NVMe Driver / NCQ",
    description: "Queueing requests and talking over PCIe.",
    colorClass: "bg-indigo-900/50 border-indigo-400/70",
    accentClass: "from-indigo-500/90 to-sky-400/80",
  },
  {
    id: "ssd-ftl",
    name: "SSD Firmware / FTL",
    description: "Logical→physical mapping and wear leveling.",
    colorClass: "bg-red-950/70 border-red-500/80",
    accentClass: "from-red-600/90 to-rose-500/90",
  },
  {
    id: "nand",
    name: "NAND Flash",
    description: "Physical cells programmed/erased in pages and blocks.",
    colorClass: "bg-orange-950/70 border-orange-500/80",
    accentClass: "from-orange-500/95 to-amber-400/90",
  },
  {
    id: "completion",
    name: "Completion Path",
    description: "Interrupt handling and user-visible durability.",
    colorClass: "bg-emerald-950/70 border-emerald-400/80",
    accentClass: "from-emerald-500/95 to-lime-400/90",
  },
];

const STEPS: VisualizationStep[] = [
  // Phase 0 – Bash shell command entry and execution (0.1–0.6)
  {
    id: 0,
    stepLabel: "0.1",
    phase: "bash",
    title: "User types command and presses Enter",
    description:
      'In a terminal, the user types a command like echo "Hello world" > newfile and hits Enter.',
    kernelDetails: "No kernel involvement yet beyond terminal I/O.",
    hardwareDetails: "Characters buffered by terminal emulator and pty.",
    layers: ["bash"],
  },
  {
    id: 1,
    stepLabel: "0.2",
    phase: "bash",
    title: "Bash reads the command line",
    description:
      "Bash reads the input line (typically via readline), handling history, quoting, and editing.",
    kernelDetails: "read() on stdin delivers characters to bash.",
    hardwareDetails: "Data flows from keyboard to terminal to bash process.",
    layers: ["bash"],
  },
  {
    id: 2,
    stepLabel: "0.3",
    phase: "bash",
    title: "Bash parses, expands, and sets up redirection",
    description:
      "Bash tokenizes the line, performs expansions (variables, globs), and notes that '>' redirects stdout to a file with O_WRONLY|O_CREAT|O_TRUNC flags.",
    kernelDetails: "Still in user space; preparing for later open().",
    hardwareDetails: "No disk I/O yet.",
    layers: ["bash"],
  },
  {
    id: 3,
    stepLabel: "0.4",
    phase: "bash",
    title: "Bash forks a child for the command",
    description:
      "For an external binary or redirection, bash calls fork() to create a child that inherits its environment and file descriptor table.",
    kernelDetails: "fork() duplicates the process, copying metadata and mappings.",
    hardwareDetails: "RAM allocations and page table updates; no SSD access.",
    layers: ["bash"],
  },
  {
    id: 4,
    stepLabel: "0.5",
    phase: "bash",
    title: "Child execve() loads the binary and sets up fds",
    description:
      "In the child, bash uses execve() to load the program (e.g., /bin/echo) and sets up file descriptors so stdout points to the file to be created.",
    kernelDetails: "execve() loads the ELF binary and prepares the new process image.",
    hardwareDetails: "Instruction and data fetches from storage via the page cache (not shown in this flow).",
    layers: ["bash", "syscall-vfs"],
  },
  {
    id: 5,
    stepLabel: "0.6",
    phase: "bash",
    title: "Program runs and will issue syscalls",
    description:
      "The user program starts executing its main() and will soon call open(), write(), and close() via libc wrappers.",
    kernelDetails: "User space prepares to cross the kernel boundary.",
    hardwareDetails: "CPU executes user instructions in ring 3.",
    layers: ["bash"],
  },
  // Phase 1 – File creation (1–15)
  {
    id: 6,
    stepLabel: "1",
    phase: "creation",
    title: "Resolve pathname in user space",
    description:
      "The program resolves the pathname, possibly calling getcwd() and building a relative or absolute path for newfile.",
    kernelDetails: "libc helpers may use getcwd() or cached working directory state.",
    hardwareDetails: "No direct disk access yet; purely user-space string work.",
    layers: ["bash"],
  },
  {
    id: 7,
    stepLabel: "2",
    phase: "creation",
    title: "Issue open() syscall with O_CREAT",
    description:
      'The program calls open(\"newfile\", O_CREAT | O_WRONLY | O_TRUNC, 0644) or creat() for touch-like behavior.',
    kernelDetails: "libc wrapper enters kernel via openat() or open().",
    hardwareDetails: "CPU prepares to transition to kernel mode.",
    layers: ["bash", "syscall-vfs"],
  },
  {
    id: 8,
    stepLabel: "3",
    phase: "creation",
    title: "Trap into kernel mode",
    description:
      "The CPU executes the syscall instruction, switching from user mode to kernel mode and jumping to the syscall entry point.",
    kernelDetails: "Syscall entry saves registers and sets up a kernel stack frame.",
    hardwareDetails: "Control stays on CPU; no storage access yet.",
    layers: ["syscall-vfs"],
  },
  {
    id: 9,
    stepLabel: "4",
    phase: "creation",
    title: "Syscall dispatcher routes to do_sys_open()",
    description:
      "The kernel's syscall dispatcher examines the syscall number and dispatches to do_sys_open() → do_filp_open() → path_openat().",
    kernelDetails: "VFS open helpers begin processing the request.",
    hardwareDetails: "Still CPU-bound; no disk I/O yet.",
    layers: ["syscall-vfs"],
  },
  {
    id: 10,
    stepLabel: "5",
    phase: "creation",
    title: "VFS pathname resolution via namei",
    description:
      "VFS walks the path with link_path_walk(), consulting dentry and inode caches. The parent directory is found; the final component is a negative dentry.",
    kernelDetails: "Dentry and inode caches accelerate path resolution.",
    hardwareDetails: "If cached, no immediate disk I/O is needed.",
    layers: ["syscall-vfs"],
  },
  {
    id: 11,
    stepLabel: "6",
    phase: "creation",
    title: "Permission and policy checks",
    description:
      "The kernel checks directory permissions and security policies using inode_permission(), POSIX ACLs, and SELinux or other LSM hooks.",
    kernelDetails: "Access checks ensure the caller can create in this directory.",
    hardwareDetails: "No SSD interactions; purely in-memory metadata checks.",
    layers: ["syscall-vfs"],
  },
  {
    id: 12,
    stepLabel: "7",
    phase: "creation",
    title: "Invoke ext4_create() for filesystem-specific work",
    description:
      "The VFS calls inode->i_op->create(), which for ext4 is ext4_create(), transferring control into the ext4 driver.",
    kernelDetails: "Filesystem-specific create logic is now active.",
    hardwareDetails: "Subsequent steps may read or update on-disk metadata.",
    layers: ["syscall-vfs", "ext4"],
  },
  {
    id: 13,
    stepLabel: "8",
    phase: "creation",
    title: "Allocate a new ext4 inode",
    description:
      "ext4_new_inode() scans the inode bitmap for a free inode, marks it allocated, and initializes mode, UID, GID, and timestamps.",
    kernelDetails: "On-disk inode structures are prepared for the new file.",
    hardwareDetails: "May require reading and later writing inode bitmap blocks.",
    layers: ["ext4", "journal"],
  },
  {
    id: 14,
    stepLabel: "9",
    phase: "creation",
    title: "Create a directory entry for the new file",
    description:
      "ext4_add_entry() updates the parent directory block (or htree) to map the new filename to its inode number.",
    kernelDetails: "Directory data structures are modified in memory.",
    hardwareDetails: "Associated directory blocks will later be written to SSD.",
    layers: ["ext4", "journal"],
  },
  {
    id: 15,
    stepLabel: "10",
    phase: "creation",
    title: "Start a JBD2 journal transaction for metadata",
    description:
      "jbd2_journal_start() begins a transaction covering inode, directory entry, and bitmap updates. In data=ordered mode, only metadata is journaled.",
    kernelDetails: "Journal buffers capture pending metadata changes.",
    hardwareDetails: "Journal blocks reside on the same SSD, written sequentially.",
    layers: ["ext4", "journal"],
  },
  {
    id: 16,
    stepLabel: "11",
    phase: "creation",
    title: "Commit the journal transaction for create",
    description:
      "jbd2_journal_commit_transaction() writes the journal commit record, ensuring that after a crash, the create is either fully applied or fully rolled back.",
    kernelDetails: "Commit block marks the end of this transaction.",
    hardwareDetails: "SSD receives sequential journal writes before metadata replay.",
    layers: ["ext4", "journal", "block", "nvme", "ssd-ftl", "nand"],
  },
  {
    id: 17,
    stepLabel: "12",
    phase: "creation",
    title: "Instantiate VFS dentry and file structures",
    description:
      "dentry_open() sets up in-memory dentry and inode objects and creates a struct file representing the open file.",
    kernelDetails: "These structures live only in kernel memory.",
    hardwareDetails: "No further disk I/O; purely in-memory bookkeeping.",
    layers: ["syscall-vfs"],
  },
  {
    id: 18,
    stepLabel: "13",
    phase: "creation",
    title: "Allocate a file descriptor slot",
    description:
      "get_unused_fd_flags() finds a free file descriptor number in the process's fd table and associates it with the new struct file.",
    kernelDetails: "The task_struct's fdtable is updated.",
    hardwareDetails: "No storage activity; process metadata only.",
    layers: ["syscall-vfs"],
  },
  {
    id: 19,
    stepLabel: "14",
    phase: "creation",
    title: "Return the fd to user space",
    description:
      "The kernel copies the new file descriptor integer back to user space, and execution resumes in the program after open().",
    kernelDetails: "Syscall return path restores registers and mode.",
    hardwareDetails: "CPU transitions back to user mode (ring 3).",
    layers: ["bash", "syscall-vfs"],
  },
  {
    id: 20,
    stepLabel: "15",
    phase: "creation",
    title: "File is visible in the directory",
    description:
      "At this point, the new file appears in directory listings (e.g., ls), even if it is still empty.",
    kernelDetails: "Dentry and inode are now part of the VFS tree.",
    hardwareDetails: "Metadata blocks describing the file exist on SSD after commit.",
    layers: ["syscall-vfs", "ext4"],
  },
  // Phase 2 – First write → data persistence (16–34)
  {
    id: 21,
    stepLabel: "16",
    phase: "write",
    title: "write() syscall enters the kernel",
    description:
      "The program calls write(fd, buf, len), and the CPU executes the syscall instruction to enter the kernel.",
    kernelDetails: "ksys_write() → vfs_write() handle the request.",
    hardwareDetails: "No immediate disk I/O; data still in user memory.",
    layers: ["bash", "syscall-vfs"],
  },
  {
    id: 22,
    stepLabel: "17",
    phase: "write",
    title: "Locate inode and address_space",
    description:
      "The kernel locates the struct file, its inode, and the associated address_space via file->f_mapping->host.",
    kernelDetails: "The mapping determines how offsets map to cache pages.",
    hardwareDetails: "All operations are in memory at this step.",
    layers: ["syscall-vfs"],
  },
  {
    id: 23,
    stepLabel: "18",
    phase: "write",
    title: "Allocate or find page cache folios",
    description:
      "Using __filemap_get_folio(), the kernel looks for existing cache pages or allocates new folios to hold the file's data.",
    kernelDetails: "folio_alloc() may allocate new pages in RAM.",
    hardwareDetails: "RAM usage grows, but SSD is not touched yet.",
    layers: ["page-cache"],
  },
  {
    id: 24,
    stepLabel: "19",
    phase: "write",
    title: "Copy user data into the page cache",
    description:
      "The kernel copies bytes from the user buffer into the page cache using _copy_from_user(), populating the new file's in-memory pages.",
    kernelDetails: "User pointers are validated before copying.",
    hardwareDetails: "Only DRAM is accessed; data not yet on SSD.",
    layers: ["page-cache"],
  },
  {
    id: 25,
    stepLabel: "20",
    phase: "write",
    title: "Mark pages dirty",
    description:
      "set_page_dirty() marks the affected cache pages as dirty so that writeback will eventually flush them to disk.",
    kernelDetails: "Dirty flags inform the writeback code what must be written.",
    hardwareDetails: "No SSD activity yet; state changes are in memory.",
    layers: ["page-cache"],
  },
  {
    id: 26,
    stepLabel: "21",
    phase: "write",
    title: "Allocate on-disk blocks for the file",
    description:
      "ext4_map_blocks() determines which logical blocks the file should use and updates extent trees or indirect block structures.",
    kernelDetails: "File's on-disk layout is reserved and described.",
    hardwareDetails: "Block bitmaps and extent metadata will be updated on SSD.",
    layers: ["ext4", "journal"],
  },
  {
    id: 27,
    stepLabel: "22",
    phase: "write",
    title: "Update inode size and block counts",
    description:
      "ext4_mark_iloc_dirty() adjusts fields like i_size and i_blocks to reflect the new data and marks the inode metadata dirty.",
    kernelDetails: "Inode fields now describe the current file contents.",
    hardwareDetails: "Inode blocks will later be flushed to the SSD.",
    layers: ["ext4", "journal"],
  },
  {
    id: 28,
    stepLabel: "23",
    phase: "write",
    title: "Journal metadata for the write",
    description:
      "jbd2_journal_start() creates a transaction covering inode, extent, and bitmap updates; ext4 in data=ordered mode still writes file data directly, not to the journal.",
    kernelDetails: "Journal buffers collect metadata updates for atomicity.",
    hardwareDetails: "Journal blocks reside in a dedicated area of the SSD.",
    layers: ["ext4", "journal"],
  },
  {
    id: 29,
    stepLabel: "24",
    phase: "write",
    title: "Write dirty data pages to disk (ordered before commit)",
    description:
      "ext4_writepages() is invoked by writeback to send dirty pages to their final on-disk locations before the journal metadata commit.",
    kernelDetails: "Writeback code clusters writes into larger bios.",
    hardwareDetails: "Data flows through the block layer to the SSD.",
    layers: ["page-cache", "block", "nvme", "ssd-ftl", "nand"],
  },
  {
    id: 30,
    stepLabel: "25",
    phase: "write",
    title: "Commit the ext4 metadata journal for the write",
    description:
      "jbd2_journal_commit_transaction() writes the commit record for the metadata, ensuring consistency so that data is on disk before metadata points to it.",
    kernelDetails: "Ordered mode guarantees no stale pointers to unwritten data.",
    hardwareDetails: "Sequential journal writes improve SSD performance.",
    layers: ["journal", "block", "nvme", "ssd-ftl", "nand"],
  },
  {
    id: 31,
    stepLabel: "26",
    phase: "write",
    title: "Build bios at the block layer",
    description:
      "submit_bio() and related helpers assemble one or more bios describing which logical blocks to read or write and submit them to the block device queue.",
    kernelDetails: "The generic block layer sees logical block requests only.",
    hardwareDetails: "These requests abstract away SSD-specific details.",
    layers: ["block"],
  },
  {
    id: 32,
    stepLabel: "27",
    phase: "write",
    title: "I/O scheduler queues and optimizes requests",
    description:
      "Schedulers like mq-deadline or 'none' for NVMe assign tags and order bios, exposing a high-performance queue to the driver.",
    kernelDetails: "blk-mq manages multi-queue I/O submission and completion.",
    hardwareDetails: "Queue depth and ordering influence SSD parallelism.",
    layers: ["block", "nvme"],
  },
  {
    id: 33,
    stepLabel: "28",
    phase: "write",
    title: "NVMe driver sends commands over PCIe",
    description:
      "nvme_queue_rq() turns bios into NVMe WRITE commands placed on submission queues, which the SSD controller reads via PCIe.",
    kernelDetails: "Driver manages submission and completion queues and doorbells.",
    hardwareDetails: "PCIe transfers carry data and commands to the SSD.",
    layers: ["nvme"],
  },
  {
    id: 34,
    stepLabel: "29",
    phase: "write",
    title: "SSD FTL maps logical to physical and programs NAND",
    description:
      "Inside the SSD, the flash translation layer maps logical block addresses to physical NAND pages, applies ECC, programs cells, and updates mapping tables with wear leveling.",
    kernelDetails: "Opaque to the kernel; treated as a fast block device.",
    hardwareDetails: "Programming a NAND page typically takes 100–500 µs.",
    layers: ["ssd-ftl", "nand"],
  },
  {
    id: 35,
    stepLabel: "30",
    phase: "write",
    title: "Mark old pages invalid and schedule GC",
    description:
      "When overwriting data, the FTL marks previous physical pages invalid and may schedule background garbage collection to reclaim blocks later.",
    kernelDetails: "Kernel is unaware of internal SSD invalidation.",
    hardwareDetails: "Invalid pages accumulate until block erasure.",
    layers: ["ssd-ftl"],
  },
  {
    id: 36,
    stepLabel: "31",
    phase: "write",
    title: "I/O completion interrupt and bio_end_io",
    description:
      "When the SSD finishes a command, it generates an interrupt; blk_mq_complete_request() and bio_end_io() mark the bio complete.",
    kernelDetails: "Completion handlers wake up waiting tasks or writeback code.",
    hardwareDetails: "NVMe completion queue entries are consumed.",
    layers: ["block", "nvme", "completion"],
  },
  {
    id: 37,
    stepLabel: "32",
    phase: "write",
    title: "Mark pages clean in the page cache",
    description:
      "clear_page_dirty_for_io() and related helpers clear the dirty flag, turning previously dirty pages into clean ones in the cache.",
    kernelDetails: "The kernel now treats these pages as synced to disk.",
    hardwareDetails: "Data is durably stored on SSD media.",
    layers: ["page-cache", "completion"],
  },
  {
    id: 38,
    stepLabel: "33",
    phase: "write",
    title: "fsync() waits for data and metadata to be durable",
    description:
      "If the program calls fsync(), ext4_sync_file() ensures that all data and relevant metadata have been committed to disk and journal.",
    kernelDetails: "fsync() blocks until lower layers report completion.",
    hardwareDetails: "Ensures power-failure-safe persistence for the file.",
    layers: ["syscall-vfs", "ext4", "journal", "block", "nvme", "ssd-ftl", "nand", "completion"],
  },
  {
    id: 39,
    stepLabel: "34",
    phase: "write",
    title: "TRIM/discard frees blocks for reuse on delete",
    description:
      "When files are deleted or fstrim runs, blkdev_issue_discard() tells the SSD which logical blocks are no longer used so it can erase them in the background.",
    kernelDetails: "Discards help keep SSD performance stable over time.",
    hardwareDetails: "FTL erases entire blocks so pages become ready for reuse.",
    layers: ["block", "nvme", "ssd-ftl", "nand"],
  },
];

const PHASE_LABELS: Record<PhaseId, string> = {
  bash: "Phase 0 – Bash & User Space",
  creation: "Phase 1 – File Creation",
  write: "Phase 2 – Data Write & Persistence",
};

interface LayerLaneProps {
  layer: LayerDefinition;
  active: boolean;
}

function LayerLane({ layer, active }: LayerLaneProps) {
  return (
    <div
      className={[
        "relative flex items-center justify-between rounded-lg border px-3 py-2 text-xs md:text-sm transition-all duration-300",
        active
          ? "bg-slate-800 border-slate-600 shadow-md scale-[1.01]"
          : "bg-slate-900/50 border-border/60 opacity-80",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold uppercase tracking-tight",
            active ? "bg-slate-700 text-slate-100" : "bg-slate-800 text-muted-foreground",
          ].join(" ")}
        >
          {layer.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div className="flex flex-col">
          <span className={`font-medium leading-tight ${active ? "text-slate-100" : "text-slate-300"}`}>{layer.name}</span>
          <span className="hidden text-[0.7rem] text-muted-foreground md:inline">
            {layer.description}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PhaseBadgeProps {
  phase: PhaseId;
}

function PhaseBadge({ phase }: PhaseBadgeProps) {
  const label = PHASE_LABELS[phase];
  const phaseClass =
    phase === "bash"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/60"
      : phase === "creation"
        ? "bg-amber-500/15 text-amber-200 border-amber-400/60"
        : "bg-purple-500/15 text-purple-200 border-purple-400/60";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide",
        phaseClass,
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const maxIndex = STEPS.length - 1;
  const currentStep = STEPS[currentStepIndex];

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex === maxIndex) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, maxIndex]);

  useEffect(() => {
    if (isPlaying && currentStepIndex < maxIndex) {
      const interval = 1600 / speed;
      const timer = setTimeout(() => {
        handleNext();
      }, interval);
      return () => clearTimeout(timer);
    }

    if (currentStepIndex === maxIndex) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, handleNext, isPlaying, maxIndex, speed]);

  const handleSliderChange = (value: number[]) => {
    const [index] = value;
    setCurrentStepIndex(index);
    setIsPlaying(false);
  };

  const handleSpeedChange = (value: number[]) => {
    const [newSpeed] = value;
    setSpeed(newSpeed);
  };

  const activeLayerIds = useMemo(
    () => new Set<LayerId>(currentStep.layers),
    [currentStep.layers],
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Linux File Creation & Persistence
          </h1>
          <p className="max-w-2xl text-[0.75rem] text-muted-foreground md:text-xs">
            ext4 on SSD (Linux 6.x): from Bash command to NAND cells. Use the
            controls below to walk step by step through the life of a single
            write.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Interactive timeline · {STEPS.length} steps</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-4 py-4 md:flex-row md:px-6 md:py-6">
        {/* Left: Layer lanes */}
        <section className="flex-1 space-y-3 md:space-y-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Layers
          </h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-1">
            {LAYERS.map((layer) => (
              <LayerLane
                key={layer.id}
                layer={layer}
                active={activeLayerIds.has(layer.id)}
              />
            ))}
          </div>
        </section>

        {/* Center: Current step details */}
        <section className="flex-[1.4] space-y-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step Details
          </h2>
          <Card className="relative overflow-hidden border border-border/70 bg-slate-900 shadow-lg">
            <CardHeader className="relative space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PhaseBadge phase={currentStep.phase} />
                <span className="rounded-full border border-border/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] font-mono text-muted-foreground">
                  Step {currentStepIndex + 1} of {STEPS.length} · label{" "}
                  {currentStep.stepLabel}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-50 md:text-xl">
                {currentStep.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4 pb-6">
              <p className="text-sm leading-relaxed text-slate-200">
                {currentStep.description}
              </p>
              <div className="grid gap-3 text-xs md:grid-cols-2">
                {currentStep.kernelDetails && (
                  <div className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3">
                    <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                      Kernel Focus
                    </h3>
                    <p className="text-[0.78rem] text-slate-200">
                      {currentStep.kernelDetails}
                    </p>
                  </div>
                )}
                {currentStep.hardwareDetails && (
                  <div className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3">
                    <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                      Hardware & SSD View
                    </h3>
                    <p className="text-[0.78rem] text-slate-200">
                      {currentStep.hardwareDetails}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini flow indicator for active layers */}
          <div className="hidden rounded-lg border border-slate-600 bg-slate-800 p-3 text-xs text-muted-foreground md:block">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">
                Active flow in this step
              </span>
              <span className="text-[0.7rem]">
                {currentStep.layers.length} layer
                {currentStep.layers.length === 1 ? "" : "s"} involved
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {currentStep.layers.map((layerId, index) => {
                const layer = LAYERS.find((l) => l.id === layerId);
                if (!layer) {
                  return null;
                }

                return (
                  <div key={layerId} className="flex items-center gap-1.5">
                    <span
                      className={[
                        "inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] font-medium text-slate-100",
                        "border border-slate-600/80",
                      ].join(" ")}
                    >
                      {layer.name}
                    </span>
                    {index < currentStep.layers.length - 1 && (
                      <span className="mx-0.5 h-px w-5 bg-slate-500/40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Timeline and controls */}
        <section className="flex-[1.1] space-y-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Timeline
          </h2>
          <Card className="flex h-full flex-col border border-border/70 bg-slate-900">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Interactive Step Slider
                </span>
                <span className="text-[0.7rem] text-muted-foreground">
                  Drag or play through the full I/O path
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <div className="space-y-3">
                <Slider
                  min={0}
                  max={maxIndex}
                  step={1}
                  value={[currentStepIndex]}
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
                <div className="flex justify-between text-[0.6rem] font-mono text-muted-foreground">
                  <span>
                    0.1 – 0.6
                    <span className="ml-1 rounded bg-emerald-500/10 px-1 py-0.5 text-[0.6rem] text-emerald-300">
                      Bash
                    </span>
                  </span>
                  <span>
                    1 – 15
                    <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.5 text-[0.6rem] text-amber-200">
                      Creation
                    </span>
                  </span>
                  <span className="text-right">
                    16 – 34
                    <span className="ml-1 rounded bg-purple-500/10 px-1 py-0.5 text-[0.6rem] text-purple-200">
                      Write &amp; Persist
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRestart}
                    aria-label="Restart from first step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    aria-label="Previous step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause playback" : "Play timeline"}
                    className="bg-slate-700 text-white hover:bg-slate-600"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentStepIndex === maxIndex}
                    aria-label="Next step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <div className="flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 py-1">
                      <Slider
                        min={1}
                        max={3}
                        step={1}
                        value={[speed]}
                        onValueChange={handleSpeedChange}
                        className="w-20"
                      />
                      <span className="w-8 text-center text-[0.7rem] font-mono text-slate-200">
                        {speed.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  <span className="hidden text-[0.7rem] text-muted-foreground md:inline">
                    Use ← / → keys to nudge steps when focused on slider.
                  </span>
                </div>
              </div>

              <div className="hidden max-h-40 overflow-y-auto rounded-md border border-slate-600 bg-slate-800 p-2 text-[0.7rem] md:block">
                <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Quick step navigator
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {STEPS.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setCurrentStepIndex(step.id);
                        setIsPlaying(false);
                      }}
                      className={[
                        "flex items-center justify-between gap-1 rounded px-1.5 py-1 text-left transition-colors",
                        currentStepIndex === step.id
                          ? "bg-sky-500/20 text-sky-100"
                          : "bg-transparent text-slate-300 hover:bg-slate-800/80",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[0.68rem]">
                        {step.stepLabel}
                      </span>
                      <span className="line-clamp-1 flex-1 text-[0.68rem]">
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-3 text-[0.7rem] text-muted-foreground md:px-6">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <span>
            Visualizing the{" "}
            <span className="font-semibold text-slate-200">
              life of a single I/O
            </span>{" "}
            on ext4 over an SSD with TRIM, NCQ, and an FTL.
          </span>
          <span>
            Phases: Bash (0.1–0.6), Creation (1–15), Write &amp; Persistence
            (16–34).
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
