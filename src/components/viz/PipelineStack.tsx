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
	isActive: boolean,
	slug: string,
): { ring: string; chip: string | null; state: string | null } {
	if (!isActive) {
		return { ring: "border-slate-500 bg-slate-800 shadow-md shadow-slate-900/50", chip: null, state: null };
	}
	if (laneId === "transport") {
		return {
			ring: "border-amber-400/70 bg-slate-900 shadow-[0_0_28px_rgba(251,191,36,0.18)]",
			chip: DIRTY_SLUGS.has(slug) ? "dirty" : "writeback",
			state: "dirty-folios",
		};
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
			state: null,
		};
	}
	if (laneId === "dispatch") {
		return {
			ring: "border-cyan-400/60 bg-slate-900 shadow-[0_0_28px_rgba(34,211,238,0.15)]",
			chip: null,
			state: null,
		};
	}
	return { ring: "border-slate-500 bg-slate-800 shadow-md shadow-slate-900/50", chip: null, state: null };
}

// Resident-state strip for the active lane.
function ResidentStrip({ state, slug }: { state: string | null; slug: string }) {
	if (state === "dirty-folios") {
		const dirty = DIRTY_SLUGS.has(slug);
		const n = 6;
		return (
			<div className="flex items-center gap-1.5">
				{Array.from({ length: n }, (_, i) => (
					<span
						key={i}
						className={`h-3 w-2 rounded-sm ${dirty ? (i < 4 ? "bg-amber-500/80" : "bg-amber-400/40") : "bg-sky-500/70"}`}
					/>
				))}
				<span className="shrink-0 text-[0.7rem] text-slate-400">{dirty ? "dirty folios" : "writeback → clean"}</span>
			</div>
		);
	}
	if (state === "journal-tx" || state === "journal-commit") {
		const commit = state === "journal-commit";
		return (
			<div className="flex items-center gap-1.5">
				<span className="rounded border border-yellow-300/60 bg-yellow-400/20 px-1.5 py-0.5 font-mono text-[0.65rem] text-yellow-100">descriptor</span>
				<span className="rounded border border-yellow-300/60 bg-yellow-400/20 px-1.5 py-0.5 font-mono text-[0.65rem] text-yellow-100">data</span>
				{commit && (
					<span className="rounded border border-sky-300/70 bg-sky-400/20 px-1.5 py-0.5 font-mono text-[0.65rem] text-sky-100">COMMIT</span>
				)}
				<span className="shrink-0 text-[0.7rem] text-slate-400">{commit ? "commit block written" : "running transaction"}</span>
			</div>
		);
	}
	if (state === "nand") {
		return (
			<div className="flex items-center gap-1.5">
				{Array.from({ length: 8 }, (_, i) => (
					<span
						key={i}
						className={`h-3 w-4 rounded-sm ${i === 4
							? "bg-orange-500/80 shadow-[0_0_6px_rgba(249,115,22,0.8)]"
							: "bg-slate-700"}`}
					/>
				))}
				<span className="shrink-0 text-[0.7rem] text-slate-400">{slug === "ssd-processing" ? "programming page" : "NAND cells"}</span>
			</div>
		);
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
		<div className="relative flex min-h-0 flex-1 flex-col gap-2">
			<div className="pointer-events-none absolute -right-1.5 bottom-0 top-0 w-px bg-slate-700/60">
				{completionActive && (
					<motion.div
						initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
					/>
				)}
			</div>
			{PIPELINE_LANES.map((lane) => {
				const active = lane.layerIds.some((id) => activeLayers.has(id));
				const st = activeState(lane.id, active, slug);
				const ring = active ? st.ring : "border-slate-700/60 bg-slate-900/40";
				const strip = active ? ResidentStrip({ state: st.state, slug }) : null;
				return (
					<motion.div
						key={lane.id}
						initial={false}
						animate={{ opacity: active ? 1 : 0.72 }}
						transition={{ duration: 0.25 }}
						className={`relative flex-1 rounded-xl border px-3 py-2.5 transition-colors duration-300 ${ring}`}
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
