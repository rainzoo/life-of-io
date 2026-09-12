import { motion } from "motion/react";
import { DrawLine, HG, HeroFrame, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 5: bio merge N:1 — plug collects, one request emerges. */
export function HeroBioMerge({ reduceMotion }: HeroSceneProps) {
	return (
		<HeroFrame label="Bio merge" caption="01 plug collects bios → 02 merge into one segment → 03 submit to NVMe">
			{[0, 1, 2].map((i) => (
				<HG key={i} reduceMotion={reduceMotion} d={i * 0.14}>
					<rect x={24 + i * 84} y={52} width={76} height={68} rx={6} fill="rgba(245,158,11,0.3)" stroke="#fbbf24" strokeWidth={1.4} />
					<text x={62 + i * 84} y={92} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12} fill="#fde68a">bio</text>
				</HG>
			))}
			<DrawLine reduceMotion={reduceMotion} x1={200} y1={190} x2={200} y2={228} stroke="#fbbf24" w={2} delay={0.5} />
			<polygon points="195,228 205,228 200,238" fill="#fbbf24" />
			<HG reduceMotion={reduceMotion} d={0.7}>
				<motion.line
					x1={40} y1={280} x2={360} y2={280} stroke="#f59e0b" strokeWidth={52} strokeLinecap="round"
					initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.6 }}
				/>
				<text x={200} y={285} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={13} fill="#451a03">1 request · 3 bios merged</text>
			</HG>
			<HG reduceMotion={reduceMotion} d={1.1}>
				<Tag x={24} y={346} w={352} h={44} fsize={11} label="submit → NVMe SQ (fewer commands)" fill="none" stroke="#334155" color="#64748b" />
			</HG>
		</HeroFrame>
	);
}
