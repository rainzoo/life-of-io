import { memo } from "react";
import { Slider } from "@/components/ui/slider";
import type { VisualizationStep } from "@/content/schema";

// Event markers on the scrubber. Derived from canonical step order.
const MARKERS: Record<number, { label: string; cls: string }> = {
	5: { label: "COMMIT", cls: "bg-yellow-300" },
	15: { label: "CQ", cls: "bg-emerald-400" },
	16: { label: "clean", cls: "bg-sky-400" },
	17: { label: "COMMIT", cls: "bg-yellow-300" },
	18: { label: "durable", cls: "bg-emerald-300" },
	19: { label: "TRIM", cls: "bg-slate-400" },
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
					{steps.map((s, i) =>
						MARKERS[s.order] ? (
							<span
								key={s.slug}
								title={MARKERS[s.order].label}
								className={`h-1.5 w-1.5 rounded-full ${MARKERS[s.order].cls} ${
									i === index ? "scale-150" : "opacity-70"
								}`}
							/>
						) : (
							<span key={s.slug} className="h-1 w-px bg-transparent" />
						),
					)}
				</div>
			</div>
			<div className="flex items-center justify-between font-mono text-[0.65rem] text-slate-500">
				<span>
					{steps[index].label} · {steps[index].slug}
				</span>
				<span className="hidden gap-2 md:flex">
					<span className="inline-flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-yellow-300" /> COMMIT
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> durable
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> TRIM
					</span>
				</span>
			</div>
		</div>
	);
});
