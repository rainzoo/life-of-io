import { HG, HeroFrame, Tag, DrawLine } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 6: NVMe submission queue + doorbell; completion returns up the CQ rail. */
export function HeroNvme({ slug, reduceMotion }: HeroSceneProps) {
	const completion = slug === "io-completion" || slug === "direct-completion";
	const lit = completion ? 4 : 2;
	return (
		<HeroFrame
			label="NVMe submission queue"
			caption={completion ? "01 commands complete → 02 CQ entry → 03 interrupt wakes waiter" : "01 fill SQ slots → 02 ring doorbell → 03 controller DMA-fetches"}
		>
			<HG reduceMotion={reduceMotion} d={0}>
				<rect x={24} y={36} width={352} height={118} rx={8} fill="none" stroke="#334155" strokeWidth={1.4} />
				<text x={38} y={60} fontFamily="JetBrains Mono, monospace" fontSize={11} fill="#64748b">submission queue</text>
			</HG>
			{[0, 1, 2, 3].map((i) => (
				<HG key={i} reduceMotion={reduceMotion} d={0.1 + i * 0.12}>
					<rect
						x={40 + i * 84} y={70} width={72} height={68} rx={6}
						fill={i < lit ? "rgba(34,211,238,0.2)" : "rgba(30,41,59,0.7)"}
						stroke={i < lit ? "#22d3ee" : "#475569"} strokeWidth={1.4} opacity={i < lit ? 1 : 0.5}
					/>
					<text x={76 + i * 84} y={110} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={13} fill={i < lit ? "#a5f3fc" : "#475569"}>
						{i + 1}
					</text>
				</HG>
			))}
			<DrawLine reduceMotion={reduceMotion} x1={200} y1={196} x2={200} y2={226} stroke="#fbbf24" w={2} delay={0.55} />
			<HG reduceMotion={reduceMotion} d={0.65}>
				<Tag x={110} y={234} w={180} h={56} label="doorbell (MMIO)" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" color="#fde68a" />
			</HG>
			{completion && (
				<HG reduceMotion={reduceMotion} d={0.9}>
					<Tag x={110} y={330} w={180} h={52} fsize={11} label="CQ entry ↑ irq wakes waiter" fill="rgba(52,211,153,0.12)" stroke="#34d399" color="#a7f3d0" />
				</HG>
			)}
		</HeroFrame>
	);
}
