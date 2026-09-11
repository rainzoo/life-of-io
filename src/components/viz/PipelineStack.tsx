import { motion } from "framer-motion";
import { memo } from "react";
import type { LayerId } from "@/content/schema";
import { LAYERS } from "@/content/load";
import { PIPELINE_LANES } from "@/content/theme";

export type Durability = "buffered" | "ordered" | "committed" | "durable";

// Durability derived from step order, not content text.
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
			className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-mono uppercase tracking-wide ${DURABILITY_STYLE[d]}`}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" />
			{d}
		</span>
	);
}

interface PipelineStackProps {
	activeLayers: Set<LayerId>;
	order: number;
	reduceMotion: boolean;
}

function laneState(
	laneId: string,
	active: boolean,
	order: number,
): { ring: string; chip: string | null } {
	if (!active) {
		return {
			ring: "border-slate-700/60 bg-slate-900/40",
			chip: null,
		};
	}
	// State color, not identity color.
	if (laneId === "transport" && order >= 8 && order <= 16) {
		return {
			ring: "border-amber-400/70 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.15)]",
			chip: order <= 14 ? "dirty" : "writeback",
		};
	}
	if (laneId === "filesystem" && order >= 3 && order <= 17) {
		const journal = order === 5 || order === 17;
		return {
			ring: journal
				? "border-yellow-300/80 bg-yellow-400/10 shadow-[0_0_24px_rgba(250,204,21,0.2)]"
				: "border-orange-400/60 bg-orange-500/10",
			chip: journal ? "COMMIT" : "tx",
		};
	}
	if (laneId === "media" && order >= 13) {
		return {
			ring: "border-red-400/60 bg-red-500/10 shadow-[0_0_24px_rgba(248,113,113,0.15)]",
			chip: order === 14 ? "program" : null,
		};
	}
	return {
		ring: "border-slate-500 bg-slate-800 shadow-md shadow-slate-900/50",
		chip: null,
	};
}

export const PipelineStack = memo(function PipelineStack({
	activeLayers,
	order,
	reduceMotion,
}: PipelineStackProps) {
	const completionActive = activeLayers.has("completion");
	return (
		<div className="relative space-y-1.5">
			{/* Completion return channel */}
			<div className="pointer-events-none absolute -right-1 bottom-2 top-2 w-px bg-slate-700/60">
				{completionActive && (
					<motion.div
						initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
					/>
				)}
			</div>
			{PIPELINE_LANES.map((lane) => {
				const active = lane.layerIds.some((id) => activeLayers.has(id));
				const state = laneState(lane.id, active, order);
				const names = LAYERS.filter((l) =>
					lane.layerIds.includes(l.id),
				)
					.map((l) => l.name)
					.join(" · ");
				return (
					<motion.div
						key={lane.id}
						initial={false}
						animate={{ opacity: active ? 1 : 0.72 }}
						transition={{ duration: 0.25 }}
						className={`relative rounded-lg border px-3 py-2.5 transition-colors duration-300 ${state.ring}`}
					>
						<div className="flex items-center justify-between gap-2">
							<div className="min-w-0">
								<p className="truncate text-xs font-semibold text-slate-100 md:text-sm">
									{lane.name}
								</p>
								<p className="truncate font-mono text-[0.65rem] text-slate-400">
									{names} — {lane.hint}
								</p>
							</div>
							{state.chip && (
								<span
									className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide ${
										state.chip === "dirty"
											? "border-amber-400/60 bg-amber-500/20 text-amber-200"
											: state.chip === "COMMIT"
												? "border-yellow-300/70 bg-yellow-400/20 text-yellow-100"
												: state.chip === "program"
													? "border-red-400/60 bg-red-500/20 text-red-200"
													: "border-sky-400/60 bg-sky-500/20 text-sky-200"
									}`}
								>
									{state.chip}
								</span>
							)}
						</div>
						{active && (
							<motion.div
								layoutId={reduceMotion ? undefined : "request-packet"}
								className="absolute -left-[5px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-slate-100 shadow-[0_0_10px_rgba(226,232,240,0.9)]"
								transition={{ type: "spring", stiffness: 500, damping: 35 }}
							/>
						)}
					</motion.div>
				);
			})}
		</div>
	);
});
