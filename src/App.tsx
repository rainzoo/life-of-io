import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlBar } from "@/components/viz/ControlBar";
import { LatencyWaterfall } from "@/components/viz/LatencyWaterfall";
import { PhaseRail } from "@/components/viz/PhaseRail";
import { DurabilityBadge } from "@/components/viz/PipelineCanvas";
import { PipelineCanvas } from "@/components/viz/PipelineCanvas";
import { StepInspector } from "@/components/viz/StepInspector";
import { renderInlineCode } from "@/lib/inline-code";
import { SCENE_DWELL_MS, sceneForSlug } from "@/components/viz/scenes/hero/scene-map";
import { META, SCENARIOS, stepsForScenario } from "@/content/load";
import { PHASE_LABELS } from "@/content/theme";

const DEFAULT_SCENARIO = "write";

// Autoplay dwell: each scene's enter animation completes by ~1.5s; the rest
// is hold time so the staged caption can be read before advancing.
// ANIM_FLOOR_MS guarantees content finishes even at 3x speed.
const ANIM_FLOOR_MS = 1600;

function dwellForSlug(slug: string): number {
	return SCENE_DWELL_MS[sceneForSlug(slug)] ?? 3000;
}

const getInitialAppState = () => {
	if (typeof window === "undefined") return { scenario: DEFAULT_SCENARIO, step: 0, speed: 1, play: false };
	const params = new URLSearchParams(window.location.search);
	const rawScenario = params.get("scenario") ?? DEFAULT_SCENARIO;
	const scenario = SCENARIOS.some((s) => s.id === rawScenario) ? rawScenario : DEFAULT_SCENARIO;
	const count = stepsForScenario(scenario).length;
	const step = Number(params.get("step"));
	const speed = Number(params.get("speed"));
	return {
		scenario,
		step: !Number.isNaN(step) && step >= 0 && step < count ? step : 0,
		speed: !Number.isNaN(speed) && speed >= 1 && speed <= 3 ? speed : 1,
		play: params.get("play") === "1",
	};
};

function App() {
	const initialState = getInitialAppState();
	const [scenarioId, setScenarioId] = useState<string>(initialState.scenario);
	const steps = useMemo(() => stepsForScenario(scenarioId), [scenarioId]);
	const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialState.step);
	const [isPlaying, setIsPlaying] = useState<boolean>(initialState.play);
	const [speed, setSpeed] = useState<number>(initialState.speed);
	const shouldReduceMotion = useReducedMotion();
	const reduceMotion = shouldReduceMotion ?? false;

	const maxIndex = steps.length - 1;
	const currentStep = steps[currentStepIndex] ?? steps[0];

	const handleNext = useCallback(() => {
		setCurrentStepIndex((prev) => {
			const next = Math.min(prev + 1, maxIndex);
			if (next === maxIndex) setIsPlaying(false);
			return next;
		});
	}, [maxIndex]);
	const handlePrev = useCallback(() => setCurrentStepIndex((p) => Math.max(p - 1, 0)), []);
	const handleRestart = useCallback(() => { setCurrentStepIndex(0); setIsPlaying(false); }, []);
	const handlePlayPause = useCallback(() => { setCurrentStepIndex((p) => (p === maxIndex ? 0 : p)); setIsPlaying((x) => !x); }, [maxIndex]);
	const handleScrub = useCallback((index: number) => { setCurrentStepIndex(index); setIsPlaying(false); }, []);
	const handleSpeedChange = useCallback((value: number[]) => setSpeed(value[0]), []);
	const handleScenario = useCallback((id: string) => {
		setScenarioId(id);
		setCurrentStepIndex(0);
		setIsPlaying(false);
	}, []);

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
			const timer = setTimeout(() => handleNext(), Math.max(ANIM_FLOOR_MS, dwellForSlug(currentStep.slug) / speed));
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
		params.set("scenario", scenarioId);
		params.set("step", String(currentStepIndex));
		params.set("speed", String(speed));
		params.set("play", isPlaying ? "1" : "0");
		window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
	}, [scenarioId, currentStepIndex, speed, isPlaying]);

	return (
		<TooltipProvider>
			<div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
				<header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 md:px-6">
					<div className="min-w-0">
						<h1 className="f-title px-2 text-slate-50">Life of IO</h1>
						<p className="f-mono text-slate-400">{scenario.command} · {META.filesystem} · {META.device}</p>
						<p className="f-body mt-1 max-w-[72ch] text-slate-500">{META.intro}</p>
					</div>
					{scenario.persistent && (
						<DurabilityBadge scenario={scenarioId} slug={currentStep.slug} order={currentStep.order} />
					)}
				</header>

				<main className="mx-auto w-full max-w-[1720px] flex-1 grid grid-cols-1 gap-5 px-4 py-4 md:px-6 lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,400px)]">
					<PhaseRail steps={steps} currentIndex={currentStepIndex} onSelect={handleScrub} />

					<section aria-label="Pipeline" className="flex min-h-0 min-w-0 flex-col gap-3">
						<div role="tablist" aria-label="Scenario" className="flex flex-wrap gap-1.5">
							{SCENARIOS.map((s) => (
								<button
									key={s.id}
									type="button"
									role="tab"
									aria-selected={s.id === scenarioId}
									title={s.blurb}
									onClick={() => handleScenario(s.id)}
									className={`rounded-full border px-3 py-1 text-[0.75rem] font-medium transition-colors ${
										s.id === scenarioId
											? "border-slate-400 bg-slate-700 text-slate-100"
											: "border-slate-700/60 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
									}`}
								>
									{s.label}
								</button>
							))}
						</div>
						<div className="rounded-xl border border-border/70 bg-slate-900/60 p-3.5">
							<p className="f-eyebrow text-slate-500">{PHASE_LABELS[currentStep.phase]} · Step {currentStep.label} of {steps.length}</p>
							<h2 className="f-title mt-1 text-slate-50">{currentStep.title}</h2>
							<p className="f-body mt-2 text-slate-200">
								<span className="mr-2 rounded border border-slate-600/60 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.7rem] text-cyan-200">{currentStep.keyConcept}</span>
								{renderInlineCode(currentStep.simple)}
							</p>
						</div>
						<LatencyWaterfall steps={steps} index={currentStepIndex} onSelect={handleScrub} />
						<PipelineCanvas activeLayers={new Set(currentStep.layers)} slug={currentStep.slug} reduceMotion={reduceMotion} />
					</section>

					<section aria-label="Step" className="min-w-0">
						<StepInspector step={currentStep} index={currentStepIndex} total={steps.length} reduceMotion={reduceMotion} />
					</section>
				</main>

				<ControlBar steps={steps} index={currentStepIndex} maxIndex={maxIndex} isPlaying={isPlaying} speed={speed} onRestart={handleRestart} onPrev={handlePrev} onPlayPause={handlePlayPause} onNext={handleNext} onSpeed={handleSpeedChange} onScrub={handleScrub} />
			</div>
		</TooltipProvider>
	);
}

export default App;
