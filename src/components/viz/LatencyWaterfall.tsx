import { motion } from "motion/react";
import { memo } from "react";
import type { VisualizationStep } from "@/content/schema";

function formatLatency(ns: number): string {
	if (ns < 1000) return `${ns} ns`;
	if (ns < 1000000) {
		const v = ns / 1000;
		return `${Number.isInteger(v) ? v : v.toFixed(1)} µs`;
	}
	const v = ns / 1000000;
	return `${Number.isInteger(v) ? v : v.toFixed(1)} ms`;
}

const PHASE_BAR: Record<string, string> = {
	bash: "bg-emerald-400/80",
	creation: "bg-amber-400/80",
	write: "bg-purple-400/80",
	read: "bg-sky-400/80",
};

interface LatencyWaterfallProps {
	steps: VisualizationStep[];
	index: number;
	onSelect: (index: number) => void;
}

export const LatencyWaterfall = memo(function LatencyWaterfall({
	steps,
	index,
	onSelect,
}: LatencyWaterfallProps) {
	const current = steps[index];
	const logs = steps.map((s) => Math.log10(Math.max(s.latencyNs, 1)));
	const min = Math.min(...logs);
	const max = Math.max(...logs);
	const span = Math.max(max - min, 1e-9);
	return (
		<div className="rounded-xl border border-border/70 bg-slate-900/60 px-3.5 py-2.5">
			<div className="flex items-baseline justify-between gap-2">
				<p className="f-eyebrow text-slate-500">Typical step latency · order-of-magnitude</p>
				<p className="f-mono shrink-0 text-slate-300">
					{current ? `${formatLatency(current.latencyNs)} · ${current.title}` : ""}
				</p>
			</div>
			<div className="mt-2 flex h-14 items-end gap-1" role="tablist" aria-label="Latency per step">
				{steps.map((s, i) => {
					const frac = (logs[i] - min) / span;
					const active = i === index;
					return (
						<button
							key={s.slug}
							type="button"
							role="tab"
							aria-selected={active}
							aria-label={`${s.title}: typically ${formatLatency(s.latencyNs)}`}
							title={`${s.title} — typically ${formatLatency(s.latencyNs)}`}
							onClick={() => onSelect(i)}
							className="flex h-full min-w-0 flex-1 items-end rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
						>
							<motion.span
								initial={false}
								animate={{ height: `${12 + frac * 88}%` }}
								transition={{ duration: 0.3 }}
								className={`w-full rounded-sm ${PHASE_BAR[s.phase] ?? "bg-slate-500/80"} ${
									active ? "opacity-100 ring-1 ring-white/80" : "opacity-50 hover:opacity-90"
								}`}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
});
