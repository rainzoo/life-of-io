---
slug: command-execution
label: "1"
phase: bash
title: Command Execution
layers: [bash]
keyConcept: argv
simple: Shell tokenizes `echo "Hello" > file.txt` and configures stdout redirection with O_CREAT.
latency_ns: 500000
---

`echo "Hello" > file.txt` tokenizes to argument vector (argv) plus a stdout redirection. The shell opens the target with `O_WRONLY | O_CREAT | O_TRUNC` before `execve()`.

## Kernel

No kernel file state yet. Redirection setup occurs through `openat()` flag translation in the shell process.

## Device

No device I/O. Input resides in terminal buffer and process memory.
