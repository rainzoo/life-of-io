import type { ReactNode } from "react";
import { TERMS } from "@/content/load";
import type { TermDefinition } from "@/content/schema";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Longest-first so "submission queue" wins over shorter overlaps.
const SORTED: TermDefinition[] = [...TERMS].sort((a, b) => b.term.length - a.term.length);
const TESTS = SORTED.map((def) => ({ def, re: new RegExp(`\\b${esc(def.term)}\\b`, "i") }));
const GLOBALS = SORTED.map((def) => ({ def, re: new RegExp(`\\b${esc(def.term)}\\b`, "gi") }));

/** Terms from the glossary present in the given texts (boundary-aware). */
export function termsInText(...texts: string[]): TermDefinition[] {
	const hay = texts.join("\n");
	return TESTS.filter(({ re }) => re.test(hay)).map(({ def }) => def);
}

function linkTerms(segment: string, keyBase: string): ReactNode[] {
	const out: ReactNode[] = [];
	let rest = segment;
	let k = 0;
	while (rest) {
		let best: { index: number; length: number; def: TermDefinition } | null = null;
		for (const { def, re } of GLOBALS) {
			re.lastIndex = 0;
			const m = re.exec(rest);
			if (m && (best === null || m.index < best.index || (m.index === best.index && m[0].length > best.length))) {
				best = { index: m.index, length: m[0].length, def };
			}
		}
		if (!best) {
			out.push(<span key={`${keyBase}-${k++}`}>{rest}</span>);
			break;
		}
		if (best.index > 0) out.push(<span key={`${keyBase}-${k++}`}>{rest.slice(0, best.index)}</span>);
		out.push(
			<abbr
				key={`${keyBase}-${k++}`}
				title={best.def.blurb}
				className="cursor-help underline decoration-slate-500 decoration-dotted underline-offset-2"
			>
				{rest.slice(best.index, best.index + best.length)}
			</abbr>,
		);
		rest = rest.slice(best.index + best.length);
	}
	return out;
}

/** Renders `code` spans plus glossary term tooltips (never inside code). */
export function renderInlineCode(text: string): ReactNode[] {
	return text.split(/(`[^`]+`)/g).map((part, i) => {
		if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
			return (
				<code
					key={i}
					className="rounded border border-slate-600/60 bg-slate-800/80 px-1 py-px font-mono text-[0.85em] text-cyan-200"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return <span key={i}>{linkTerms(part, `t${i}`)}</span>;
	});
}
