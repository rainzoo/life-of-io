// Key-event markers, keyed by stable step slug (survives reorder/insert).
// Single source shared by the PhaseRail dots (tooltips carry the meaning,
// so no separate legend is needed anywhere).

export interface EventMarker {
	label: string;
	cls: string;
}

const MARKERS: Record<string, EventMarker> = {
	"journal-transaction": { label: "COMMIT", cls: "bg-yellow-300" },
	"io-completion": { label: "CQ", cls: "bg-emerald-400" },
	"pages-marked-clean": { label: "clean", cls: "bg-sky-400" },
	"metadata-commit": { label: "COMMIT", cls: "bg-yellow-300" },
	"fsync-durability": { label: "durable", cls: "bg-emerald-300" },
	"trim-deleted-blocks": { label: "TRIM", cls: "bg-slate-400" },
	"read-readahead": { label: "READ", cls: "bg-cyan-300" },
	"read-cache-hit": { label: "hit", cls: "bg-teal-300" },
	"direct-completion": { label: "CQ", cls: "bg-emerald-400" },
};

export function eventForSlug(slug: string): EventMarker | null {
	return MARKERS[slug] ?? null;
}
