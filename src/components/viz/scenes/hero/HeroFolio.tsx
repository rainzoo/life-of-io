import { HG, HeroFrame, Tag } from "./hero";
import type { HeroSceneProps } from "./hero";

const DIRTY = new Set(["copy-to-page-cache", "writeback-begins"]);

/** Hero 4: folio lifecycle — amber volatile vs sky clean, inside a DRAM frame. */
export function HeroFolio({ slug, reduceMotion }: HeroSceneProps) {
	const dirty = DIRTY.has(slug);
	const readahead = slug === "read-readahead";
	return (
		<HeroFrame
			label="Page-cache folios"
			caption={
				readahead
					? "01 demand folio → 02 readahead fill → still volatile until device write"
					: dirty
						? "01 copy fills folios → 02 marked dirty → volatile: lost on crash"
						: "01 writeback issues bios → 02 folios clean → device holds a copy"
			}
		>
			{Array.from({ length: 6 }, (_, i) => {
				const filled = readahead ? i < 5 : true;
				const hot = readahead ? i >= 3 : dirty && i < 4;
				return (
					<HG key={i} reduceMotion={reduceMotion} d={i * 0.09}>
						<rect
							x={24 + i * 58} y={52} width={50} height={92} rx={6}
							fill={!filled ? "none" : hot ? "rgba(245,158,11,0.7)" : "rgba(14,165,233,0.6)"}
							stroke={hot ? "#fcd34d" : "#38bdf8"} strokeWidth={1.4}
							strokeDasharray={!filled ? "6 4" : undefined} opacity={!filled ? 0.6 : 1}
						/>
					</HG>
				);
			})}
			<line x1={24} y1={188} x2={376} y2={188} stroke="#1e293b" strokeWidth={1} />
			<HG reduceMotion={reduceMotion} d={0.65}>
				<rect x={24} y={210} width={352} height={84} rx={8} fill="none" stroke="#475569" strokeWidth={1.4} strokeDasharray="8 6" />
				<text x={200} y={244} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={13} fill={dirty || readahead ? "#fcd34d" : "#7dd3fc"}>
					{dirty || readahead ? "DRAM only — VOLATILE" : "DRAM ⇄ device in sync"}
				</text>
				<text x={200} y={268} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="#64748b">
					{dirty || readahead ? "a crash here loses the data" : "safe to evict or crash"}
				</text>
			</HG>
			<HG reduceMotion={reduceMotion} d={0.9}>
				<Tag
					x={24} y={336} w={352} h={48} fsize={11}
					label={dirty || readahead ? "dirty ≠ durable (needs COMMIT + fsync + program)" : "clean = device has a copy"}
					fill="none" stroke="#334155" color="#64748b"
				/>
			</HG>
		</HeroFrame>
	);
}
