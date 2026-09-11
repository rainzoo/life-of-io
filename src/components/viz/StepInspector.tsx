import { motion } from "framer-motion";
import { Cpu, HardDrive } from "lucide-react";
import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VisualizationStep } from "@/content/schema";
import { PhaseBadge } from "./PhaseBadge";

interface StepInspectorProps {
	step: VisualizationStep;
	index: number;
	total: number;
	reduceMotion: boolean;
}

type Tab = "kernel" | "device";

export const StepInspector = memo(function StepInspector({
	step,
	index,
	total,
	reduceMotion,
}: StepInspectorProps) {
	const [tab, setTab] = useState<Tab>("kernel");
	const body = tab === "kernel" ? step.kernel : step.device;
	return (
		<motion.div
			key={step.slug}
			initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="relative overflow-hidden border border-border/70 bg-slate-900 shadow-lg">
				<CardHeader className="relative space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<PhaseBadge phase={step.phase} />
						<span className="rounded-full border border-border/60 bg-slate-900/80 px-3 py-1 font-mono text-[0.7rem] text-muted-foreground">
							{step.label} · {index + 1}/{total}
						</span>
					</div>
					<CardTitle className="text-lg font-bold text-slate-50 md:text-xl">
						{step.title}
					</CardTitle>
					<p className="font-mono text-[0.7rem] text-slate-400">
						[{step.keyConcept}] {step.simple}
					</p>
				</CardHeader>
				<CardContent className="relative space-y-4 pb-6">
					<p className="text-sm leading-relaxed text-slate-200">
						{step.description}
					</p>
					<div
						role="tablist"
						aria-label="Mechanism"
						className="flex gap-1 rounded-lg border border-slate-700/80 bg-slate-950/80 p-1"
					>
						{(
							[
								{ id: "kernel", label: "Kernel", Icon: Cpu },
								{ id: "device", label: "Device", Icon: HardDrive },
							] as const
						).map(({ id, label, Icon }) => (
							<button
								key={id}
								role="tab"
								aria-selected={tab === id}
								type="button"
								onClick={() => setTab(id)}
								className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[0.7rem] font-medium transition-colors ${
									tab === id
										? "bg-slate-700 text-slate-100"
										: "text-slate-400 hover:text-slate-200"
								}`}
							>
								<Icon className="h-3 w-3" />
								{label}
							</button>
						))}
					</div>
					<div
						role="tabpanel"
						className="rounded-lg border border-slate-700/80 bg-slate-950/80 p-3"
					>
						<p className="whitespace-pre-wrap text-[0.78rem] leading-relaxed text-slate-200">
							{body}
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
});
