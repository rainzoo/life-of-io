import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  ArrowDown,
  List,
  X,
} from "lucide-react";
import visualizationData from "@/data/visualization-data.json";
import { LayerLane } from "@/components/viz/LayerLane";
import { PhaseBadge } from "@/components/viz/PhaseBadge";

export type PhaseId = "bash" | "creation" | "write";

export type LayerId =
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

export interface VisualizationStep {
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

export interface LayerDefinition {
  id: LayerId;
  name: string;
  description: string;
  colorClass: string;
  accentClass: string;
}

// Import data from JSON file
const LAYERS: LayerDefinition[] = visualizationData.layers as LayerDefinition[];
const STEPS: VisualizationStep[] = visualizationData.steps as VisualizationStep[];

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

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          if (!isPlaying) handlePrev();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          event.preventDefault();
          if (!isPlaying) handleNext();
          break;
        case 'Enter':
          event.preventDefault();
          handlePlayPause();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          handleRestart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrev, handleNext, handlePlayPause, handleRestart, isPlaying]);

  useEffect(() => {
    if (isPlaying && currentStepIndex < maxIndex) {
      const interval = 1600 / speed;
      const timer = setTimeout(() => {
        handleNext();
      }, interval);
      return () => clearTimeout(timer);
    } else if (currentStepIndex === maxIndex) {
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
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
        <header className="flex items-center justify-center gap-4 border-b border-border/60 px-4 py-3 md:px-6 relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-4 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
            aria-label="Toggle step navigator sidebar"
          >
            <List className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 mb-2">
              Life of IO
            </h1>
            <h2 className="text-lg md:text-xl font-semibold text-slate-300 mb-1">
              Linux File Creation & Persistence
            </h2>

          </div>
        </header>

        <main className="flex-1 flex flex-col gap-4 px-4 py-2 md:flex-row md:px-6 md:py-4 overflow-hidden">
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
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-700/50 relative">
                      {groupLayers.map((layer, index) => {
                        const isActive = activeLayerIds.has(layer.id);
                        const nextLayer = groupLayers[index + 1];
                        const nextIsActive = nextLayer && activeLayerIds.has(nextLayer.id);
                        const showFlow = isActive && nextIsActive;

                        return (
                          <div key={layer.id} className="relative">
                            <LayerLane
                              layer={layer}
                              active={isActive}
                            />
                            {showFlow && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="absolute left-[-13px] top-[calc(100%+4px)] z-10"
                              >
                                <motion.div
                                  animate={{
                                    y: [0, 8, 0],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="text-slate-400"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </motion.div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
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
            <motion.div
              key={`step-${currentStepIndex}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              <Card className="relative overflow-hidden border border-border/70 bg-slate-900 shadow-lg">
                <CardHeader className="relative space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <PhaseBadge phase={currentStep.phase} />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="rounded-full border border-border/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] font-mono text-muted-foreground"
                    >
                      Step {currentStepIndex + 1} of {STEPS.length}
                    </motion.span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <CardTitle className="text-lg font-bold text-slate-50 md:text-xl">
                      {currentStep.title}
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent className="relative space-y-4 pb-6">
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="text-sm leading-relaxed text-slate-200"
                  >
                    {currentStep.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="grid gap-3 text-xs md:grid-cols-2"
                  >
                    {currentStep.kernelDetails && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                        className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3"
                      >
                        <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                          Kernel Focus
                        </h3>
                        <p className="text-[0.78rem] text-slate-200">
                          {currentStep.kernelDetails}
                        </p>
                      </motion.div>
                    )}
                    {currentStep.hardwareDetails && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                        className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3"
                      >
                        <h3 className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                          Hardware & SSD View
                        </h3>
                        <p className="text-[0.78rem] text-slate-200">
                          {currentStep.hardwareDetails}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

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
          <aside className="flex-[1.1] space-y-3">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Timeline
            </h2>
            <Card className="border border-border/70 bg-slate-900">
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
              <CardContent className="space-y-4">
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
                        Write & Persist
                      </span>
                    </span>
                  </div>
                </div>

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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="hidden text-[0.7rem] text-muted-foreground md:inline cursor-help underline decoration-dotted underline-offset-2">
                          Keyboard shortcuts available
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm mb-2">Keyboard Navigation</p>
                          <div className="space-y-1 text-xs">
                            <p><code className="bg-slate-700 px-1 rounded">←/→</code> Previous/Next step</p>
                            <p><code className="bg-slate-700 px-1 rounded">Space/Enter</code> Play/Pause</p>
                            <p><code className="bg-slate-700 px-1 rounded">R</code> Restart from beginning</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <p className="max-w-2xl text-[0.75rem] text-muted-foreground md:text-sm mx-auto">
                    Use the controls to walk step by step through the life of a single write.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        {/* Collapsible Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700 z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-100">Step Navigator</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {STEPS.map((step, index) => {
                      const phaseColor =
                        step.phase === "bash"
                          ? "text-emerald-300"
                          : step.phase === "creation"
                            ? "text-amber-200"
                            : "text-purple-200";

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => {
                            setCurrentStepIndex(index);
                            setIsPlaying(false);
                            setSidebarOpen(false);
                          }}
                          className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${currentStepIndex === index
                            ? "bg-slate-700 border border-slate-600"
                            : "hover:bg-slate-800/50 border border-transparent hover:border-slate-700"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-sm font-medium ${phaseColor}`}>
                              {step.stepLabel}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${currentStepIndex === index ? "text-slate-100" : "text-slate-300"
                                }`}>
                                {step.title}
                              </p>
                            </div>
                          </div>
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
            <a
              href="https://code.manas.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-200 hover:underline"
            >
                Built with ❤️ by Manas
            </a>
            <span className="text-center md:text-left">
              Visualizing the{" "}
              <span className="font-semibold text-slate-200">
                life of a single I/O
              </span>{" "}
              on ext4 over an SSD with TRIM, NCQ, and an FTL.
            </span>
            <span className="text-center md:text-right">
            </span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
