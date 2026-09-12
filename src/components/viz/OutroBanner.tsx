import { motion } from "motion/react";
import { CheckCircle2, Repeat } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import type { OutroDefinition } from "@/content/schema";
import { renderInlineCode } from "@/lib/inline-code";

interface OutroBannerProps {
	outro: OutroDefinition;
	reduceMotion: boolean;
	onReplay: () => void;
}

/**
 * Scenario completion state: calm summary + Replay. Rendered only on the
 * final step; fades in once, never loops.
 */
export const OutroBanner = memo(function OutroBanner({ outro, reduceMotion, onReplay }: OutroBannerProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);
	const boxRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		headingRef.current?.focus({ preventScroll: true });
		boxRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
	}, [outro.scenario, reduceMotion]);
	return (
		<motion.section
			aria-label="Scenario complete"
			initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3.5"
		>
			<div ref={boxRef} className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<motion.span
						initial={false}
						animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
						transition={{ duration: 0.5 }}
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/15"
					>
						<CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
					</motion.span>
					<h3 ref={headingRef} tabIndex={-1} className="f-title text-[1.15rem] text-slate-50 outline-none">
						{outro.title}
					</h3>
				</div>
				<button
					type="button"
					onClick={onReplay}
					className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-3.5 py-1.5 text-[0.8rem] font-medium text-emerald-100 transition-colors hover:bg-emerald-500/25"
				>
					<Repeat className="h-4 w-4" aria-hidden="true" />
					Replay scenario
				</button>
			</div>
			<p className="f-body mt-2 text-slate-200">{renderInlineCode(outro.outcome)}</p>
			<p className="f-body mt-1 text-slate-400">{renderInlineCode(outro.guarantee)}</p>
		</motion.section>
	);
});
