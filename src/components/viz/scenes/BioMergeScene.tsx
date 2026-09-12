import { motion } from "motion/react";

interface SceneProps {
	reduceMotion: boolean;
}

/** Scene 5: block-layer bio merge N:1 as SVG — three bios drawn into one request. */
export function BioMergeScene({ reduceMotion }: SceneProps) {
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.25, delay: i * 0.12 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Bio merge">
				{[0, 1, 2].map((i) => (
					<motion.g key={i} {...anim(i)}>
						<rect x={4 + i * 30} y={18} width={26} height={28} rx={3} fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth={1} />
						<text x={17 + i * 30} y={36} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#fde68a">bio</text>
					</motion.g>
				))}
				{/* drawn merge arrow */}
				<motion.line
					x1={100} y1={32} x2={126} y2={32} stroke="#fbbf24" strokeWidth={1.5}
					initial={reduceMotion ? undefined : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.3, delay: 0.4 }}
				/>
				<polygon points="126,28 134,32 126,36" fill="#fbbf24" />
				{/* merged request draws itself via thick round line */}
				<motion.line
					x1={142} y1={32} x2={252} y2={32} stroke="#f59e0b" strokeWidth={26} strokeLinecap="round"
					initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.5 }}
				/>
				<motion.g
					initial={reduceMotion ? undefined : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.9 }}
				>
					<text x={197} y={36} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#451a03">1 request</text>
				</motion.g>
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">01 plug collects → 02 merge 3 bios → 1 request (fewer NVMe commands)</span>
		</div>
	);
}
