import { motion } from "motion/react";
import { CircuitBoard, Cpu } from "lucide-react";
import { memo, useMemo } from "react";
import type { VisualizationStep } from "@/content/schema";
import { renderInlineCode, termsInText } from "@/lib/inline-code";
import { PhaseBadge } from "./PhaseBadge";

interface StepInspectorProps {
	step: VisualizationStep;
	index: number;
	total: number;
	reduceMotion: boolean;
}

export const StepInspector = memo(function StepInspector({
	step,
	index,
	total,
	reduceMotion,
}: StepInspectorProps) {
	const terms = useMemo(
		() => termsInText(step.description, step.kernel, step.device, step.simple),
		[step],
	);
	return (
		<motion.div
			key={step.slug}
			initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
			className="flex h-full flex-col rounded-xl border border-border/70 bg-slate-900 shadow-lg"
		>
			{/* Sticky header */}
			<header className="border-b border-slate-700/60 px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<PhaseBadge phase={step.phase} />
					<span className="rounded-full border border-border/60 bg-slate-900/80 px-2.5 py-0.5 font-mono text-[0.7rem] text-slate-400">
						{step.label} · {index + 1}/{total}
					</span>
				</div>
			</header>
			{/* Scrollable body: description, then both mechanism sections.
			    Kernel and Device are complements, not alternatives, so both
			    render — no toggle click required. */}
			<div className="flex-1 overflow-y-auto px-3 py-3">
				<p className="f-body text-slate-300">{renderInlineCode(step.description)}</p>
				<motion.div
					key={step.slug}
					initial={reduceMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					{(
						[
							{ label: "Kernel", Icon: Cpu, text: step.kernel },
							{ label: "Device", Icon: CircuitBoard, text: step.device },
						] as const
					).map(({ label, Icon, text }) => (
						<section key={label} aria-label={label} className="mt-3">
							<p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
								<Icon className="h-3.5 w-3.5" aria-hidden="true" />
								{label}
							</p>
							<p className="f-body mt-1 text-slate-200">{renderInlineCode(text)}</p>
						</section>
					))}
				</motion.div>
				{terms.length > 0 && (
					<div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-950/60 px-2.5 py-2">
						<p className="f-eyebrow text-slate-500">Terms in this step</p>
						<dl className="mt-1.5 space-y-1.5">
							{terms.map((t) => (
								<div key={t.term} className="text-[0.8rem] leading-snug">
									<dt className="inline font-mono text-[0.72rem] text-cyan-200">{t.term}</dt>
									<dd className="inline text-slate-400"> — {t.blurb}</dd>
								</div>
							))}
						</dl>
					</div>
				)}
				<div className="mt-3 flex flex-wrap gap-1.5">
					{step.layers.map((id) => (
						<span
							key={id}
							className="rounded-md border border-slate-600/70 bg-slate-900/80 px-2 py-0.5 font-mono text-[0.65rem] text-slate-300"
						>
						{id}
					</span>
					))}
				</div>
			</div>
		</motion.div>
	);
});
