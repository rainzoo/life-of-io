# Life of I/O — Content Guide

Source of truth for all user-visible copy. Code and design never define text.

## Layout

- `content/_meta.md` — document title, command, version
- `content/_phases.md` — phase table (`id`, label, blurb)
- `content/_layers.md` — layer table (`id`, name, description)
- `content/steps/*.md` — one file per step, ordered by filename prefix (`01-...`)

## Step format

```md
---
slug: allocate-inode
label: "4"
phase: creation
title: Allocate Inode
layers: [ext4]
keyConcept: Inode
simple: ext4 assigns a free inode and initializes mode, UID, timestamps
---

Body paragraph(s). Technical mechanism only.

## Kernel

Kernel-side mechanism: syscalls, functions, structures.

## Device

Device-side mechanism: queues, media, persistence behavior.
```

Rules:

1. Frontmatter fields `slug`, `label`, `phase`, `title`, `layers` are required.
2. `phase` must be an id from `_phases.md`. `layers` must be ids from `_layers.md`.
3. `slug` must be unique and match the filename suffix.
4. Body is `description`. `## Kernel` maps to the Kernel card. `## Device` maps to the Device card.
5. Technical content only. No audience framing: no "you", "simply", "for beginners",
   "focus", "view", "explained", "overview for".
6. `simple` is one technical sentence, not a simplification.
7. `keyConcept` is a mechanism noun (`Inode`, `bio`, `FTL`), never a role.
8. No styling, colors, icons, or Tailwind classes in content. Design lives in
   `src/content/theme.ts`.
9. Copy budgets (enforced by `npm run content:check`): description ≤ 300 chars,
   Kernel/Device ≤ 140 chars each, `simple` ≤ 210 chars and a single sentence.
   `simple` must not restate the description with a 6+ word verbatim run.

## Validation

`npm run content:check` parses every file and fails on unknown phase/layer ids,
duplicate slugs/labels, or missing required fields.
