import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef } from "react";
import type { LayerId } from "@/content/schema";
import { LAYERS } from "@/content/load";
import { PIPELINE_LANES } from "@/content/theme";
import { SceneForSlug } from "./scenes";

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

export function durabilityForStep(scenario: string, slug: string, order: number): Durability {
	if (scenario === "touch") {
		if (slug === "touch-timestamps") return "committed";
		if (slug === "touch-open") return "ordered";
		return "buffered";
	}
	return durabilityForOrder(order);
}

export function DurabilityBadge({ scenario, slug, order }: { scenario: string; slug: string; order: number }) {
	const d = durabilityForStep(scenario, slug, order);
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
	slug: string;
	reduceMotion: boolean;
}

const COMMIT_SLUGS = new Set(["journal-transaction", "metadata-commit"]);

// Single accent chip per lane — keeps focus on one concept, not many.
function chipForLane(laneId: string, slug: string): string | null {
	if (laneId === "filesystem" && COMMIT_SLUGS.has(slug)) return "COMMIT";
	if (laneId === "transport" && slug === "block-layer-processing") return "merge";
	if (laneId === "transport" && slug === "read-readahead") return "readahead";
	if (laneId === "media" && slug === "ssd-processing") return "program";
	return null;
}

function ringForLane(laneId: string, slug: string): string {
	if (laneId === "transport") return "border-amber-400/70 bg-slate-900 shadow-[0_0_28px_rgba(251,191,36,0.18)]";
	if (laneId === "filesystem") {
		return COMMIT_SLUGS.has(slug)
			? "border-yellow-300/80 bg-slate-900 shadow-[0_0_28px_rgba(250,204,21,0.22)]"
			: "border-orange-400/60 bg-slate-900";
	}
	if (laneId === "media") return "border-red-400/60 bg-slate-900 shadow-[0_0_28px_rgba(248,113,113,0.18)]";
	if (laneId === "process") return "border-emerald-400/60 bg-slate-900 shadow-[0_0_28px_rgba(52,211,153,0.15)]";
	if (laneId === "dispatch") return "border-cyan-400/60 bg-slate-900 shadow-[0_0_28px_rgba(34,211,238,0.15)]";
	return "border-slate-500 bg-slate-800";
}

/**
 * Calm pipeline: fixed spine + fixed-height nodes. Step changes animate
 * opacity + one spring packet + one concept inset. No container layout
 * animation, no resizing, no multi-lane flashing.
 */
export const PipelineStack = memo(function PipelineStack({
	activeLayers,
	slug,
	reduceMotion,
}: PipelineStackProps) {
	const completionActive = activeLayers.has("completion");
	const laneActive = PIPELINE_LANES.map((lane) => lane.layerIds.some((id) => activeLayers.has(id)));
	const activeIndex = laneActive.findIndex(Boolean);
	const laneRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Keep the active lane in view: the stack is taller than the viewport,
	// so without this the animation often plays below the fold.
	useEffect(() => {
		if (activeIndex >= 0) {
			laneRefs.current[activeIndex]?.scrollIntoView({
				behavior: reduceMotion ? "auto" : "smooth",
				block: "nearest",
			});
		}
	}, [slug, activeIndex, reduceMotion]);
	// The scene belongs to the active lane; find which lane renders the inset
	// so other active lanes (e.g. journal transit through block/nvme) stay quiet.
	const sceneLaneIndex = activeIndex;

	return (
		<div className="flex min-w-0 flex-1 gap-3">
			{/* Fixed spine: 5 stops, one spring packet. Never re-layouts. */}
			<div className="relative flex w-6 shrink-0 justify-center" aria-hidden="true">
				<div className="absolute bottom-4 top-4 w-px bg-slate-700/70" />
				<div className="absolute bottom-4 top-4 flex flex-col justify-between">
					{PIPELINE_LANES.map((lane, i) => (
						<span
							key={lane.id}
							className={`h-2 w-2 rounded-full border ${
								laneActive[i] ? "border-cyan-300 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" : "border-slate-600 bg-slate-800"
							}`}
						/>
					))}
				</div>
				{activeIndex >= 0 && (
					<motion.span
						initial={false}
						animate={{ top: `${(activeIndex / Math.max(PIPELINE_LANES.length - 1, 1)) * 100}%` }}
						transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
						className="absolute h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,1)]"
						style={{ translateX: "-50%", translateY: "-50%", left: "50%" }}
					/>
				)}
			</div>

			{/* Fixed-height nodes */}
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				{PIPELINE_LANES.map((lane, i) => {
					const active = laneActive[i];
					const chip = active ? chipForLane(lane.id, slug) : null;
					const showsScene = active && i === sceneLaneIndex;
					return (
						<motion.div
							key={lane.id}
							ref={(el) => {
								laneRefs.current[i] = el;
							}}
							initial={false}
							animate={{ opacity: active ? 1 : 0.4 }}
							transition={{ duration: 0.25 }}
							className={`min-h-[132px] shrink-0 scroll-mb-24 rounded-xl border px-3 py-2.5 transition-colors duration-300 ${
								active ? ringForLane(lane.id, slug) : "border-slate-700/60 bg-slate-900/40"
							}`}
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
												className={`rounded-md border px-1.5 py-0.5 font-mono text-[0.65rem] ${
													on
														? "border-slate-500/70 bg-slate-800/80 text-slate-200"
														: "border-slate-700/40 bg-slate-900/60 text-slate-500"
												}`}
											>
												{l ? l.name : id}
											</span>
										);
									})}
									{chip && (
										<span className="rounded border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-sky-200">
											{chip}
										</span>
									)}
								</span>
							</div>
							<div className="mt-1.5 overflow-hidden">
								{showsScene ? (
									<AnimatePresence mode="wait">
										<motion.div
											key={slug}
											initial={reduceMotion ? undefined : { opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={reduceMotion ? undefined : { opacity: 0 }}
											transition={{ duration: 0.2 }}
										>
											<SceneForSlug slug={slug} reduceMotion={reduceMotion} />
										</motion.div>
									</AnimatePresence>
								) : (
									<div className="flex h-16 items-center font-mono text-[0.65rem] text-slate-500">{lane.hint}</div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Permanent completion rail — always rendered, dot only when active. */}
			<div className="relative w-4 shrink-0" aria-hidden="true">
				<div className="absolute bottom-4 top-4 left-1/2 w-px -translate-x-1/2 bg-slate-700/60" />
				<span className="absolute -top-1 left-1/2 -translate-x-1/2 font-mono text-[0.55rem] uppercase tracking-wide text-slate-500">
					CQ
				</span>
				{completionActive &&
					(reduceMotion ? (
						<div className="absolute left-1/2 top-4 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400" />
					) : (
						<motion.div
							key={`cq-${slug}`}
							initial={{ top: "95%", opacity: 0 }}
							animate={{ top: "5%", opacity: [0, 1, 1] }}
							transition={{ duration: 0.9, ease: "easeOut" }}
							className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
						/>
					))}
			</div>
		</div>
	);
});
