import { memo } from "react";
import { Slider } from "@/components/ui/slider";
import type { VisualizationStep } from "@/content/schema";

// Event markers on the scrubber, keyed by stable step slug (survives reorder/insert).
const MARKERS: Record<string, { label: string; cls: string }> = {
	"journal-transaction": { label: "COMMIT", cls: "bg-yellow-300" },
	"io-completion": { label: "CQ", cls: "bg-emerald-400" },
	"pages-marked-clean": { label: "clean", cls: "bg-sky-400" },
	"metadata-commit": { label: "COMMIT", cls: "bg-yellow-300" },
	"fsync-durability": { label: "durable", cls: "bg-emerald-300" },
	"trim-deleted-blocks": { label: "TRIM", cls: "bg-slate-400" },
};

const LEGEND: { label: string; cls: string }[] = [
	{ label: "COMMIT", cls: "bg-yellow-300" },
	{ label: "CQ", cls: "bg-emerald-400" },
	{ label: "clean", cls: "bg-sky-400" },
	{ label: "durable", cls: "bg-emerald-300" },
	{ label: "TRIM", cls: "bg-slate-400" },
];

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
	return (
		<div className="space-y-1.5">
			<div className="relative">
				<Slider
					value={[index]}
					max={steps.length - 1}
					step={1}
					onValueChange={(v) => onChange(v[0])}
					aria-label="Step scrubber"
				/>
				<div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-[10px]">
					{steps.map((s, i) => {
						const marker = MARKERS[s.slug];
						if (!marker) {
							return <span key={s.slug} className="h-1 w-px bg-transparent" aria-hidden="true" />;
						}
						return (
							<button
								key={s.slug}
								type="button"
								title={`${marker.label} — ${s.title}`}
								aria-label={`Jump to ${marker.label}: ${s.title}`}
								onClick={() => onChange(i)}
								className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${marker.cls} ${
									i === index ? "scale-150" : "opacity-70 hover:opacity-100 hover:scale-125"
								}`}
							/>
						);
					})}
				</div>
			</div>
			<div className="flex items-center justify-between font-mono text-[0.65rem] text-slate-500">
				<span>
					{steps[index].label} · {steps[index].slug}
				</span>
				<span className="hidden gap-2 md:flex" aria-label="Timeline markers legend">
					{LEGEND.map((entry) => (
						<span key={entry.label} className="inline-flex items-center gap-1">
							<span className={`h-1.5 w-1.5 rounded-full ${entry.cls}`} aria-hidden="true" /> {entry.label}
						</span>
					))}
				</span>
			</div>
		</div>
	);
});
