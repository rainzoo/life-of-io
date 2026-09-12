import { motion } from "motion/react";
import { CircuitBoard, Cpu } from "lucide-react";
import { memo, useState } from "react";
import type { ReactNode } from "react";
import type { VisualizationStep } from "@/content/schema";
import { PhaseBadge } from "./PhaseBadge";

export function renderInlineCode(text: string): ReactNode[] {
	return text.split(/(`[^`]+`)/g).map((part, i) => {
		if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
			return (
				<code
					key={i}
					className="rounded border border-slate-600/60 bg-slate-800/80 px-1 py-px font-mono text-[0.85em] text-cyan-200"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return <span key={i}>{part}</span>;
	});
}

interface StepInspectorProps {
	step: VisualizationStep;
	index: number;
	total: number;
	reduceMotion: boolean;
}

type Tab = "kernel" | "device";

const TABS: { id: Tab; label: string; Icon: typeof Cpu }[] = [
	{ id: "kernel", label: "Kernel", Icon: Cpu },
	{ id: "device", label: "Device", Icon: CircuitBoard },
];

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
				<p className="f-mono mt-2 text-slate-400">[{step.keyConcept}] {renderInlineCode(step.simple)}</p>
			</header>
			{/* Tabs */}
			<div
				role="tablist"
				aria-label="Mechanism"
				className="mx-2 flex gap-1 rounded-lg border border-slate-700/70 bg-slate-950/70 p-1"
			>
				{TABS.map(({ id, label, Icon }) => (
					<button
						key={id}
						role="tab"
						aria-selected={tab === id}
						type="button"
						onClick={() => setTab(id)}
						className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
							tab === id
								? "bg-slate-700 text-slate-100"
								: "text-slate-400 hover:text-slate-200"
						}`}
					>
						<Icon className="h-3.5 w-3.5" />
						{label}
					</button>
				))}
			</div>
			{/* Scrollable body */}
			<div className="flex-1 overflow-y-auto px-3 py-3">
				<p className="f-body text-slate-300">{renderInlineCode(step.description)}</p>
				<motion.p
					key={`${step.slug}-${tab}`}
					initial={reduceMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
					className="f-body text-slate-200"
				>
					{renderInlineCode(body)}
				</motion.p>
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
