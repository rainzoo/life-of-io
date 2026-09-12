import type { ComponentType } from "react";
import { BioMergeScene } from "./BioMergeScene";
import { Ext4AllocScene } from "./Ext4AllocScene";
import { FolioScene } from "./FolioScene";
import { FtlNandScene } from "./FtlNandScene";
import { JournalScene } from "./JournalScene";
import { NvmeQueueScene } from "./NvmeQueueScene";
import { ReadPathScene } from "./ReadPathScene";
import { TrapPathScene } from "./TrapPathScene";

export interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

export type SceneId =
	| "trap-path"
	| "ext4-alloc"
	| "journal"
	| "folio"
	| "bio-merge"
	| "nvme-queue"
	| "ftl-nand"
	| "read-path"
	| "transit";

const SCENE_COMPONENT: Record<SceneId, ComponentType<SceneProps>> = {
	"trap-path": TrapPathScene,
	"ext4-alloc": Ext4AllocScene,
	journal: JournalScene,
	folio: FolioScene,
	"bio-merge": BioMergeScene,
	"nvme-queue": NvmeQueueScene,
	"ftl-nand": FtlNandScene,
	"read-path": ReadPathScene,
	transit: JournalScene,
};

export function sceneForSlug(slug: string): SceneId {
	if (slug === "block-layer-processing") return "bio-merge";
	if (slug === "journal-transaction" || slug === "metadata-commit" || slug === "fsync-durability") return "journal";
	if (slug === "nvme-command-submission" || slug === "io-completion" || slug === "direct-submit" || slug === "direct-completion") return "nvme-queue";
	if (slug === "ssd-processing" || slug === "nand-programming" || slug === "trim-deleted-blocks") return "ftl-nand";
	if (
		slug === "copy-to-page-cache" || slug === "writeback-begins" || slug === "pages-marked-clean" ||
		slug === "read-readahead"
	) return "folio";
	if (
		slug === "read-cache-hit" || slug === "read-cache-miss" || slug === "read-copy-out" ||
		slug === "mmap-access" || slug === "mmap-fault" || slug === "direct-contrast" ||
		slug === "direct-open" || slug === "direct-command"
	) return "read-path";
	if (
		slug === "command-execution" || slug === "open-file-request" || slug === "path-resolution" ||
		slug === "file-created" || slug === "write-request" || slug === "read-command" ||
		slug === "read-open" || slug === "read-path" || slug === "read-inode" || slug === "read-close" ||
		slug === "touch-command" || slug === "touch-open" || slug === "mmap-command" ||
		slug === "mmap-setup" || slug === "mmap-teardown"
	) return "trap-path";
	if (slug === "allocate-inode" || slug === "add-directory-entry" || slug === "allocate-data-blocks" || slug === "touch-timestamps") return "ext4-alloc";
	return "folio";
}

export function SceneForSlug(props: SceneProps) {
	const id = sceneForSlug(props.slug);
	const C = SCENE_COMPONENT[id];
	return <C {...props} />;
}
