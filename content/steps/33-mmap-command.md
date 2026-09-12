---
slug: mmap-command
label: "1"
scenario: mmap
phase: bash
title: Map Command
layers: [bash]
keyConcept: argv
simple: `./reader` tokenizes to argument vector (argv); mapping starts after open.
latency_ns: 300000
---

`./reader file.txt` tokenizes to argument vector (argv) plus a filename operand. The process opens the file read-only, then maps it instead of issuing `read()` calls.

## Kernel

No kernel mapping state yet. Open precedes `mmap()` in the process.

## Device

No device I/O. Arguments reside in process memory.
