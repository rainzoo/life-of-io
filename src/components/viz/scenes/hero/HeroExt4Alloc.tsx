import { HG, HeroFrame, Stage, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

/** Hero 2: ext4 allocation — extent fill + dirent append. */
export function HeroExt4Alloc({ slug, reduceMotion }: HeroSceneProps) {
	const isDirent = slug === "add-directory-entry" || slug === "file-created";
	return (
		<HeroFrame
			label="Extent allocation"
			caption={isDirent ? "01 reserve blocks → 02 append dirent → in-memory until journal COMMIT" : "01 reserve → 02 map extent → in-memory until journal COMMIT"}
		>
			{[0, 1, 2, 3].map((i) => (
				<HG key={i} reduceMotion={reduceMotion} d={i * 0.12}>
					<rect
						x={24 + i * 78} y={52} width={68} height={76} rx={6}
						fill={i < 2 ? "rgba(251,146,60,0.6)" : "rgba(51,65,85,0.9)"}
						stroke={i < 2 ? "#fdba74" : "#475569"} strokeWidth={1.2}
					/>
					{i < 2 && (
						<text x={58 + i * 78} y={94} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="#451a03">used</text>
					)}
				</HG>
			))}
			<Stage x={24} y={152} text="01 · reserve blocks in extent" />
			<line x1={24} y1={170} x2={376} y2={170} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.5}>
				<Tag x={24} y={192} w={330} h={60} label={isDirent ? "dirent   file.txt → ino" : "extent   LBA range mapped"} fill="rgba(251,146,60,0.12)" stroke="#fdba74" color="#fed7aa" />
			</HG>
			<Stage x={24} y={276} text="02 · in-memory map update" />
			<line x1={24} y1={294} x2={376} y2={294} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.8}>
				<Tag x={24} y={316} w={330} h={56} label="NOT durable — needs journal COMMIT" fill="none" stroke="#475569" color="#64748b" dash="6 4" />
			</HG>
		</HeroFrame>
	);
}
