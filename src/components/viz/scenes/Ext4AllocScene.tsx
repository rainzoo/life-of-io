import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";

/** Scene 2: ext4 allocation — extent fill + dirent append, drawn as SVG. */
export function Ext4AllocScene({ slug, reduceMotion }: SceneProps) {
	const isDirent = slug === "add-directory-entry" || slug === "file-created";
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: i * 0.1 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Extent allocation">
				{[0, 1, 2, 3].map((i) => (
					<motion.g key={i} {...anim(i)}>
						<rect
							x={4 + i * 28} y={18} width={24} height={28} rx={3}
							fill={i < 2 ? "rgba(251,146,60,0.65)" : "rgba(51,65,85,0.9)"}
							stroke={i < 2 ? "#fdba74" : "#475569"} strokeWidth={1}
						/>
					</motion.g>
				))}
				<motion.g {...anim(4)}>
					<text x={122} y={37} textAnchor="middle" fontFamily={MONO} fontSize={11} fill="#475569">+</text>
					<rect x={134} y={18} width={150} height={28} rx={4} fill="rgba(251,146,60,0.12)" stroke="#fdba74" strokeWidth={1} />
					<text x={209} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#fed7aa">
						{isDirent ? "dirent  file.txt → ino" : "extent  LBA range"}
					</text>
				</motion.g>
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{isDirent ? "in-memory only — durable after journal COMMIT" : "01 reserve → 02 map (not yet durable)"}
			</span>
		</div>
	);
}
