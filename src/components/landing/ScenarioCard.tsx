import { exploreUrl, navigate } from "@/lib/route";
import { stepsForScenario } from "@/content/load";
import type { ScenarioDefinition } from "@/content/schema";

interface ScenarioCardProps {
	scenario: ScenarioDefinition;
}

/** One clickable scenario teaser. Links into the viz at step 0. */
export function ScenarioCard({ scenario }: ScenarioCardProps) {
	const stepCount = stepsForScenario(scenario.id).length;
	const href = exploreUrl(scenario.id);

	const open = (event: React.MouseEvent) => {
		// Keep SPA navigation (no full reload) for internal links.
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		navigate(href);
	};

	/** Compact tile: five share one row on desktop, so keep to label + command + two-line blurb. */
	return (
		<a
			href={href}
			onClick={open}
			className="group flex min-w-0 flex-col gap-1 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 transition-colors hover:border-slate-500 hover:bg-slate-800/60"
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="truncate text-[0.8125rem] font-semibold text-slate-100" title={scenario.label}>{scenario.label}</h3>
				<span className="flex shrink-0 items-center gap-1">
					{scenario.persistent && (
						<span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-1.5 py-px text-[0.625rem] font-medium text-emerald-300">
							durable
						</span>
					)}
					<span className="f-mono rounded-full border border-slate-700 bg-slate-800/80 px-1.5 py-px text-[0.625rem] text-slate-400">
						{stepCount}
					</span>
				</span>
			</div>
			<p className="f-mono truncate text-[0.75rem] text-cyan-200/90" title={scenario.command}>{scenario.command}</p>
			<p className="f-body line-clamp-2 text-slate-400" title={scenario.blurb}>{scenario.blurb}</p>
		</a>
	);
}
