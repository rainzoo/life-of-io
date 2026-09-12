// Pure mapping: slug -> scene + autoplay dwell. No components here
// (keeps react-refresh happy in index.tsx).

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

// Autoplay dwell per scene at 1x. Hero enter animations complete by ~1.5s;
// the remainder is hold time to read the staged caption before advancing.
export const SCENE_DWELL_MS: Record<SceneId, number> = {
	"trap-path": 3000,
	"ext4-alloc": 3000,
	journal: 3800,
	folio: 3200,
	"bio-merge": 3600,
	"nvme-queue": 3600,
	"ftl-nand": 3800,
	"read-path": 3200,
	transit: 3600,
};
