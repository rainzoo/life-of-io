import { memo } from "react";
import type { PhaseId } from "@/content/schema";
import { PHASE_BADGE_CLASS, PHASE_LABELS } from "@/content/theme";

const ORDER: PhaseId[] = ["bash", "creation", "write"];

interface PhaseRailProps {
	phase: PhaseId;
	onSelect: (phase: PhaseId) => void;
}

export const PhaseRail = memo(function PhaseRail({
	phase,
	onSelect,
}: PhaseRailProps) {
	const current = ORDER.indexOf(phase);
	return (
		<ol className="flex gap-1.5 md:flex-col md:gap-2">
			{ORDER.map((p, i) => {
				const done = i < current;
				const now = i === current;
				return (
					<li key={p}>
						<button
							type="button"
							onClick={() => onSelect(p)}
							aria-current={now ? "step" : undefined}
							className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors duration-200 ${
								now
									? PHASE_BADGE_CLASS[p]
									: "border-slate-700/60 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
							}`}
						>
							<span
								className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[0.65rem] ${
									done
										? "bg-emerald-500/30 text-emerald-200"
										: now
											? "bg-current/20 font-bold"
											: "bg-slate-800 text-slate-500"
								}`}
							>
								{done ? "✓" : i}
							</span>
							<span className="hidden text-[0.7rem] font-medium leading-tight lg:inline">
								{PHASE_LABELS[p]}
							</span>
							<span className="font-mono text-[0.65rem] lg:hidden">
								P{i}
							</span>
						</button>
					</li>
				);
			})}
		</ol>
	);
});
