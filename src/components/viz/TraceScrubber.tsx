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
	const currentMarker = MARKERS[steps[index].slug];
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
								className={`pointer-events-auto h-1.5 w-1.5 shrink-0 rounded-full transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${marker.cls} ${
									i === index ? "opacity-100 ring-1 ring-white/80" : "opacity-70 hover:opacity-100"
								}`}
							/>
						);
					})}
				</div>
			</div>
			<div className="flex min-h-[1rem] items-center justify-between gap-3 font-mono text-[0.65rem] text-slate-400">
				<span className="flex min-w-0 flex-1 items-baseline gap-1.5">
					<span className="shrink-0 tabular-nums text-slate-300">
						{steps[index].label} · {index + 1}/{steps.length}
					</span>
					<span className="truncate text-slate-500">{steps[index].slug}</span>
					{currentMarker && (
						<span className={`shrink-0 rounded border border-slate-600/60 bg-slate-800/80 px-1.5 py-px uppercase tracking-wide text-slate-200`}>
							{currentMarker.label}
						</span>
					)}
				</span>
			</div>
		</div>
	);
});
