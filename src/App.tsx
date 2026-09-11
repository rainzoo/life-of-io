import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { List, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PhaseRail } from "@/components/viz/PhaseRail";
import { DurabilityBadge, PipelineStack } from "@/components/viz/PipelineStack";
import { StepInspector } from "@/components/viz/StepInspector";
import { TraceScrubber } from "@/components/viz/TraceScrubber";
import { META, STEPS } from "@/content/load";
import type { PhaseId } from "@/content/schema";

const getInitialAppState = () => {
	if (typeof window === "undefined") {
		return { step: 0, speed: 1, play: false };
	}
	const params = new URLSearchParams(window.location.search);
	const step = Number(params.get("step"));
	const speed = Number(params.get("speed"));
	return {
		step: !Number.isNaN(step) && step >= 0 && step < STEPS.length ? step : 0,
		speed: !Number.isNaN(speed) && speed >= 1 && speed <= 3 ? speed : 1,
		play: params.get("play") === "1",
	};
};
function App() {
	const initialState = getInitialAppState();
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialState.step);
	const [isPlaying, setIsPlaying] = useState<boolean>(initialState.play);
	const [speed, setSpeed] = useState<number>(initialState.speed);
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const shouldReduceMotion = useReducedMotion();

	const maxIndex = STEPS.length - 1;
	const currentStep = STEPS[currentStepIndex];

	const handleNext = useCallback(() => {
		setCurrentStepIndex((prev) => {
			const next = Math.min(prev + 1, STEPS.length - 1);
			if (next === STEPS.length - 1) setIsPlaying(false);
			return next;
		});
	}, []);

	const handlePrev = useCallback(() => {
		setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
	}, []);

	const handleRestart = useCallback(() => {
		setCurrentStepIndex(0);
		setIsPlaying(false);
	}, []);

	const handlePlayPause = useCallback(() => {
		setCurrentStepIndex((prev) => (prev === STEPS.length - 1 ? 0 : prev));
		setIsPlaying((playing) => !playing);
	}, []);

	const handleScrub = useCallback((index: number) => {
		setCurrentStepIndex(index);
		setIsPlaying(false);
	}, []);

	const handlePhaseSelect = useCallback((phase: PhaseId) => {
		const found = STEPS.findIndex((s) => s.phase === phase);
		if (found >= 0) {
			setCurrentStepIndex(found);
			setIsPlaying(false);
		}
	}, []);

	const handleSpeedChange = useCallback((value: number[]) => {
		setSpeed(value[0]);
	}, []);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowLeft":
				case "ArrowUp":
					if (!isPlaying) handlePrev();
					break;
				case "ArrowRight":
				case "ArrowDown":
				case " ":
					if (!isPlaying) handleNext();
					break;
				case "Enter":
					handlePlayPause();
					break;
				case "r":
				case "R":
					handleRestart();
					break;
			}
		};
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handlePrev, handleNext, handlePlayPause, handleRestart, isPlaying]);

	useEffect(() => {
		if (isPlaying && currentStepIndex < maxIndex) {
			const timer = setTimeout(() => handleNext(), 1600 / speed);
			return () => clearTimeout(timer);
		}
	}, [currentStepIndex, handleNext, isPlaying, maxIndex, speed]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		params.set("step", String(currentStepIndex));
		params.set("speed", String(speed));
		params.set("play", isPlaying ? "1" : "0");
		window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
	}, [currentStepIndex, speed, isPlaying]);

	return (
		<TooltipProvider>
			<div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
				<header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-6">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700" aria-label="Toggle step navigator sidebar">
							<List className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-xl font-bold tracking-tight md:text-2xl"><span className="gradient-text">Life of IO</span></h1>
							<p className="font-mono text-[0.7rem] text-slate-400">{META.command} · {META.filesystem} · {META.device}</p>
						</div>
					</div>
					<div className="flex items-center gap-2"><DurabilityBadge order={currentStep.order} /></div>
				</header>

				<main className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 py-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1.2fr)] md:px-6">
					<nav aria-label="Phases" className="md:pt-1"><PhaseRail phase={currentStep.phase} onSelect={handlePhaseSelect} /></nav>

					<section aria-label="Pipeline" className="space-y-3">
						<PipelineStack activeLayers={new Set(currentStep.layers)} order={currentStep.order} reduceMotion={shouldReduceMotion ?? false} />
						<div className="flex flex-wrap items-center justify-center gap-2 pt-1">
							<Button variant="outline" size="icon" onClick={handleRestart} aria-label="Restart from first step" className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"><RotateCcw className="h-5 w-5" /></Button>
							<Button variant="outline" size="icon" onClick={handlePrev} disabled={currentStepIndex === 0} aria-label="Previous step" className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"><SkipBack className="h-5 w-5" /></Button>
							<Button variant="default" size="lg" onClick={handlePlayPause} aria-label={isPlaying ? "Pause playback" : "Play timeline"} className="bg-slate-700 text-white hover:bg-slate-600">{isPlaying ? (<Pause className="h-6 w-6" />) : (<Play className="h-6 w-6" />)}</Button>
							<Button variant="outline" size="icon" onClick={handleNext} disabled={currentStepIndex === maxIndex} aria-label="Next step" className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"><SkipForward className="h-5 w-5" /></Button>
							<div className="flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 py-1">
								<Slider min={1} max={3} step={1} value={[speed]} onValueChange={handleSpeedChange} className="w-20" aria-label="Playback speed" />
								<span className="w-8 text-center font-mono text-[0.7rem] text-slate-200">{speed.toFixed(1)}x</span>
							</div>
						</div>
						<TraceScrubber steps={STEPS} index={currentStepIndex} onChange={handleScrub} />
					</section>

					<section aria-label="Step" className="min-w-0"><StepInspector step={currentStep} index={currentStepIndex} total={STEPS.length} reduceMotion={shouldReduceMotion ?? false} /></section>
				</main>

				<AnimatePresence>
					{sidebarOpen && (
						<>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
							<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-slate-700 bg-slate-900">
								<div className="flex items-center justify-between border-b border-slate-700 p-4"><h3 className="text-lg font-semibold text-slate-100">Step Navigator</h3><Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-100"><X className="h-5 w-5" /></Button></div>
								<div className="flex-1 overflow-y-auto p-4">
									<div className="space-y-1">
										{STEPS.map((step, index) => {
											const phaseColor = step.phase === "bash" ? "text-emerald-300" : step.phase === "creation" ? "text-amber-200" : "text-purple-200";
											return (
												<button key={step.slug} type="button" onClick={() => { setCurrentStepIndex(index); setIsPlaying(false); setSidebarOpen(false); }} className={`w-full p-3 text-left transition-all duration-200 ${currentStepIndex === index ? "rounded-lg border border-slate-600 bg-slate-700" : "rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/50"}`}>
													<div className="flex items-center gap-3"><span className={`font-mono text-sm font-medium ${phaseColor}`}>{step.label}</span><div className="min-w-0 flex-1"><p className={`truncate text-sm font-medium ${currentStepIndex === index ? "text-slate-100" : "text-slate-300"}`}>{step.title}</p></div></div>
												</button>
											);
										})}
									</div>
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>

				<footer className="border-t border-border/60 px-4 py-3 text-[0.7rem] text-muted-foreground md:px-6">
					<div className="flex flex-col items-center justify-between gap-2 md:flex-row md:items-center">
						<a href="https://code.manas.me" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-200 hover:underline">Built with ❤️ by Manas</a>
						<span className="text-center md:text-left">Visualizing the <span className="font-semibold text-slate-200">life of a single I/O</span> on {META.filesystem} over an SSD with TRIM, NCQ, and an FTL.</span>
					</div>
				</footer>
			</div>
		</TooltipProvider>
	);
}

export default App;
