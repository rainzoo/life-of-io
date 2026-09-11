import { motion } from "framer-motion";
import { memo } from "react";
import type { LayerId } from "@/content/schema";
import { LAYERS } from "@/content/load";
import { PIPELINE_LANES } from "@/content/theme";

export type Durability = "buffered" | "ordered" | "committed" | "durable";

function durabilityForOrder(order: number): Durability {
	if (order >= 18) return "durable";
	if (order >= 15) return "committed";
	if (order >= 7) return "ordered";
	return "buffered";
}

const DURABILITY_STYLE: Record<Durability, string> = {
	buffered: "border-slate-600 bg-slate-800 text-slate-300",
	ordered: "border-amber-400/60 bg-amber-500/15 text-amber-200",
	committed: "border-sky-400/60 bg-sky-500/15 text-sky-200",
	durable: "border-emerald-400/60 bg-emerald-500/15 text-emerald-200",
};

export function DurabilityBadge({ order }: { order: number }) {
	const d = durabilityForOrder(order);
	return (
		<span
			className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wide ${DURABILITY_STYLE[d]}`}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" />
			{d}
		</span>
	);
}

interface PipelineStackProps {
	activeLayers: Set<LayerId>;
	order: number;
	slug: string;
	reduceMotion: boolean;
}

const JOURNAL_COMMIT_SLUGS = new Set(["journal-transaction", "metadata-commit"]);
const JOURNAL_TRANSIT_SLUGS = new Set(["journal-transaction", "metadata-commit", "fsync-durability"]);
const DIRTY_SLUGS = new Set([
	"copy-to-page-cache",
	"allocate-data-blocks",
	"writeback-begins",
	"block-layer-processing",
	"nvme-command-submission",
	"ssd-processing",
]);

function activeState(
	laneId: string,
	activeLayers: Set<LayerId>,
	slug: string,
): { ring: string; chip: string | null; state: string | null } {
	const lane = PIPELINE_LANES.find((l) => l.id === laneId);
	const isActive = lane ? lane.layerIds.some((id) => activeLayers.has(id)) : false;
	if (!isActive) {
		return { ring: "border-slate-500 bg-slate-800 shadow-md shadow-slate-900/50", chip: null, state: null };
	}
	if (laneId === "transport") {
		const ring = "border-amber-400/70 bg-slate-900 shadow-[0_0_28px_rgba(251,191,36,0.18)]";
		if (slug === "block-layer-processing") return { ring, chip: "merge", state: "bio-merge" };
		// Folio state only when folios are actually involved; journal/discard
		// traffic passing through blk-mq/NVMe gets a transit visual instead.
		if (activeLayers.has("page-cache") || slug === "io-completion") {
			return { ring, chip: DIRTY_SLUGS.has(slug) ? "dirty" : "writeback", state: "dirty-folios" };
		}
		return { ring, chip: "in transit", state: "transit" };
	}
	if (laneId === "filesystem") {
		const journal = JOURNAL_COMMIT_SLUGS.has(slug);
		return {
			ring: journal
				? "border-yellow-300/80 bg-slate-900 shadow-[0_0_28px_rgba(250,204,21,0.22)]"
				: "border-orange-400/60 bg-slate-900",
			chip: journal ? "COMMIT" : "tx",
			state: journal ? "journal-commit" : "journal-tx",
		};
	}
	if (laneId === "media") {
		return {
			ring: "border-red-400/60 bg-slate-900 shadow-[0_0_28px_rgba(248,113,113,0.18)]",
			chip: slug === "ssd-processing" ? "program" : null,
			state: "nand",
		};
	}
	if (laneId === "process") {
		return {
			ring: "border-emerald-400/60 bg-slate-900 shadow-[0_0_28px_rgba(52,211,153,0.15)]",
			chip: null,
			state: "terminal",
		};
	}
	if (laneId === "dispatch") {
		return {
			ring: "border-cyan-400/60 bg-slate-900 shadow-[0_0_28px_rgba(34,211,238,0.15)]",
			chip: null,
			state: "pathwalk",
		};
	}
	return { ring: "border-slate-500 bg-slate-800 shadow-md shadow-slate-900/50", chip: null, state: null };
}

// Resident-state visuals for the active lane. Animated diagrams replace static
// labels; every animation is skipped when reduceMotion is set.
function FolioGrid({ slug, dirty, reduceMotion }: { slug: string; dirty: boolean; reduceMotion: boolean }) {
	const n = 6;
	return (
		<div key={`${slug}-${dirty ? "dirty" : "clean"}`} className="flex items-center gap-1.5">
			{Array.from({ length: n }, (_, i) => (
				<motion.span
					key={i}
					initial={reduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.2, delay: reduceMotion ? 0 : i * 0.06 }}
					className={`h-3 w-2 rounded-sm ${dirty ? (i < 4 ? "bg-amber-500/80" : "bg-amber-400/40") : "bg-sky-500/70"}`}
				/>
			))}
			<span className="shrink-0 text-[0.7rem] text-slate-400">{dirty ? "dirty folios" : "writeback → clean"}</span>
		</div>
	);
}

function BioMerge({ reduceMotion }: { reduceMotion: boolean }) {
	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center gap-0.5">
				{[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						initial={reduceMotion ? undefined : { opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, delay: reduceMotion ? 0 : i * 0.12 }}
						className="h-3 w-4 rounded-sm border border-amber-400/60 bg-amber-500/40"
					/>
				))}
			</div>
			<span className="font-mono text-[0.7rem] text-amber-300">→</span>
			<motion.span
				initial={reduceMotion ? undefined : { opacity: 0, scaleX: 0.5 }}
				animate={{ opacity: 1, scaleX: 1 }}
				transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.36 }}
				className="h-3 w-12 rounded-sm bg-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
			/>
			<span className="shrink-0 text-[0.7rem] text-slate-400">3 bios → 1 segment</span>
		</div>
	);
}

function JournalStrip({ commit, reduceMotion }: { commit: boolean; reduceMotion: boolean }) {
	const blocks = commit ? ["descriptor", "data", "COMMIT"] : ["descriptor", "data"];
	return (
		<div className="flex items-center gap-1.5">
			{blocks.map((b, i) => {
				const isCommit = b === "COMMIT";
				return (
					<motion.span
						key={`${b}-${commit ? "c" : "t"}`}
						initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2, delay: reduceMotion ? 0 : i * 0.1 }}
						className={`rounded border px-1.5 py-0.5 font-mono text-[0.65rem] ${isCommit
							? "border-sky-300/70 bg-sky-400/20 text-sky-100"
							: "border-yellow-300/60 bg-yellow-400/20 text-yellow-100"}`}
					>
						{b}
					</motion.span>
				);
			})}
			<span className="shrink-0 text-[0.7rem] text-slate-400">{commit ? "commit block written" : "running transaction"}</span>
		</div>
	);
}

function NandCells({ programming, reduceMotion }: { programming: boolean; reduceMotion: boolean }) {
	return (
		<div className="flex items-center gap-1.5">
			{Array.from({ length: 8 }, (_, i) => {
				const hot = programming && i === 4;
				return hot ? (
					<motion.span
						key={i}
						animate={reduceMotion ? undefined : { scale: [1, 1.3, 1], opacity: [1, 0.65, 1] }}
						transition={reduceMotion ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
						className="h-3 w-4 rounded-sm bg-orange-500/80 shadow-[0_0_6px_rgba(249,115,22,0.8)]"
					/>
				) : (
					<span key={i} className="h-3 w-4 rounded-sm bg-slate-700" />
				);
			})}
			<span className="shrink-0 text-[0.7rem] text-slate-400">{programming ? "programming page" : "NAND cells"}</span>
		</div>
	);
}

function L2PMap({ reduceMotion }: { reduceMotion: boolean }) {
	const rows = [
		{ lba: "0x12", pba: "0x7A", hot: false },
		{ lba: "0x13", pba: "0xB4", hot: true },
		{ lba: "0x14", pba: "0x7C", hot: false },
	];
	return (
		<div className="flex items-center gap-2">
			<div className="flex flex-col gap-0.5">
				{rows.map((r) => (
					<motion.div
						key={r.lba}
						initial={reduceMotion ? undefined : { opacity: 0, x: -6 }}
						animate={{ opacity: r.hot ? 1 : 0.55, x: 0 }}
						transition={{ duration: 0.25 }}
						className="flex items-center gap-1 font-mono text-[0.65rem]"
					>
						<span className={`rounded border px-1 py-px ${r.hot ? "border-red-300/70 bg-red-400/20 text-red-100" : "border-slate-600/60 bg-slate-800/70 text-slate-400"}`}>
							LBA {r.lba}
						</span>
						{r.hot ? (
							<motion.span
								animate={reduceMotion ? undefined : { x: [0, 3, 0] }}
								transition={reduceMotion ? undefined : { duration: 0.9, repeat: Infinity }}
								className="text-red-300"
							>
								→
							</motion.span>
						) : (
							<span className="text-slate-600">→</span>
						)}
						<span className={`rounded border px-1 py-px ${r.hot ? "border-orange-300/70 bg-orange-400/20 text-orange-100" : "border-slate-600/60 bg-slate-800/70 text-slate-400"}`}>
							PBA {r.pba}
						</span>
					</motion.div>
				))}
			</div>
			<span className="shrink-0 text-[0.7rem] text-slate-400">L2P remap on write</span>
		</div>
	);
}

function TransitStrip({ slug, reduceMotion }: { slug: string; reduceMotion: boolean }) {	const label =
		slug === "trim-deleted-blocks"
			? "discard in transit"
			: JOURNAL_TRANSIT_SLUGS.has(slug)
				? "journal in transit"
				: "write in transit";
	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center gap-1" aria-hidden="true">
				{[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						animate={reduceMotion ? undefined : { x: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
						transition={reduceMotion ? undefined : { duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
						className="h-1.5 w-1.5 rounded-full bg-cyan-300/80"
					/>
				))}
			</div>
			<span className="shrink-0 text-[0.7rem] text-slate-400">{label}</span>
		</div>
	);
}

const TERMINAL_CAPTION: Record<string, string> = {
	"command-execution": "argv + O_CREAT redirection",
	"open-file-request": "openat → do_sys_open",
	"write-request": "write(fd, buf, count)",
};

function TerminalStrip({ slug, reduceMotion }: { slug: string; reduceMotion: boolean }) {
	const tokens = ["echo", '"Hello"', ">", "file.txt"];
	return (
		<div key={slug} className="flex flex-col gap-1.5">
			<div className="flex flex-wrap items-center gap-1 font-mono text-[0.65rem]">
				<span className="text-emerald-300">$</span>
				{tokens.map((t, i) => (
					<motion.span
						key={`${t}-${i}`}
						initial={reduceMotion ? undefined : { opacity: 0, x: -6 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.2, delay: reduceMotion ? 0 : i * 0.12 }}
						className={
							i === 2
								? "text-amber-300"
								: "rounded border border-slate-600/60 bg-slate-800/70 px-1 py-px text-slate-200"
						}
					>
						{t}
					</motion.span>
				))}
			</div>
			<span className="shrink-0 text-[0.7rem] text-slate-400">{TERMINAL_CAPTION[slug] ?? "argv · fd"}</span>
		</div>
	);
}

const PATH_STAGE: Record<string, number> = {
	"open-file-request": 0,
	"path-resolution": 1,
	"file-created": 2,
	"write-request": 2,
	"fsync-durability": 2,
};

const PATH_CAPTION: Record<string, string> = {
	"open-file-request": "trap ring 3 → 0 · path_openat",
	"path-resolution": "link_path_walk → negative dentry",
	"file-created": "dentry + inode instantiated",
	"write-request": "fd → write_iter dispatch",
	"fsync-durability": "ext4_sync_file blocks",
};

function PathWalk({ slug, reduceMotion }: { slug: string; reduceMotion: boolean }) {
	const nodes = ["/", "parent", "file.txt"];
	const stage = PATH_STAGE[slug] ?? 1;
	const negative = slug === "path-resolution";
	return (
		<div key={slug} className="flex flex-col gap-1.5">
			<div className="flex flex-wrap items-center gap-1 font-mono text-[0.65rem]">
				{nodes.map((n, i) => {
					const done = i < stage;
					const current = i === stage;
					const lastNegative = negative && i === nodes.length - 1;
					return (
						<span key={n} className="flex items-center gap-1">
							{i > 0 && <span className="text-slate-600">→</span>}
							<motion.span
								initial={reduceMotion ? undefined : { opacity: 0, y: 4 }}
								animate={{ opacity: done ? 0.75 : 1, y: 0 }}
								transition={{ duration: 0.2, delay: reduceMotion ? 0 : i * 0.12 }}
								className={`rounded border px-1 py-px ${
									lastNegative
										? "border-dashed border-amber-300/70 bg-amber-400/10 text-amber-200"
										: current
											? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_8px_rgba(34,211,238,0.35)]"
											: done
												? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
												: "border-slate-600/60 bg-slate-800/70 text-slate-500"
								}`}
							>
								{n}
								{lastNegative && " ∅"}
							</motion.span>
						</span>
					);
				})}
			</div>
			<span className="shrink-0 text-[0.7rem] text-slate-400">{PATH_CAPTION[slug] ?? "dentry walk"}</span>
		</div>
	);
}

function ResidentStrip({ state, slug, reduceMotion }: { state: string | null; slug: string; reduceMotion: boolean }) {
	if (state === "terminal") return <TerminalStrip slug={slug} reduceMotion={reduceMotion} />;
	if (state === "pathwalk") return <PathWalk slug={slug} reduceMotion={reduceMotion} />;
	if (state === "bio-merge") return <BioMerge reduceMotion={reduceMotion} />;
	if (state === "transit") return <TransitStrip slug={slug} reduceMotion={reduceMotion} />;
	if (state === "dirty-folios") {
		return <FolioGrid slug={slug} dirty={DIRTY_SLUGS.has(slug)} reduceMotion={reduceMotion} />;
	}
	if (state === "journal-tx" || state === "journal-commit") {
		return <JournalStrip commit={state === "journal-commit"} reduceMotion={reduceMotion} />;
	}
	if (state === "nand") {
		if (slug === "ssd-processing") {
			return (
				<div className="flex flex-col gap-1.5">
					<L2PMap reduceMotion={reduceMotion} />
					<NandCells programming reduceMotion={reduceMotion} />
				</div>
			);
		}
		return <NandCells programming={false} reduceMotion={reduceMotion} />;
	}
	return null;
}

export const PipelineStack = memo(function PipelineStack({
	activeLayers,
	order,
	slug,
	reduceMotion,
}: PipelineStackProps) {
	const completionActive = activeLayers.has("completion");
	return (
		<div className="relative flex min-h-[280px] min-w-0 flex-1 flex-col justify-start gap-2">
			<div className="pointer-events-none absolute -right-1.5 bottom-0 top-0 w-px bg-slate-700/60" aria-hidden="true">
				{completionActive &&
					(reduceMotion ? (
						<div className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-emerald-400" />
					) : (
						<motion.div
							key={`cq-${slug}`}
							initial={{ top: "100%", opacity: 0 }}
							animate={{ top: "0%", opacity: [0, 1, 1] }}
							transition={{ duration: 0.9, ease: "easeOut" }}
							className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
						/>
					))}
			</div>
			{PIPELINE_LANES.map((lane) => {
				const active = lane.layerIds.some((id) => activeLayers.has(id));
				const st = activeState(lane.id, activeLayers, slug);
				const ring = active ? st.ring : "border-slate-700/60 bg-slate-900/40";
				const strip = active ? ResidentStrip({ state: st.state, slug, reduceMotion }) : null;
				return (
					<motion.div
						key={lane.id}
						layout={!reduceMotion}
						initial={false}
						animate={{ opacity: active ? 1 : 0.72 }}
						transition={{ duration: 0.25 }}
						className={`relative rounded-xl border px-3 py-2.5 transition-colors duration-300 ${ring}`}
					>
						<div className="flex items-center justify-between gap-2">
							<span className="text-[0.8rem] font-semibold text-slate-100">{lane.name}</span>
							<span className="flex items-center gap-1">
								{lane.layerIds.map((id) => {
									const l = LAYERS.find((x) => x.id === id);
									const on = activeLayers.has(id);
									return (
										<span
											key={id}
											className={`rounded-md border px-1.5 py-0.5 font-mono text-[0.65rem] ${on
											? "border-slate-500/70 bg-slate-800/80 text-slate-200"
										: "border-slate-700/40 bg-slate-900/60 text-slate-500"}`}
										>{l ? l.name : id}</span>
									);
								})}
							{st.chip && (
								<span className="rounded border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-sky-200">{st.chip}</span>
							)}
						</span>
					</div>
					{strip ?? <div className="mt-1.5 font-mono text-[0.65rem] text-slate-500">{lane.hint}</div>}
					{active && (
						<motion.div
							layoutId={reduceMotion ? undefined : "request-packet"}
							className="absolute -left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
							transition={{ type: "spring", stiffness: 500, damping: 35 }}
						/>
					)}
				</motion.div>
				);
			})}
		</div>
	);
});
