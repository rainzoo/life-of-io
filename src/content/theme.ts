// All design lives here: Tailwind classes, labels, and pipeline topology.
// Content files must never contain styling.

import type { LayerId, PhaseId } from "./schema";

// Phase badge styles. Color encodes phase identity.
export const PHASE_LABELS: Record<PhaseId, string> = {
	bash: "Phase 0 – Command",
	creation: "Phase 1 – File Creation",
	write: "Phase 2 – Data Write & Persistence",
	read: "Phase 3 – Data Read",
};

export const PHASE_BADGE_CLASS: Record<PhaseId, string> = {
	bash: "bg-emerald-500/15 text-emerald-300 border-emerald-400/60",
	creation: "bg-amber-500/15 text-amber-200 border-amber-400/60",
	write: "bg-purple-500/15 text-purple-200 border-purple-400/60",
	read: "bg-sky-500/15 text-sky-200 border-sky-400/60",
};

// Pipeline swimlanes: the topology the request travels through.
// 5 lanes collapse the 10 content layers for readability.
// Completion renders as an upward overlay channel, not a lane.
export interface PipelineLane {
	id: string;
	name: string;
	layerIds: LayerId[];
	hint: string;
}

export const PIPELINE_LANES: PipelineLane[] = [
	{ id: "process", name: "Process", layerIds: ["bash"], hint: "argv · fd" },
	{ id: "dispatch", name: "VFS + Syscall", layerIds: ["syscall-vfs"], hint: "trap · dentry" },
	{ id: "filesystem", name: "ext4 + Journal", layerIds: ["ext4", "journal"], hint: "inode · tx" },
	{ id: "transport", name: "Page Cache + Block + NVMe", layerIds: ["page-cache", "block", "nvme"], hint: "folio · bio · SQ" },
	{ id: "media", name: "SSD + NAND", layerIds: ["ssd-ftl", "nand"], hint: "L2P · page" },
];
