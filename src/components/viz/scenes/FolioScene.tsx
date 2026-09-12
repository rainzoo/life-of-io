import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const DIRTY = new Set(["copy-to-page-cache", "writeback-begins"]);

/** Scene 4: folio lifecycle as SVG. Amber = volatile dirty, sky = clean. */
export function FolioScene({ slug, reduceMotion }: SceneProps) {
	const dirty = DIRTY.has(slug);
	const readahead = slug === "read-readahead";
	const anim = (i: number) =>
		reduceMotion
			? {}
			: { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: i * 0.08 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Page-cache folios">
				{Array.from({ length: 6 }, (_, i) => {
					const filled = readahead ? i < 5 : true;
					const hot = readahead ? i >= 3 : dirty && i < 4;
					return (
						<motion.g key={i} {...anim(i)}>
							<rect
								x={4 + i * 28} y={17} width={24} height={30} rx={3}
								fill={!filled ? "none" : hot ? "rgba(245,158,11,0.7)" : "rgba(14,165,233,0.65)"}
								stroke={hot ? "#fcd34d" : "#38bdf8"} strokeWidth={1}
								strokeDasharray={!filled ? "4 3" : undefined} opacity={!filled ? 0.6 : 1}
							/>
						</motion.g>
					);
				})}
				{/* DRAM tag */}
				<motion.g {...anim(6)}>
					<rect x={184} y={17} width={120} height={30} rx={4} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="4 3" />
					<text x={244} y={36} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#64748b">
						{dirty || readahead ? "DRAM only — volatile" : "DRAM ⇄ device in sync"}
					</text>
				</motion.g>
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{readahead
					? "demand + readahead fill — still volatile until device write"
					: dirty
						? "dirty in DRAM only — lost on crash, not durable"
						: "writeback → clean (device has a copy)"}
			</span>
		</div>
	);
}
