import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar } from "@/components/viz/ControlBar";
import { PhaseRail } from "@/components/viz/PhaseRail";
import { DurabilityBadge, PipelineStack } from "@/components/viz/PipelineStack";
import { StepInspector, renderInlineCode } from "@/components/viz/StepInspector";
import { META, STEPS } from "@/content/load";
import { PHASE_LABELS } from "@/content/theme";

// Autoplay lingers on visual-heavy steps so animations can play out.
const STEP_DWELL_MS: Record<string, number> = {
	"journal-transaction": 2600,
	"block-layer-processing": 2400,
	"nvme-command-submission": 2400,
	"ssd-processing": 2600,
	"nand-programming": 2400,
	"io-completion": 2400,
	"metadata-commit": 2600,
};

export function dwellForSlug(slug: string): number {
	return STEP_DWELL_MS[slug] ?? 1600;
}

const getInitialAppState = () => {
	if (typeof window === "undefined") return { step: 0, speed: 1, play: false };
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
	const handlePrev = useCallback(() => setCurrentStepIndex((p) => Math.max(p - 1, 0)), []);
	const handleRestart = useCallback(() => { setCurrentStepIndex(0); setIsPlaying(false); }, []);
	const handlePlayPause = useCallback(() => { setCurrentStepIndex((p) => (p === STEPS.length - 1 ? 0 : p)); setIsPlaying((x) => !x); }, []);
	const handleScrub = useCallback((index: number) => { setCurrentStepIndex(index); setIsPlaying(false); }, []);
	const handleSpeedChange = useCallback((value: number[]) => setSpeed(value[0]), []);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); if (!isPlaying) handlePrev(); }
			else if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") { event.preventDefault(); if (!isPlaying) handleNext(); }
			else if (event.key === "Enter") { event.preventDefault(); handlePlayPause(); }
			else if (event.key === "r" || event.key === "R") { event.preventDefault(); handleRestart(); }
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [handlePrev, handleNext, handlePlayPause, handleRestart, isPlaying]);

	useEffect(() => {
		if (isPlaying && currentStepIndex < maxIndex) {
			const timer = setTimeout(() => handleNext(), dwellForSlug(currentStep.slug) / speed);
			return () => clearTimeout(timer);
		}
	}, [currentStepIndex, handleNext, isPlaying, maxIndex, speed, currentStep.slug]);

	useEffect(() => {
		const onVisibility = () => {
			if (document.hidden) setIsPlaying(false);
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, []);

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
				<header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 md:px-6">
					<div className="min-w-0">
						<h1 className="f-title px-2 text-slate-50">Life of IO</h1>
						<p className="f-mono text-slate-400">{META.command} · {META.filesystem} · {META.device}</p>
						<p className="f-body mt-1 max-w-[72ch] text-slate-500">{META.intro}</p>
					</div>
					<DurabilityBadge order={currentStep.order} />
				</header>

				<main className="mx-auto w-full max-w-[1720px] flex-1 grid grid-cols-1 gap-5 px-4 py-4 md:px-6 lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,400px)]">
					<PhaseRail steps={STEPS} currentIndex={currentStepIndex} onSelect={handleScrub} />

					<section aria-label="Pipeline" className="flex min-h-0 min-w-0 flex-col gap-3">
						<div className="rounded-xl border border-border/70 bg-slate-900/60 p-3.5">
							<p className="f-eyebrow text-slate-500">{PHASE_LABELS[currentStep.phase]} · Step {currentStep.label} of {STEPS.length}</p>
							<h2 className="f-title mt-1 text-slate-50">{currentStep.title}</h2>
							<p className="f-body mt-2 text-slate-200">{renderInlineCode(currentStep.description)}</p>
						</div>
						<PipelineStack activeLayers={new Set(currentStep.layers)} order={currentStep.order} slug={currentStep.slug} reduceMotion={shouldReduceMotion ?? false} />
					</section>

					<section aria-label="Step" className="min-w-0">
						<StepInspector step={currentStep} index={currentStepIndex} total={STEPS.length} reduceMotion={shouldReduceMotion ?? false} />
					</section>
				</main>

				<ControlBar steps={STEPS} index={currentStepIndex} maxIndex={maxIndex} isPlaying={isPlaying} speed={speed} onRestart={handleRestart} onPrev={handlePrev} onPlayPause={handlePlayPause} onNext={handleNext} onSpeed={handleSpeedChange} onScrub={handleScrub} />
			</div>
		</TooltipProvider>
	);
}

export default App;
