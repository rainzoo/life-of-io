import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";

/** Scene 7: FTL L2P remap + NAND program as SVG. Overwrite = new page, old invalid. */
export function FtlNandScene({ slug, reduceMotion }: SceneProps) {
	const programming = slug === "nand-programming" || slug === "ssd-processing";
	const rows = [
		{ lba: "0x12", pba: "0x7A", hot: false, stale: false, y: 12 },
		{ lba: "0x13", pba: "0xB4", hot: true, stale: false, y: 38 },
	];
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, x: -6 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3, delay: i * 0.14 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="FTL remap and NAND program">
				{rows.map((r, i) => (
					<motion.g key={`${r.lba}-${r.pba}`} {...anim(i)}>
						<rect x={4} y={r.y} width={56} height={20} rx={3} fill="rgba(30,41,59,0.7)" stroke={r.hot ? "#fca5a5" : "#475569"} strokeWidth={1} />
						<text x={32} y={r.y + 14} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={r.hot ? "#fecaca" : "#94a3b8"}>LBA {r.lba}</text>
						<motion.line
							x1={64} y1={r.y + 10} x2={104} y2={r.y + 10} stroke={r.hot ? "#fca5a5" : "#475569"} strokeWidth={1.2}
							initial={reduceMotion ? undefined : { pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 0.35, delay: 0.2 + i * 0.14 }}
						/>
						<rect x={108} y={r.y} width={56} height={20} rx={3} fill={r.hot ? "rgba(251,146,60,0.18)" : "rgba(30,41,59,0.7)"} stroke={r.hot ? "#fdba74" : "#475569"} strokeWidth={1} />
						<text x={136} y={r.y + 14} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={r.hot ? "#fed7aa" : "#94a3b8"}>PBA {r.pba}</text>
					</motion.g>
				))}
				{/* invalidated old page */}
				<motion.g {...anim(2)}>
					<rect x={108} y={38} width={56} height={0.1} fill="none" stroke="none" />
					<text x={136} y={60} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill="#475569" opacity={0.7}>
						PBA <tspan textDecoration="line-through">0x31 ✕</tspan> invalid
					</text>
				</motion.g>
				<line x1={184} y1={8} x2={184} y2={56} stroke="#334155" strokeWidth={1} />
				{/* NAND cells */}
				{Array.from({ length: 5 }, (_, i) => {
					const hot = programming && i === 2;
					return (
						<motion.g key={i} {...anim(3 + i * 0.4)}>
							<motion.rect
								x={194 + i * 26} y={17} width={22} height={30} rx={3}
								fill={hot ? "rgba(249,115,22,0.8)" : "rgba(51,65,85,0.9)"}
								stroke={hot ? "#fdba74" : "#475569"} strokeWidth={1}
								animate={hot && !reduceMotion ? { opacity: [1, 0.55, 1] } : undefined}
								transition={hot && !reduceMotion ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
							/>
						</motion.g>
					);
				})}
				<text x={350} y={36} fontFamily={MONO} fontSize={8.5} fill="#64748b">NAND pages</text>
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				overwrite remaps LBA → new page; old page invalid (erase happens later, whole block)
			</span>
		</div>
	);
}
