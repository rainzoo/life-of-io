import type { PhaseId } from "@/App";

const PHASE_LABELS: Record<PhaseId, string> = {
  bash: "Phase 0 – Bash & User Space",
  creation: "Phase 1 – File Creation",
  write: "Phase 2 – Data Write & Persistence",
};

interface PhaseBadgeProps {
  phase: PhaseId;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
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
