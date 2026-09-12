// Canonical content types. Pure data — no styling, icons, or Tailwind here.
// Design mapping lives in `theme.ts`. Markdown in `content/` is the source of truth.

export type PhaseId = "bash" | "creation" | "write" | "read";

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

export interface ScenarioDefinition {
	id: string;
	label: string;
	command: string;
	persistent: boolean;
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
	/** Human-facing label, e.g. "1", "20". Unique within a scenario. */
	label: string;
	/** Scenario this step belongs to (e.g. "write", "read"). */
	scenario: string;
	/** Array position within its scenario. */
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
	/** Typical latency, nanoseconds, order-of-magnitude. */
	latencyNs: number;
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
	scenarios: ScenarioDefinition[];
	layers: LayerDefinition[];
	steps: VisualizationStep[];
}
