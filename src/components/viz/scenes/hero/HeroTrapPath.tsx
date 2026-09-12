import { DrawLine, HG, HeroFrame, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 1: syscall trap + dentry walk, staged in three rows. */
export function HeroTrapPath({ slug, reduceMotion }: HeroSceneProps) {
	const negative = slug === "path-resolution";
	const stage = slug === "open-file-request" || slug === "read-open" ? 0 : slug === "file-created" || slug === "write-request" || slug === "read-inode" ? 2 : 1;
	const nodes = [
		{ t: "/", x: 24, w: 44 },
		{ t: "parent", x: 76, w: 110 },
		{ t: negative ? "file.txt ∅" : "file.txt", x: 194, w: negative ? 158 : 130 },
	];
	const outcome = negative
		? { t: "negative dentry → create follows", stroke: "#fcd34d", fill: "rgba(251,191,36,0.1)", color: "#fde68a", dash: "6 4" }
		: stage === 2
			? { t: "dentry + inode instantiated", stroke: "#34d399", fill: "rgba(52,211,153,0.1)", color: "#a7f3d0", dash: undefined }
			: { t: "cached dentry — no disk walk", stroke: "#475569", fill: "rgba(30,41,59,0.7)", color: "#94a3b8", dash: undefined };
	return (
		<HeroFrame
			label="Syscall trap and dentry walk"
			caption={negative ? "01 walk → 02 negative dentry → 03 create follows" : "01 trap ring 3 → 0 → 02 walk dentries → 03 dispatch"}
		>
			<HG reduceMotion={reduceMotion} d={0}>
				<Tag x={24} y={42} w={110} h={56} label="ring 3" fill="rgba(30,41,59,0.7)" stroke="#475569" color="#94a3b8" />
			</HG>
			<DrawLine reduceMotion={reduceMotion} x1={140} y1={70} x2={168} y2={70} stroke="#22d3ee" w={2} delay={0.2} />
			<HG reduceMotion={reduceMotion} d={0.3}>
				<polygon points="168,64 180,70 168,76" fill="#22d3ee" />
				<Tag x={184} y={42} w={110} h={56} label="ring 0" fill="rgba(34,211,238,0.12)" stroke="#22d3ee" color="#a5f3fc" />
			</HG>
			<line x1={24} y1={140} x2={376} y2={140} stroke="#1e293b" strokeWidth={1} />
			{nodes.map((n, i) => {
				const lastNegative = negative && i === nodes.length - 1;
				const stroke = lastNegative ? "#fcd34d" : i === stage ? "#22d3ee" : i < stage ? "#34d399" : "#475569";
				const fill = lastNegative ? "rgba(251,191,36,0.1)" : i === stage ? "rgba(34,211,238,0.12)" : i < stage ? "rgba(52,211,153,0.1)" : "rgba(30,41,59,0.7)";
				const color = lastNegative ? "#fde68a" : i === stage ? "#a5f3fc" : i < stage ? "#a7f3d0" : "#64748b";
				return (
					<HG key={n.t} reduceMotion={reduceMotion} d={0.4 + i * 0.14}>
						{i > 0 && (
							<text x={n.x - 8} y={190} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={14} fill="#475569">›</text>
						)}
						<Tag x={n.x} y={162} w={n.w} h={56} label={n.t} fill={fill} stroke={stroke} color={color} dash={lastNegative ? "6 4" : undefined} />
					</HG>
				);
			})}
			<line x1={24} y1={260} x2={376} y2={260} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.85}>
				<Tag x={24} y={282} w={330} h={56} label={outcome.t} fill={outcome.fill} stroke={outcome.stroke} color={outcome.color} dash={outcome.dash} />
			</HG>
		</HeroFrame>
	);
}
