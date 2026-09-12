import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";

/** Scene 3: JBD2 journal — sequential append, drawn as SVG with a drawn connector. */
export function JournalScene({ slug, reduceMotion }: SceneProps) {
	const commit = slug === "journal-transaction" || slug === "metadata-commit" || slug === "fsync-durability";
	const blocks = commit
		? [{ t: "descriptor", w: 78 }, { t: "data", w: 52 }, { t: "COMMIT", w: 64 }]
		: [{ t: "descriptor", w: 78 }, { t: "data", w: 52 }];
	let x = 44;
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.15 + i * 0.18 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Journal transaction">
				{/* circular-log hint */}
				<motion.g {...anim(0)}>
					<path d="M 8 44 A 12 12 0 1 1 8 20" fill="none" stroke="#475569" strokeWidth={1.2} strokeDasharray="3 3" />
					<text x={8} y={58} textAnchor="middle" fontFamily={MONO} fontSize={8} fill="#64748b">log</text>
				</motion.g>
				{/* drawn spine the blocks append onto */}
				<motion.line
					x1={40} y1={32} x2={40 + blocks.reduce((a, b) => a + b.w + 10, 0)} y2={32}
					stroke="#a16207" strokeWidth={1}
					initial={reduceMotion ? undefined : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				/>
				{blocks.map((b, i) => {
					const isCommit = b.t === "COMMIT";
					const bx = x;
					x += b.w + 10;
					return (
						<motion.g key={b.t} {...anim(1 + i)}>
							<rect
								x={bx} y={18} width={b.w} height={28} rx={4}
								fill={isCommit ? "rgba(250,204,21,0.18)" : "rgba(250,204,21,0.08)"}
								stroke={isCommit ? "#fde047" : "rgba(253,224,71,0.5)"} strokeWidth={1}
							/>
							<text x={bx + b.w / 2} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#fef9c3">{b.t}</text>
						</motion.g>
					);
				})}
				{commit && (
					<motion.g {...anim(4)}>
						<rect x={x + 2} y={18} width={118} height={28} rx={4} fill="rgba(52,211,153,0.1)" stroke="#34d399" strokeWidth={1} />
						<text x={x + 61} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#a7f3d0">atomic unit</text>
					</motion.g>
				)}
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{commit ? "01 data bios drain → 02 COMMIT (ordered mode gate)" : "running transaction — not yet durable"}
			</span>
		</div>
	);
}
