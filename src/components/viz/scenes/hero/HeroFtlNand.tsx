import { motion } from "motion/react";
import { DrawLine, HG, HeroFrame, Stage, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 7: FTL remap (overwrite = new page, old invalidated) + NAND program. */
export function HeroFtlNand({ slug, reduceMotion }: HeroSceneProps) {
	const programming = slug === "nand-programming" || slug === "ssd-processing";
	const rows = [
		{ lba: "0x12", pba: "0x7A", hot: false, y: 52 },
		{ lba: "0x13", pba: "0xB4", hot: true, y: 122 },
	];
	return (
		<HeroFrame label="FTL remap and NAND program" caption="01 remap LBA → new page → 02 old page invalid → 03 program NAND">
			{rows.map((r, i) => (
				<HG key={`${r.lba}-${r.pba}`} reduceMotion={reduceMotion} d={i * 0.16}>
					<Tag x={24} y={r.y} w={104} h={52} label={`LBA ${r.lba}`} fill="rgba(30,41,59,0.7)" stroke={r.hot ? "#fca5a5" : "#475569"} color={r.hot ? "#fecaca" : "#94a3b8"} />
					<DrawLine reduceMotion={reduceMotion} x1={134} y1={r.y + 26} x2={176} y2={r.y + 26} stroke={r.hot ? "#fca5a5" : "#475569"} w={1.6} delay={0.25 + i * 0.16} />
					<Tag x={182} y={r.y} w={104} h={52} label={`PBA ${r.pba}`} fill={r.hot ? "rgba(251,146,60,0.18)" : "rgba(30,41,59,0.7)"} stroke={r.hot ? "#fdba74" : "#475569"} color={r.hot ? "#fed7aa" : "#94a3b8"} />
				</HG>
			))}
			<HG reduceMotion={reduceMotion} d={0.45}>
				<text x={234} y={198} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="#475569">
					PBA <tspan textDecoration="line-through">0x31 ✕</tspan> invalid
				</text>
			</HG>
			<Stage x={24} y={216} text="01 · remap (log-structured, no overwrite)" />
			<line x1={24} y1={234} x2={376} y2={234} stroke="#1e293b" strokeWidth={1} />
			{Array.from({ length: 5 }, (_, i) => {
				const hot = programming && i === 2;
				return (
					<HG key={i} reduceMotion={reduceMotion} d={0.6 + i * 0.08}>
						<motion.rect
							x={24 + i * 68} y={254} width={60} height={84} rx={6}
							fill={hot ? "rgba(249,115,22,0.8)" : "rgba(51,65,85,0.9)"}
							stroke={hot ? "#fdba74" : "#475569"} strokeWidth={1.4}
							animate={hot && !reduceMotion ? { opacity: [1, 0.55, 1] } : undefined}
							transition={hot && !reduceMotion ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
						/>
					</HG>
				);
			})}
			<Stage x={24} y={362} text="02 · program one page (erase is whole-block, later)" />
		</HeroFrame>
	);
}
