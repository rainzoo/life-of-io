import { motion } from "motion/react";
import { DrawLine, HG, HeroFrame, Stage, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

const HIT = new Set(["read-cache-hit", "mmap-access"]);
const MISS = new Set(["read-cache-miss", "mmap-fault", "direct-contrast"]);
const BYPASS = new Set(["direct-submit", "direct-completion", "direct-open", "direct-command"]);

/** Hero 8: read routing — hit stops, miss fetches, direct bypasses. */
export function HeroReadPath({ slug, reduceMotion }: HeroSceneProps) {
	if (BYPASS.has(slug)) {
		return (
			<HeroFrame label="Direct I/O bypass" caption="01 pin user buffers → 02 skip cache → 03 DMA straight to device">
				<HG reduceMotion={reduceMotion} d={0}>
					<Tag x={24} y={52} w={180} h={60} label="page cache" fill="rgba(30,41,59,0.7)" stroke="#475569" color="#64748b" />
					<line x1={28} y1={56} x2={200} y2={108} stroke="#64748b" strokeWidth={1.6} />
				</HG>
				<DrawLine reduceMotion={reduceMotion} x1={212} y1={82} x2={248} y2={82} stroke="#22d3ee" w={2} delay={0.3} />
				<HG reduceMotion={reduceMotion} d={0.45}>
					<polygon points="248,76 260,82 248,88" fill="#22d3ee" />
					<Tag x={264} y={52} w={112} h={60} fsize={11} label="pinned buf" fill="rgba(34,211,238,0.12)" stroke="#22d3ee" color="#a5f3fc" />
				</HG>
				<Stage x={24} y={136} text="01 · align + pin (mlock-like)" />
				<line x1={24} y1={180} x2={376} y2={180} stroke="#1e293b" strokeWidth={1} />
				<HG reduceMotion={reduceMotion} d={0.7}>
					<Tag x={24} y={202} w={352} h={60} label="DMA userspace ⇄ device" fill="none" stroke="#22d3ee" color="#a5f3fc" />
				</HG>
				<Stage x={24} y={286} text="02 · no folio, no copy, no cache pollution" />
				<HG reduceMotion={reduceMotion} d={0.9}>
					<Tag x={24} y={308} w={352} h={52} fsize={11} label="tradeoff: app manages alignment + size" fill="none" stroke="#334155" color="#64748b" />
				</HG>
			</HeroFrame>
		);
	}
	if (HIT.has(slug)) {
		return (
			<HeroFrame label="Cache hit" caption="01 lookup hits → 02 serve from DRAM → 03 packet never reaches SSD">
				{[0, 1, 2, 3].map((i) => (
					<HG key={i} reduceMotion={reduceMotion} d={i * 0.1}>
						<rect x={24 + i * 62} y={52} width={54} height={92} rx={6} fill="rgba(14,165,233,0.65)" stroke="#38bdf8" strokeWidth={1.4} />
					</HG>
				))}
				<Stage x={24} y={168} text="01 · up-to-date folios in DRAM" />
				<DrawLine reduceMotion={reduceMotion} x1={200} y1={196} x2={200} y2={226} stroke="#475569" w={2} dash="6 5" delay={0.5} />
				<HG reduceMotion={reduceMotion} d={0.6}>
					<text x={200} y={252} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={16} fill="#f87171">✕</text>
					<Tag x={80} y={266} w={240} h={60} label="STOP — no device I/O" fill="rgba(52,211,153,0.1)" stroke="#34d399" color="#a7f3d0" />
				</HG>
				<Stage x={24} y={350} text="02 · ~100 ns serve, 0 device traffic" />
			</HeroFrame>
		);
	}
	if (MISS.has(slug)) {
		return (
			<HeroFrame label="Cache miss" caption="01 miss → 02 fetch full depth to NAND → 03 fill cache">
				{[0, 1, 2, 3, 4].map((i) => (
					<rect key={i} x={24 + i * 56} y={52} width={48} height={88} rx={6} fill="none" stroke="#64748b" strokeWidth={1.4} strokeDasharray="7 5" opacity={0.7} />
				))}
				<Stage x={24} y={164} text="01 · empty — nothing cached" />
				<DrawLine reduceMotion={reduceMotion} x1={200} y1={186} x2={200} y2={300} stroke="#fbbf24" w={2} delay={0.3} />
				<polygon points="194,300 206,300 200,312" fill="#fbbf24" />
				{!reduceMotion && (
					<motion.circle
						r={5} fill="#fde68a" cx={200}
						initial={{ cy: 186, opacity: 0 }}
						animate={{ cy: [186, 300, 300, 186], opacity: [0, 1, 1, 0] }}
						transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
					/>
				)}
				<HG reduceMotion={reduceMotion} d={0.7}>
					<Tag x={80} y={326} w={240} h={52} fsize={11} label="NAND → fill → wake reader" fill="none" stroke="#fbbf24" color="#fde68a" />
				</HG>
			</HeroFrame>
		);
	}
	const fault = slug === "mmap-fault";
	return (
		<HeroFrame label="Copy out" caption={fault ? "01 fault → 02 map folio → 03 CPU reads DRAM (no copy)" : "01 folios ready → 02 copy_to_user → 03 folios stay clean"}>
			{[0, 1].map((i) => (
				<HG key={i} reduceMotion={reduceMotion} d={i * 0.12}>
					<rect x={24 + i * 66} y={52} width={58} height={92} rx={6} fill="rgba(14,165,233,0.65)" stroke="#38bdf8" strokeWidth={1.4} />
				</HG>
			))}
			<DrawLine reduceMotion={reduceMotion} x1={162} y1={98} x2={218} y2={98} stroke="#38bdf8" w={2} delay={0.35} />
			<HG reduceMotion={reduceMotion} d={0.5}>
				<polygon points="218,92 230,98 218,104" fill="#38bdf8" />
				<Tag x={234} y={68} w={fault ? 142 : 120} h={60} fsize={11} label={fault ? "mapped" : "userspace"} fill="rgba(30,41,59,0.9)" stroke="#64748b" color="#e2e8f0" />
			</HG>
			<Stage x={24} y={168} text={fault ? "01 · MMU fault wires the folio" : "01 · copy bytes out"} />
			<line x1={24} y1={188} x2={376} y2={188} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.75}>
				<Tag x={24} y={210} w={352} h={60} label={fault ? "zero-copy: CPU reads DRAM directly" : "folios stay clean — no writeback"} fill="none" stroke="#334155" color="#94a3b8" />
			</HG>
		</HeroFrame>
	);
}
