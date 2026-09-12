---
slug: direct-command
label: "1"
scenario: direct
phase: bash
title: Direct Command
layers: [bash]
keyConcept: argv
simple: `./direct_reader` tokenizes to argument vector (argv); reads will bypass the page cache.
latency_ns: 300000
---

`./direct_reader file.txt` tokenizes to argument vector (argv) plus a filename operand. The program opens the file with `O_DIRECT`, demanding aligned, cache-bypassing I/O.

## Kernel

No kernel I/O state yet. Flag validation precedes `execve()` in the shell process.

## Device

No device I/O. Arguments reside in process memory.
