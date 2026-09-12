---
slug: touch-command
label: "1"
scenario: touch
phase: bash
title: Touch Command
layers: [bash]
keyConcept: argv
simple: `touch file.txt` tokenizes to argument vector (argv) with no redirection.
latency_ns: 300000
---

`touch file.txt` tokenizes to argument vector (argv) plus no redirection or pipeline. The shell forks and calls `execve()` on `/usr/bin/touch`.

## Kernel

No kernel file state yet. Argument parsing precedes `execve()` in the shell process.

## Device

No device I/O. Input resides in terminal buffer and process memory.
