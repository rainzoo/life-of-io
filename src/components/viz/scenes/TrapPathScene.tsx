import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";

/** Scene 1: syscall trap + dentry walk, drawn as SVG. */
export function TrapPathScene({ slug, reduceMotion }: SceneProps) {
	const negative = slug === "path-resolution";
	const nodes = ["/", "parent", "file.txt"];
	const widths = [22, 52, 58];
	const xs = [176, 204, 262];
	const stage = slug === "open-file-request" || slug === "read-open" ? 0 : slug === "file-created" || slug === "write-request" || slug === "read-inode" ? 2 : 1;
	const anim = (i: number) =>
		reduceMotion ? {} : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: 0.1 + i * 0.12 } };
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Syscall trap and dentry walk">
				{/* ring 3 box */}
				<motion.g {...anim(0)}>
					<rect x={4} y={20} width={52} height={24} rx={4} fill="rgba(30,41,59,0.7)" stroke="#475569" strokeWidth={1} />
					<text x={30} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#94a3b8">ring 3</text>
				</motion.g>
				{/* trap arrow: drawn once */}
				<motion.line
					x1={60} y1={32} x2={80} y2={32} stroke="#22d3ee" strokeWidth={1.5}
					initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				/>
				<motion.g {...anim(1)}>
					<polygon points="80,28 88,32 80,36" fill="#22d3ee" />
					<rect x={90} y={20} width={52} height={24} rx={4} fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth={1} />
					<text x={116} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#a5f3fc">ring 0</text>
				</motion.g>
				<line x1={152} y1={14} x2={152} y2={50} stroke="#334155" strokeWidth={1} />
				{/* dentry walk */}
				{nodes.map((n, i) => {
					const lastNegative = negative && i === nodes.length - 1;
					const stroke = lastNegative ? "#fcd34d" : i === stage ? "#22d3ee" : i < stage ? "#34d399" : "#475569";
					const fill = lastNegative ? "rgba(251,191,36,0.1)" : i === stage ? "rgba(34,211,238,0.12)" : i < stage ? "rgba(52,211,153,0.1)" : "rgba(30,41,59,0.7)";
					const color = lastNegative ? "#fde68a" : i === stage ? "#a5f3fc" : i < stage ? "#a7f3d0" : "#64748b";
					return (
						<motion.g key={n} {...anim(2 + i)}>
							{i > 0 && (
								<text x={xs[i] - 7} y={36} textAnchor="middle" fontFamily={MONO} fontSize={10} fill="#475569">›</text>
							)}
							<rect x={xs[i]} y={20} width={widths[i]} height={24} rx={4} fill={fill} stroke={stroke} strokeWidth={1} strokeDasharray={lastNegative ? "4 3" : undefined} />
							<text x={xs[i] + widths[i] / 2} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={color}>
								{n}{lastNegative ? " ∅" : ""}
							</text>
						</motion.g>
					);
				})}
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{negative ? "01 walk → 02 negative dentry (create follows)" : "trap ring 3 → 0 · cached dentry walk"}
			</span>
		</div>
	);
}
