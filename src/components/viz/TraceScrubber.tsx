import { memo } from "react";
import { Slider } from "@/components/ui/slider";
import type { VisualizationStep } from "@/content/schema";

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
			<Slider
				value={[index]}
				max={steps.length - 1}
				step={1}
				onValueChange={(v) => onChange(v[0])}
				aria-label="Step scrubber"
			/>
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
