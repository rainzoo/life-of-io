// Canonical content types. Pure data — no styling, icons, or Tailwind here.
// Design mapping lives in `theme.ts`. Markdown in `content/` is the source of truth.

export type PhaseId = "bash" | "creation" | "write";

export type LayerId =
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

export interface PhaseDefinition {
	id: PhaseId;
	label: string;
	blurb: string;
}

export interface LayerDefinition {
	id: LayerId;
	name: string;
	description: string;
}

export interface VisualizationStep {
	/** Stable id for deep links, derived from filename slug. */
	slug: string;
	/** Human-facing label, e.g. "1", "20". */
	label: string;
	/** Array position. */
	order: number;
	phase: PhaseId;
	title: string;
	/** Main body paragraphs. Technical mechanism only. */
	description: string;
	/** One technical sentence. */
	simple: string;
	/** Mechanism noun, e.g. "Inode", "bio", "FTL". */
	keyConcept: string;
	/** `## Kernel` section. */
	kernel: string;
	/** `## Device` section. */
	device: string;
	layers: LayerId[];
}

export interface ContentBundle {
	meta: {
		title: string;
		command: string;
		filesystem: string;
		device: string;
		version: number;
		intro: string;
	};
	phases: PhaseDefinition[];
	layers: LayerDefinition[];
	steps: VisualizationStep[];
}
