import { motion } from "motion/react";

interface SceneProps {
	slug: string;
	reduceMotion: boolean;
}

const MONO = "JetBrains Mono, ui-monospace, monospace";
const HIT = new Set(["read-cache-hit", "mmap-access"]);
const MISS = new Set(["read-cache-miss", "mmap-fault", "direct-contrast"]);
const BYPASS = new Set(["direct-submit", "direct-completion", "direct-open", "direct-command"]);

function Sequence({ reduceMotion, count, delay = 0 }: { reduceMotion: boolean; count: number; delay?: number }) {
	return (
		<>
			{Array.from({ length: count }, (_, i) => (
				<motion.g
					key={i}
					initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25, delay: delay + i * 0.08 }}
				>
					<rect x={4 + i * 28} y={17} width={24} height={30} rx={3} fill="rgba(14,165,233,0.65)" stroke="#38bdf8" strokeWidth={1} />
				</motion.g>
			))}
		</>
	);
}

/** Scene 8: read routing as SVG — hit stops, miss fetches, direct bypasses. */
export function ReadPathScene({ slug, reduceMotion }: SceneProps) {
	if (BYPASS.has(slug)) {
		return (
			<div className="flex flex-col gap-1">
				<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Direct I/O bypass">
					<motion.g initial={reduceMotion ? undefined : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
						<rect x={4} y={17} width={104} height={30} rx={4} fill="rgba(30,41,59,0.7)" stroke="#475569" strokeWidth={1} />
						<text x={56} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#64748b">page cache</text>
						<line x1={8} y1={20} x2={104} y2={44} stroke="#64748b" strokeWidth={1.2} />
					</motion.g>
					<motion.line
						x1={116} y1={32} x2={168} y2={32} stroke="#22d3ee" strokeWidth={1.5}
						initial={reduceMotion ? undefined : { pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.35, delay: 0.25 }}
					/>
					<polygon points="168,28 176,32 168,36" fill="#22d3ee" />
					<motion.g
						initial={reduceMotion ? undefined : { opacity: 0, x: -6 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.5 }}
					>
						<rect x={180} y={17} width={128} height={30} rx={4} fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth={1} />
						<text x={244} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#a5f3fc">pinned user buf</text>
					</motion.g>
				</svg>
				<span className="shrink-0 text-[0.7rem] text-slate-400">O_DIRECT: cache skipped — aligned + pinned buffers, DMA straight to userspace</span>
			</div>
		);
	}
	if (HIT.has(slug)) {
		return (
			<div className="flex flex-col gap-1">
				<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Cache hit">
					<Sequence reduceMotion={reduceMotion} count={4} />
					{/* path to device, cut off */}
					<motion.g initial={reduceMotion ? undefined : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.4 }}>
						<line x1={124} y1={32} x2={150} y2={32} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 3" />
						<text x={158} y={37} textAnchor="middle" fontFamily={MONO} fontSize={11} fill="#f87171">✕</text>
						<rect x={172} y={17} width={150} height={30} rx={4} fill="rgba(52,211,153,0.1)" stroke="#34d399" strokeWidth={1} />
						<text x={247} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#a7f3d0">STOP — no device I/O</text>
					</motion.g>
				</svg>
				<span className="shrink-0 text-[0.7rem] text-slate-400">served from DRAM — packet never reaches SSD</span>
			</div>
		);
	}
	if (MISS.has(slug)) {
		return (
			<div className="flex flex-col gap-1">
				<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Cache miss">
					{Array.from({ length: 5 }, (_, i) => (
						<rect key={i} x={4 + i * 28} y={17} width={24} height={30} rx={3} fill="none" stroke="#64748b" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
					))}
					<line x1={152} y1={8} x2={152} y2={56} stroke="#334155" strokeWidth={1} />
					{/* fetch arrow draws down, then a dot travels it */}
					<motion.line
						x1={176} y1={10} x2={176} y2={50} stroke="#fbbf24" strokeWidth={1.5}
						initial={reduceMotion ? undefined : { pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.4, delay: 0.2 }}
					/>
					<polygon points="172,50 180,50 176,58" fill="#fbbf24" />
					{!reduceMotion && (
						<motion.circle
							r={3} fill="#fde68a"
							initial={{ cy: 10, cx: 176, opacity: 0 }}
							animate={{ cy: [10, 50, 50, 10], opacity: [0, 1, 1, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
						/>
					)}
					<text x={196} y={36} fontFamily={MONO} fontSize={9} fill="#fde68a">↓ fetch full depth</text>
				</svg>
				<span className="shrink-0 text-[0.7rem] text-slate-400">miss — must travel full depth to NAND, then fill cache</span>
			</div>
		);
	}
	const fault = slug === "mmap-fault";
	return (
		<div className="flex flex-col gap-1">
			<svg viewBox="0 0 460 64" className="h-14 w-full" role="img" aria-label="Copy out">
				<Sequence reduceMotion={reduceMotion} count={2} />
				<motion.line
					x1={64} y1={32} x2={110} y2={32} stroke="#38bdf8" strokeWidth={1.5}
					initial={reduceMotion ? undefined : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.35, delay: 0.25 }}
				/>
				<polygon points="110,28 118,32 110,36" fill="#38bdf8" />
				<motion.g
					initial={reduceMotion ? undefined : { opacity: 0, x: -6 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 0.5 }}
				>
					<rect x={122} y={17} width={fault ? 150 : 110} height={30} rx={4} fill="rgba(30,41,59,0.9)" stroke="#64748b" strokeWidth={1} />
					<text x={122 + (fault ? 150 : 110) / 2} y={36} textAnchor="middle" fontFamily={MONO} fontSize={9} fill="#e2e8f0">
						{fault ? "mapped (no copy)" : "userspace"}
					</text>
				</motion.g>
			</svg>
			<span className="shrink-0 text-[0.7rem] text-slate-400">
				{fault ? "MMU maps the folio — CPU reads DRAM directly" : "copy_to_user — folios stay clean"}
			</span>
		</div>
	);
}
