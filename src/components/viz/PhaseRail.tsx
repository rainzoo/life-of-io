import { memo, useState } from "react";
import type { PhaseId, VisualizationStep } from "@/content/schema";
import { PHASE_BADGE_CLASS } from "@/content/theme";
import { eventForSlug } from "./events";

const ORDER: PhaseId[] = ["bash", "creation", "write", "read"];
const PHASE_LABEL: Record<PhaseId, string> = {
	bash: "Command",
	creation: "File Creation",
	write: "Write + Persist",
	read: "Read Path",
};

interface PhaseRailProps {
	steps: VisualizationStep[];
	currentIndex: number;
	onSelect: (index: number) => void;
}

/** Event dots for a collapsed phase header, so key moments stay discoverable. */
function PhaseEventDots({ steps }: { steps: VisualizationStep[] }) {
	const events = steps.flatMap((s) => {
		const marker = eventForSlug(s.slug);
		return marker ? [{ slug: s.slug, title: s.title, ...marker }] : [];
	});
	if (events.length === 0) return null;
	return (
		<span
			className="flex items-center gap-0.5"
			title={events.map((e) => `${e.label} — ${e.title}`).join(", ")}
			aria-hidden="true"
		>
			{events.map((e) => (
				<span key={e.slug} className={`h-1.5 w-1.5 rounded-full ${e.cls}`} />
			))}
		</span>
	);
}

export const PhaseRail = memo(function PhaseRail({
	steps,
	currentIndex,
	onSelect,
}: PhaseRailProps) {
	const current = steps[currentIndex];
	const currentPhase = current ? current.phase : ORDER[0];
	const [open, setOpen] = useState<PhaseId | null>(currentPhase);
	const [prevPhase, setPrevPhase] = useState(currentPhase);
	// Follow the current phase without an effect: adjusting state during
	// render for a changed prop is the sanctioned pattern (no cascade).
	if (prevPhase !== currentPhase) {
		setPrevPhase(currentPhase);
		setOpen(currentPhase);
	}

	return (
		<nav aria-label="Phases" className="flex flex-col gap-1.5">
			{ORDER.filter((phase) => steps.some((s) => s.phase === phase)).map((phase) => {
				const phaseSteps = steps.filter((s) => s.phase === phase);
				const phaseCurrent = phase === currentPhase;
				const expanded = open === phase;
				const done = ORDER.indexOf(currentPhase) > ORDER.indexOf(phase);
				return (
					<div key={phase} className="rounded-lg border border-slate-700/50 bg-slate-900/40">
						<button
							type="button"
							onClick={() => setOpen(expanded ? null : phase)}
							aria-expanded={expanded}
							className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[0.8rem] font-semibold transition-colors ${
								phaseCurrent
									? PHASE_BADGE_CLASS[phase]
										: "text-slate-300 hover:bg-slate-800/50"
								}`}
						>
							<span className="flex items-center gap-2">
								<span
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] ${
										done
											? "bg-emerald-500/30 text-emerald-200"
												: phaseCurrent
														? "bg-current/20 font-bold"
														: "bg-slate-800 text-slate-500"
											}`}
								>
									{done ? "✓" : ORDER.indexOf(phase) + 1}
								</span>
								<span>{PHASE_LABEL[phase]}</span>
							</span>
							<span className="flex items-center gap-1.5">
								{!expanded && <PhaseEventDots steps={phaseSteps} />}
								<span className="font-mono text-[0.65rem] text-slate-500">{phaseSteps.length}</span>
							</span>
						</button>
						{expanded && (
							<ul className="mt-1 flex flex-col gap-0.5">
								{phaseSteps.map((s) => {
										const rendered = steps.indexOf(s);
										const active = rendered === currentIndex;
										const event = eventForSlug(s.slug);
										return (
											<li key={s.slug}>
												<button
													type="button"
													onClick={() => onSelect(rendered)}
													aria-current={active ? "step" : undefined}
													title={event ? `${s.title} — ${event.label}` : s.title}
													className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.8rem] transition-colors ${
													active
													? "bg-slate-700/70 text-slate-100"
													: "text-slate-400 hover:bg-slate-800/60 hover:text-slate-300"
												}`}
											>
												<span className="w-5 shrink-0 font-mono text-[0.65rem] text-slate-500">
												{s.label}
												</span>
												{event && (
													<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${event.cls}`} aria-hidden="true" />
												)}
												<span className="min-w-0 flex-1 truncate">{s.title}</span>
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				);
			})}
		</nav>
	);
});
