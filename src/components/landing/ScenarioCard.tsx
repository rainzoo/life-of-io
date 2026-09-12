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

	return (
		<a
			href={href}
			onClick={open}
			className="group flex min-w-0 flex-col gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 transition-colors hover:border-slate-500 hover:bg-slate-800/60"
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-[0.9375rem] font-semibold text-slate-100">{scenario.label}</h3>
				<span className="flex shrink-0 items-center gap-1.5">
					{scenario.persistent && (
						<span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-300">
							durable
						</span>
					)}
					<span className="f-mono rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[0.6875rem] text-slate-400">
						{stepCount} steps
					</span>
				</span>
			</div>
			<p className="f-mono truncate text-cyan-200/90">{scenario.command}</p>
			<p className="f-body text-slate-400">{scenario.blurb}</p>
			<span className="f-mono mt-auto pt-1 text-[0.75rem] text-slate-500 transition-colors group-hover:text-slate-300">
				Explore →
			</span>
		</a>
	);
}
