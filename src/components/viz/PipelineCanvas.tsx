import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef } from "react";
import type { LayerId } from "@/content/schema";
import { PIPELINE_LANES } from "@/content/theme";
import { HeroSceneForSlug } from "./scenes/hero";
import { sceneForSlug } from "./scenes/hero/scene-map";

const MONO = "JetBrains Mono, ui-monospace, monospace";

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

function durabilityForStep(scenario: string, slug: string, order: number): Durability {
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

// Fixed station geometry. Never changes between steps — only glow + packet move.
const STATION_CY = [70, 175, 280, 385, 480];
const STATION_ACCENT = ["#34d399", "#22d3ee", "#fb923c", "#fbbf24", "#f87171"];
const SPINE_X = 200;
const CQ_X = 224;

// Station names must fit a 146px box. Long names split across two lines
// (first concept on line one, remainder on line two) and drop the hint.
function stationLabel(name: string, hint: string, cy: number) {
	const parts = name.length > 20 ? [name.split(" + ")[0], name.split(" + ").slice(1).join(" + ")] : [name];
	if (parts.length === 1) {
		return (
			<>
				<text x={22} y={cy - 3} fontFamily="Inter, system-ui, sans-serif" fontSize={13} fontWeight={600} fill="#f1f5f9">
					{name}
				</text>
				<text x={22} y={cy + 17} fontFamily={MONO} fontSize={9.5} fill="#64748b">
					{hint}
				</text>
			</>
		);
	}
	return (
		<>
			<text x={22} y={cy - 8} fontFamily="Inter, system-ui, sans-serif" fontSize={12} fontWeight={600} fill="#f1f5f9">
				{parts[0]}
			</text>
			<text x={22} y={cy + 9} fontFamily="Inter, system-ui, sans-serif" fontSize={12} fontWeight={600} fill="#f1f5f9">
				{parts[1]}
			</text>
		</>
	);
}

interface PipelineCanvasProps {
	activeLayers: Set<LayerId>;
	slug: string;
	reduceMotion: boolean;
}

/**
 * Hero canvas (write-path pilot): one large fixed-topology SVG.
 * Left: five stations + spring packet + permanent CQ rail.
 * Right: the step's concept illustration at 3x the old card size.
 * No cards, no chips, no layout animation.
 */
export const PipelineCanvas = memo(function PipelineCanvas({
	activeLayers,
	slug,
	reduceMotion,
}: PipelineCanvasProps) {
	const completionActive = activeLayers.has("completion");
	const laneActive = PIPELINE_LANES.map((lane) => lane.layerIds.some((id) => activeLayers.has(id)));
	const activeIndex = laneActive.findIndex(Boolean);
	const boxRef = useRef<HTMLDivElement>(null);
	// Never steal scroll on first render (deep links land at scroll 0 with
	// the nav visible); only follow subsequent step changes. Comparing
	// against the previous slug (rather than a mount flag) keeps this
	// correct under StrictMode's double-invoked effects.
	const prevSlugRef = useRef<string | null>(null);

	useEffect(() => {
		if (prevSlugRef.current === null) {
			prevSlugRef.current = slug;
			return;
		}
		if (prevSlugRef.current === slug) return;
		prevSlugRef.current = slug;
		boxRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
	}, [slug, reduceMotion]);

	return (
		<div ref={boxRef} className="scroll-mb-24 rounded-xl border border-border/70 bg-slate-900/60 p-3.5">
			<div className="flex items-start gap-4">
				{/* Path: stations + packet + CQ rail */}
				<svg viewBox="0 0 244 520" className="h-[470px] w-[220px] shrink-0" role="img" aria-label="I/O path">
					{/* spine */}
					<line x1={SPINE_X} y1={STATION_CY[0]} x2={SPINE_X} y2={STATION_CY[STATION_CY.length - 1]} stroke="#334155" strokeWidth={2} />
					{/* CQ rail: fades out when idle so it isn't visual noise.
					    Layout is stable (fixed viewBox) either way. */}
					<motion.g
						initial={false}
						animate={{ opacity: completionActive ? 1 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<line x1={CQ_X} y1={STATION_CY[0]} x2={CQ_X} y2={STATION_CY[STATION_CY.length - 1]} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
						<text x={CQ_X} y={52} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#64748b">CQ</text>
					</motion.g>
					{PIPELINE_LANES.map((lane, i) => {
						const active = laneActive[i];
						const cy = STATION_CY[i];
						const accent = STATION_ACCENT[i];
						return (
							<motion.g key={lane.id} initial={false} animate={{ opacity: active ? 1 : 0.35 }} transition={{ duration: 0.25 }}>
								{active && (
									<rect x={5} y={cy - 35} width={174} height={70} rx={12} fill="none" stroke={accent} strokeWidth={5} opacity={0.22} />
								)}
								<rect
									x={8} y={cy - 32} width={168} height={64} rx={10}
									fill={active ? "#0f172a" : "rgba(15,23,42,0.5)"}
									stroke={active ? accent : "#334155"} strokeWidth={active ? 1.6 : 1}
								/>
							{stationLabel(lane.name, lane.hint, cy)}
							<line x1={176} y1={cy} x2={SPINE_X - 8} y2={cy} stroke={active ? accent : "#475569"} strokeWidth={1.4} />
								<circle cx={SPINE_X} cy={cy} r={3.5} fill={active ? accent : "#475569"} />
							</motion.g>
						);
					})}
					{/* request packet */}
					{activeIndex >= 0 && (
						<motion.g
							initial={false}
							animate={{ y: STATION_CY[activeIndex] }}
							transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
						>
							<circle cx={SPINE_X} cy={0} r={11} fill="#22d3ee" opacity={0.25} />
							<circle cx={SPINE_X} cy={0} r={6} fill="#a5f3fc" />
						</motion.g>
					)}
					{/* completion dot returns up the CQ rail */}
					{completionActive &&
						(reduceMotion ? (
							<circle cx={CQ_X} cy={STATION_CY[0]} r={4} fill="#34d399" />
						) : (
							<motion.circle
								key={`cq-${slug}`}
								cx={CQ_X}
								r={4}
								fill="#34d399"
								initial={{ cy: STATION_CY[STATION_CY.length - 1], opacity: 0 }}
								animate={{ cy: STATION_CY[0], opacity: [0, 1, 1] }}
								transition={{ duration: 0.9, ease: "easeOut" }}
							/>
						))}
				</svg>

				{/* Concept illustration: keyed by SCENE, not step. Same-scene
				    steps persist all shown elements; only the delta (new blocks,
				    focus colors, arrows) animates. Full replay only on scene change. */}
				<div className="min-w-0 flex-1">
					<AnimatePresence mode="wait">
						<motion.div
							key={sceneForSlug(slug)}
							initial={reduceMotion ? undefined : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={reduceMotion ? undefined : { opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<HeroSceneForSlug slug={slug} reduceMotion={reduceMotion} />
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			{/* Color key for scene semantics (station colors live on the stations). */}
			<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-700/60 px-1 pt-2 font-mono text-[0.65rem] text-slate-500" aria-label="Color key">
				<span><span className="text-amber-300">amber</span> volatile</span>
				<span><span className="text-emerald-300">green</span> durable</span>
				<span><span className="text-yellow-200">yellow</span> COMMIT</span>
			</div>
		</div>
	);
});
