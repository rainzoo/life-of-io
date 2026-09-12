import { DrawLine, HG, HeroFrame, Stage, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 3: JBD2 journal — sequential append with the ordered-mode gate. */
export function HeroJournal({ slug, reduceMotion }: HeroSceneProps) {
	const commit = slug === "journal-transaction" || slug === "metadata-commit" || slug === "fsync-durability";
	const blocks = commit
		? [
			{ t: "descriptor", x: 96, w: 104 },
			{ t: "data", x: 208, w: 70 },
			{ t: "COMMIT", x: 286, w: 90 },
		]
		: [
			{ t: "descriptor", x: 96, w: 104 },
			{ t: "data", x: 208, w: 70 },
		];
	return (
		<HeroFrame
			label="Journal transaction"
			caption={commit ? "01 data bios drain → 02 COMMIT appended → 03 atomic replay unit" : "running transaction — sequential append, not yet durable"}
		>
			<HG reduceMotion={reduceMotion} d={0}>
				<path d="M 40 140 A 52 52 0 1 1 40 36" fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray="6 5" />
				<text x={40} y={180} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={10.5} fill="#64748b">log</text>
			</HG>
			<DrawLine reduceMotion={reduceMotion} x1={92} y1={122} x2={380} y2={122} stroke="#a16207" w={1.5} delay={0.15} />
			{blocks.map((b, i) => (
				<HG key={b.t} reduceMotion={reduceMotion} d={0.25 + i * 0.2}>
					<Tag
						x={b.x} y={60} w={b.w} h={56} label={b.t}
						fill={b.t === "COMMIT" ? "rgba(250,204,21,0.18)" : "rgba(250,204,21,0.08)"}
						stroke={b.t === "COMMIT" ? "#fde047" : "rgba(253,224,71,0.5)"}
						color="#fef9c3"
					/>
				</HG>
			))}
			<Stage x={96} y={140} text="01 · sequential append" />
			<line x1={24} y1={196} x2={376} y2={196} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.9}>
				<Tag x={96} y={218} w={280} h={56} label="atomic replay unit" fill="rgba(52,211,153,0.1)" stroke="#34d399" color="#a7f3d0" />
			</HG>
			<Stage x={96} y={298} text="02 · COMMIT seals it" />
			{commit && (
				<HG reduceMotion={reduceMotion} d={1.1}>
					<Tag x={96} y={320} w={280} h={52} label="ordered: data on disk BEFORE commit" fill="none" stroke="#fcd34d" color="#fde68a" fsize={11} dash="6 4" />
				</HG>
			)}
		</HeroFrame>
	);
}
