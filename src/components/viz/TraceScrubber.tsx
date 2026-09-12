import { memo } from "react";
import { Slider } from "@/components/ui/slider";
import type { VisualizationStep } from "@/content/schema";

// Event markers keyed by stable step slug (survives reorder/insert).
const MARKERS: Record<string, { label: string; cls: string }> = {
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

interface TraceScrubberProps {
	steps: VisualizationStep[];
	index: number;
	onChange: (index: number) => void;
}

export const TraceScrubber = memo(function TraceScrubber({
	steps,
	index,
	onChange,
}: TraceScrubberProps) {
	const events = steps
		.map((s, i) => ({ step: s, i, marker: MARKERS[s.slug] }))
		.filter((e) => e.marker);
	return (
		<div className="space-y-1.5">
			<Slider
				value={[index]}
				max={steps.length - 1}
				step={1}
				onValueChange={(v) => onChange(v[0])}
				aria-label="Step scrubber"
			/>
			{events.length > 0 && (
				<div className="flex flex-wrap items-center gap-1" aria-label="Key events">
					<span className="mr-1 font-mono text-[0.65rem] uppercase tracking-wide text-slate-500">Events</span>
					{events.map(({ step, i, marker }) => {
						const active = i === index;
						return (
							<button
								key={step.slug}
								type="button"
								title={`${marker.label} — ${step.title}`}
								aria-label={`Jump to ${marker.label}: ${step.title}`}
								onClick={() => onChange(i)}
								className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.65rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
									active
										? "border-slate-400 bg-slate-700 text-slate-100 ring-1 ring-white/60"
										: "border-slate-700/60 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
								}`}
							>
								<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${marker.cls}`} aria-hidden="true" />
								{marker.label}
								<span className="max-w-[170px] truncate text-slate-500">— {step.title}</span>
							</button>
						);
					})}
				</div>
			)}
			<div className="flex min-h-[1rem] items-center justify-between gap-3 font-mono text-[0.65rem] text-slate-400">
				<span className="flex min-w-0 flex-1 items-baseline gap-1.5">
					<span className="shrink-0 tabular-nums text-slate-300">
						{steps[index].label} · {index + 1}/{steps.length}
					</span>
					<span className="truncate text-slate-500">{steps[index].slug}</span>
				</span>
			</div>
		</div>
	);
});
