import { motion } from "motion/react";
import type { ReactNode } from "react";

const MONO = "JetBrains Mono, ui-monospace, monospace";

export interface HeroSceneProps {
	slug: string;
	reduceMotion: boolean;
}

/** Staggered fade-rise wrapper. The only enter animation hero scenes use. */
export function HG({ reduceMotion, d = 0, children }: { reduceMotion: boolean; d?: number; children: ReactNode }) {
	return (
		<motion.g
			initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay: d }}
		>
			{children}
		</motion.g>
	);
}

/** A connector that draws itself. Signature Motion touch for arrows/wires. */
export function DrawLine({
	reduceMotion,
	x1,
	y1,
	x2,
	y2,
	stroke,
	w = 1.5,
	delay = 0.25,
	dash,
}: {
	reduceMotion: boolean;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	stroke: string;
	w?: number;
	delay?: number;
	dash?: string;
}) {
	return (
		<motion.line
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke={stroke}
			strokeWidth={w}
			strokeDasharray={dash}
			initial={reduceMotion ? undefined : { pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.45, delay }}
		/>
	);
}

/** Labeled box: rect + centered mono text. Fill/stroke glide via CSS so
    focus shifts (same scene, next step) cross-fade instead of snapping. */
export function Tag({
	x,
	y,
	w,
	h,
	label,
	fill,
	stroke,
	color,
	fsize = 12,
	dash,
}: {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	fill: string;
	stroke: string;
	color: string;
	fsize?: number;
	dash?: string;
}) {
	return (
		<>
			<rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.2} strokeDasharray={dash} style={{ transition: "fill 0.3s, stroke 0.3s" }} />
			<text x={x + w / 2} y={y + h / 2 + fsize * 0.35} textAnchor="middle" fontFamily={MONO} fontSize={fsize} fill={color} style={{ transition: "fill 0.3s" }}>
				{label}
			</text>
		</>
	);
}

/** Small stage annotation under a row. */
export function Stage({ x, y, text }: { x: number; y: number; text: string }) {
	return (
		<text x={x} y={y} fontFamily={MONO} fontSize={10.5} fill="#64748b">
			{text}
		</text>
	);
}

/** Frame every hero scene returns: large SVG + staged caption. */
export function HeroFrame({ label, caption, children }: { label: string; caption: string; children: ReactNode }) {
	return (
		<div className="flex h-full flex-col gap-1">
			<svg viewBox="0 0 400 400" className="h-[400px] w-full" role="img" aria-label={label}>
				{children}
			</svg>
			<span className="shrink-0 px-1 text-[0.8rem] leading-snug text-slate-400">{caption}</span>
		</div>
	);
}
