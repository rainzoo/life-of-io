import type { ReactNode } from "react";

/** Renders `code` spans inside a plain string. Shared by App + StepInspector. */
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
		return <span key={i}>{part}</span>;
	});
}
