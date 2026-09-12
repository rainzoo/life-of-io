---
slug: direct-command
label: "1"
scenario: direct
phase: bash
title: Direct Command
layers: [bash]
keyConcept: argv
simple: `dd if=file.txt of=/dev/null iflag=direct` opens with O_DIRECT; reads bypass the page cache.
latency_ns: 300000
---

The `dd` utility opens its input with `O_DIRECT`, demanding aligned, cache-bypassing I/O from a real command.

## Kernel

No kernel I/O state yet. Flag validation precedes `execve()` in the shell process.

## Device

No device I/O. Arguments reside in process memory.
