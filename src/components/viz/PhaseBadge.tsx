import type { PhaseId } from "@/content/schema";
import { PHASE_BADGE_CLASS, PHASE_LABELS } from "@/content/theme";

interface PhaseBadgeProps {
	phase: PhaseId;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
	const label = PHASE_LABELS[phase];
	const phaseClass = PHASE_BADGE_CLASS[phase];

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
