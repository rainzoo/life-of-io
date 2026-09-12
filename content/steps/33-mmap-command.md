---
slug: mmap-command
label: "1"
scenario: mmap
phase: bash
title: Map Command
layers: [bash]
keyConcept: argv
simple: `grep "Hello" file.txt` tokenizes to argv; GNU grep mmaps regular files instead of reading.
latency_ns: 300000
---

`grep "Hello" file.txt` tokenizes to argument vector (argv) plus a pattern and a filename operand. GNU grep memory-maps regular-file input, so bytes arrive via page faults instead of `read()` calls.

## Kernel

No kernel mapping state yet. Open precedes `mmap()` in the process.

## Device

No device I/O. Arguments reside in process memory.
