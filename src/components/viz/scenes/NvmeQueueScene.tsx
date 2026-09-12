import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";

/** Scene 6: NVMe SQ slots + doorbell as SVG; CQ returns up a separate rail. */
export function NvmeQueueScene({ slug, reduceMotion }: SceneProps) {
	const completion = slug === "io-completion" || slug === "direct-completion";
	const lit = completion ? 4 : 2;
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: i * 0.1 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="NVMe submission queue">
				{/* SQ frame */}
				<rect x={4} y={8} width={150} height={48} rx={5} fill="none" stroke="#334155" strokeWidth={1} />
				<text x={12} y={20} fontFamily={MONO} fontSize={8} fill="#64748b">SQ</text>
				{[0, 1, 2, 3].map((i) => (
					<motion.g key={i} {...anim(i)}>
						<rect
							x={12 + i * 34} y={24} width={30} height={24} rx={3}
							fill={i < lit ? "rgba(34,211,238,0.2)" : "rgba(30,41,59,0.7)"}
							stroke={i < lit ? "#22d3ee" : "#475569"} strokeWidth={1} opacity={i < lit ? 1 : 0.5}
						/>
						<text x={27 + i * 34} y={40} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={i < lit ? "#a5f3fc" : "#475569"}>
							{i + 1}
						</text>
					</motion.g>
				))}
				{/* drawn doorbell path */}
				<motion.line
					x1={162} y1={32} x2={188} y2={32} stroke="#fbbf24" strokeWidth={1.5}
					initial={reduceMotion ? undefined : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.3, delay: 0.4 }}
				/>
				<motion.g
					animate={reduceMotion || completion ? undefined : { opacity: [0.5, 1, 0.5] }}
					transition={reduceMotion ? undefined : { duration: 1.4, repeat: Infinity }}
				>
					<rect x={190} y={18} width={72} height={28} rx={4} fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth={1} />
					<text x={226} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#fde68a">doorbell</text>
				</motion.g>
				{completion && (
					<motion.g
						initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.3 }}
					>
						<line x1={300} y1={52} x2={300} y2={22} stroke="#34d399" strokeWidth={1.5} />
						<polygon points="296,22 304,22 300,14" fill="#34d399" />
						<rect x={308} y={18} width={76} height={28} rx={4} fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth={1} />
						<text x={346} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#a7f3d0">CQ ↑ irq</text>
					</motion.g>
				)}
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{completion ? "controller posts CQ entry → interrupt wakes waiter" : "01 fill SQ → 02 ring doorbell (MMIO) → 03 controller DMA-fetches"}
			</span>
		</div>
	);
}
