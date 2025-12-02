import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import visualizationData from "@/data/visualization-data.json";

type PhaseId = "bash" | "creation" | "write";

type LayerId =
  | "bash"
  | "syscall-vfs"
  | "ext4"
  | "journal"
  | "page-cache"
  | "block"
  | "nvme"
  | "ssd-ftl"
  | "nand"
  | "completion";

interface VisualizationStep {
  id: number;
  /** Human-facing label, e.g. \"0.1\", \"17\" */
  stepLabel: string;
  phase: PhaseId;
  title: string;
  description: string;
  kernelDetails?: string;
  hardwareDetails?: string;
  layers: LayerId[];
}

interface LayerDefinition {
  id: LayerId;
  name: string;
  description: string;
  colorClass: string;
  accentClass: string;
}

// Import data from JSON file
const LAYERS: LayerDefinition[] = visualizationData.layers as LayerDefinition[];
const STEPS: VisualizationStep[] = visualizationData.steps as VisualizationStep[];

// Old step definitions removed - data now loaded from JSON file
// Removed 450+ lines of hardcoded step data

const PHASE_LABELS: Record<PhaseId, string> = {
  bash: "Phase 0 – Bash & User Space",
  creation: "Phase 1 – File Creation",
  write: "Phase 2 – Data Write & Persistence",
};

// Layer grouping by category
type LayerGroupId = "user-space" | "file-system" | "kernel" | "storage-device";

interface LayerGroup {
  id: LayerGroupId;
  name: string;
  layerIds: LayerId[];
}

const LAYER_GROUPS: LayerGroup[] = [
  {
    id: "user-space",
    name: "User Space",
    layerIds: ["bash"],
  },
  {
    id: "file-system",
    name: "File System",
    layerIds: ["syscall-vfs", "ext4", "journal"],
  },
  {
    id: "kernel",
    name: "Kernel",
    layerIds: ["page-cache", "block", "completion"],
  },
  {
    id: "storage-device",
    name: "Storage Device",
    layerIds: ["nvme", "ssd-ftl", "nand"],
  },
];

interface LayerLaneProps {
  layer: LayerDefinition;
  active: boolean;
}

function LayerLane({ layer, active }: LayerLaneProps) {
  return (
    <div
      className={[
        "relative flex items-center justify-between rounded-lg border px-3 py-2 text-xs md:text-sm transition-all duration-300",
        active
          ? "bg-slate-800 border-slate-600 shadow-md scale-[1.01]"
          : "bg-slate-900/50 border-border/60 opacity-80",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold uppercase tracking-tight",
            active ? "bg-slate-700 text-slate-100" : "bg-slate-800 text-muted-foreground",
          ].join(" ")}
        >
          {layer.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div className="flex flex-col">
          <span className={`font-medium leading-tight ${active ? "text-slate-100" : "text-slate-300"}`}>{layer.name}</span>
          <span className="hidden text-[0.7rem] text-muted-foreground md:inline">
            {layer.description}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PhaseBadgeProps {
  phase: PhaseId;
}

function PhaseBadge({ phase }: PhaseBadgeProps) {
  const label = PHASE_LABELS[phase];
  const phaseClass =
    phase === "bash"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/60"
      : phase === "creation"
        ? "bg-amber-500/15 text-amber-200 border-amber-400/60"
        : "bg-purple-500/15 text-purple-200 border-purple-400/60";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide",
        phaseClass,
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const maxIndex = STEPS.length - 1;
  const currentStep = STEPS[currentStepIndex];

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (currentStepIndex === maxIndex) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIndex, maxIndex]);

  useEffect(() => {
    if (isPlaying && currentStepIndex < maxIndex) {
      const interval = 1600 / speed;
      const timer = setTimeout(() => {
        handleNext();
      }, interval);
      return () => clearTimeout(timer);
    }

    if (currentStepIndex === maxIndex) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, handleNext, isPlaying, maxIndex, speed]);

  const handleSliderChange = (value: number[]) => {
    const [index] = value;
    setCurrentStepIndex(index);
    setIsPlaying(false);
  };

  const handleSpeedChange = (value: number[]) => {
    const [newSpeed] = value;
    setSpeed(newSpeed);
  };

  const activeLayerIds = useMemo(
    () => new Set<LayerId>(currentStep.layers),
    [currentStep.layers],
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-3 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Linux File Creation & Persistence
          </h1>
          <p className="max-w-2xl text-[0.75rem] text-muted-foreground md:text-xs">
            ext4 on SSD (Linux 6.x): from Bash command to NAND cells. Use the
            controls below to walk step by step through the life of a single
            write.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Interactive timeline · {STEPS.length} steps</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-4 py-4 md:flex-row md:px-6 md:py-6">
        {/* Left: Layer lanes */}
        <section className="flex-1 space-y-3 md:space-y-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Layers
          </h2>
          <div className="space-y-4">
            {LAYER_GROUPS.map((group) => {
              const groupLayers = LAYERS.filter((layer) =>
                group.layerIds.includes(layer.id)
              );
              const hasActiveLayer = groupLayers.some((layer) =>
                activeLayerIds.has(layer.id)
              );

              return (
                <div key={group.id} className="space-y-2">
                  <h3
                    className={`text-[0.7rem] font-semibold uppercase tracking-[0.15em] ${hasActiveLayer
                      ? "text-slate-200"
                      : "text-muted-foreground"
                      }`}
                  >
                    {group.name}
                  </h3>
                  <div className="space-y-1.5 pl-2 border-l-2 border-slate-700/50">
                    {groupLayers.map((layer) => (
                      <LayerLane
                        key={layer.id}
                        layer={layer}
                        active={activeLayerIds.has(layer.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Center: Current step details */}
        <section className="flex-[1.4] space-y-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step Details
          </h2>
          <Card className="relative overflow-hidden border border-border/70 bg-slate-900 shadow-lg">
            <CardHeader className="relative space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PhaseBadge phase={currentStep.phase} />
                <span className="rounded-full border border-border/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] font-mono text-muted-foreground">
                  Step {currentStepIndex + 1} of {STEPS.length} · label{" "}
                  {currentStep.stepLabel}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-50 md:text-xl">
                {currentStep.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4 pb-6">
              <p className="text-sm leading-relaxed text-slate-200">
                {currentStep.description}
              </p>
              <div className="grid gap-3 text-xs md:grid-cols-2">
                {currentStep.kernelDetails && (
                  <div className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3">
                    <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                      Kernel Focus
                    </h3>
                    <p className="text-[0.78rem] text-slate-200">
                      {currentStep.kernelDetails}
                    </p>
                  </div>
                )}
                {currentStep.hardwareDetails && (
                  <div className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3">
                    <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                      Hardware & SSD View
                    </h3>
                    <p className="text-[0.78rem] text-slate-200">
                      {currentStep.hardwareDetails}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini flow indicator for active layers */}
          <div className="hidden rounded-lg border border-slate-600 bg-slate-800 p-3 text-xs text-muted-foreground md:block">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">
                Active flow in this step
              </span>
              <span className="text-[0.7rem]">
                {currentStep.layers.length} layer
                {currentStep.layers.length === 1 ? "" : "s"} involved
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {currentStep.layers.map((layerId, index) => {
                const layer = LAYERS.find((l) => l.id === layerId);
                if (!layer) {
                  return null;
                }

                return (
                  <div key={layerId} className="flex items-center gap-1.5">
                    <span
                      className={[
                        "inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.7rem] font-medium text-slate-100",
                        "border border-slate-600/80",
                      ].join(" ")}
                    >
                      {layer.name}
                    </span>
                    {index < currentStep.layers.length - 1 && (
                      <span className="mx-0.5 h-px w-5 bg-slate-500/40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Timeline and controls */}
        <section className="flex-[1.1] space-y-3">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Timeline
          </h2>
          <Card className="flex h-full flex-col border border-border/70 bg-slate-900">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Interactive Step Slider
                </span>
                <span className="text-[0.7rem] text-muted-foreground">
                  Drag or play through the full I/O path
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <div className="space-y-3">
                <Slider
                  min={0}
                  max={maxIndex}
                  step={1}
                  value={[currentStepIndex]}
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
                <div className="flex justify-between text-[0.6rem] font-mono text-muted-foreground">
                  <span>
                    0.1 – 0.6
                    <span className="ml-1 rounded bg-emerald-500/10 px-1 py-0.5 text-[0.6rem] text-emerald-300">
                      Bash
                    </span>
                  </span>
                  <span>
                    1 – 15
                    <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.5 text-[0.6rem] text-amber-200">
                      Creation
                    </span>
                  </span>
                  <span className="text-right">
                    16 – 34
                    <span className="ml-1 rounded bg-purple-500/10 px-1 py-0.5 text-[0.6rem] text-purple-200">
                      Write &amp; Persist
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRestart}
                    aria-label="Restart from first step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    aria-label="Previous step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause playback" : "Play timeline"}
                    className="bg-slate-700 text-white hover:bg-slate-600"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentStepIndex === maxIndex}
                    aria-label="Next step"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <div className="flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2 py-1">
                      <Slider
                        min={1}
                        max={3}
                        step={1}
                        value={[speed]}
                        onValueChange={handleSpeedChange}
                        className="w-20"
                      />
                      <span className="w-8 text-center text-[0.7rem] font-mono text-slate-200">
                        {speed.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  <span className="hidden text-[0.7rem] text-muted-foreground md:inline">
                    Use ← / → keys to nudge steps when focused on slider.
                  </span>
                </div>
              </div>

              <div className="hidden max-h-40 overflow-y-auto rounded-md border border-slate-600 bg-slate-800 p-2 text-[0.7rem] md:block">
                <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Quick step navigator
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {STEPS.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setCurrentStepIndex(step.id);
                        setIsPlaying(false);
                      }}
                      className={[
                        "flex items-center justify-between gap-1 rounded px-1.5 py-1 text-left transition-colors",
                        currentStepIndex === step.id
                          ? "bg-sky-500/20 text-sky-100"
                          : "bg-transparent text-slate-300 hover:bg-slate-800/80",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[0.68rem]">
                        {step.stepLabel}
                      </span>
                      <span className="line-clamp-1 flex-1 text-[0.68rem]">
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-3 text-[0.7rem] text-muted-foreground md:px-6">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <span>
            Visualizing the{" "}
            <span className="font-semibold text-slate-200">
              life of a single I/O
            </span>{" "}
            on ext4 over an SSD with TRIM, NCQ, and an FTL.
          </span>
          <span>
            Phases: Bash (0.1–0.6), Creation (1–15), Write &amp; Persistence
            (16–34).
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
