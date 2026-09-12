import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { VisualizationStep } from "@/content/schema";
import { TraceScrubber } from "./TraceScrubber";

interface ControlBarProps {
	steps: VisualizationStep[];
	index: number;
	maxIndex: number;
	isPlaying: boolean;
	speed: number;
	onRestart: () => void;
	onPrev: () => void;
	onPlayPause: () => void;
	onNext: () => void;
	onSpeed: (v: number[]) => void;
	onScrub: (index: number) => void;
}

const iconBtn = "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-40";

export const ControlBar = memo(function ControlBar({
	steps,
	index,
	maxIndex,
	isPlaying,
	speed,
	onRestart,
	onPrev,
	onPlayPause,
	onNext,
	onSpeed,
	onScrub,
}: ControlBarProps) {
	return (
		<footer className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-border/60 bg-slate-900/90 px-4 py-2 backdrop-blur md:px-6 lg:flex-row lg:items-center">
			<div className="flex items-center gap-1.5">
				<Button variant="outline" size="icon" onClick={onRestart} aria-label="Restart from first step (R)" aria-keyshortcuts="r" title="Restart (R)" className={iconBtn}>
					<RotateCcw className="h-5 w-5" />
				</Button>
				<Button variant="outline" size="icon" onClick={onPrev} disabled={index === 0} aria-label="Previous step (←)" aria-keyshortcuts="ArrowLeft" title="Previous (←)" className={iconBtn}>
					<SkipBack className="h-5 w-5" />
				</Button>
				<Button variant="default" size="icon" onClick={onPlayPause} aria-label={isPlaying ? "Pause playback (Enter)" : "Play timeline (Enter)"} aria-keyshortcuts="Enter" title="Play/Pause (Enter)" className="bg-slate-700 text-white hover:bg-slate-600">
					{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
				</Button>
				<Button variant="outline" size="icon" onClick={onNext} disabled={index === maxIndex} aria-label="Next step (→ or Space)" aria-keyshortcuts="ArrowRight" title="Next (→ / Space)" className={iconBtn}>
					<SkipForward className="h-5 w-5" />
				</Button>
				<span className="mx-2 hidden font-mono text-[0.7rem] text-slate-400 lg:inline">{index + 1}/{steps.length}</span>
				<div className="flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-1.5 py-0.5">
					<Slider min={1} max={3} step={1} value={[speed]} onValueChange={onSpeed} className="w-24" aria-label="Playback speed" />
					<span className="w-8 text-center font-mono text-[0.7rem] text-slate-200">{speed.toFixed(1)}x</span>
				</div>
			</div>
			<div className="min-w-0 flex-1">
				<TraceScrubber steps={steps} index={index} onChange={onScrub} />
			</div>
			<span className="shrink-0 hidden whitespace-nowrap text-[0.7rem] text-slate-400 lg:inline" title="←/→ navigate · Space next · Enter play/pause · R restart">Built with ❤️ by Manas · ←/→ navigate · Space next · Enter play · R restart</span>
		</footer>
	);
});
