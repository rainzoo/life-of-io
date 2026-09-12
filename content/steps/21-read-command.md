---
slug: read-command
label: "1"
scenario: read
phase: bash
title: Read Command
layers: [bash]
keyConcept: argv
simple: `cat file.txt` tokenizes to argument vector (argv) with stdout attached to the terminal.
latency_ns: 300000
---

`cat file.txt` tokenizes to argument vector (argv) plus no redirection; standard output stays attached to the terminal. The shell forks and calls `execve()` on `/usr/bin/cat`.

## Kernel

No kernel file state yet. Argument and environment setup precedes `execve()` in the shell process.

## Device

No device I/O. Input resides in terminal buffer and process memory.
