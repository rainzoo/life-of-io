import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { ScenarioCard } from "@/components/landing/ScenarioCard";
import { exploreUrl, navigate } from "@/lib/route";
import { LAYERS, META, SCENARIOS } from "@/content/load";

const HOW_IT_WORKS = [
	{
		title: "1 · Pick a scenario",
		body: "Five everyday commands, each a guided path from syscall to NAND.",
	},
	{
		title: "2 · Step or play",
		body: "Scrub the timeline, autoplay at 1–3×, or use arrow keys.",
	},
	{
		title: "3 · Read the evidence",
		body: "Latency waterfall plus stacked Kernel / Device sections.",
	},
] as const;

function openExplore(event: React.MouseEvent, href: string) {
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	event.preventDefault();
	navigate(href);
}

/**
 * Single-viewport overview: hero, how-it-works strip, scenario tiles, and
 * the layer stack all fit without scrolling on desktop, like /explore.
 * Smaller screens fall back to natural scrolling.
 */
export function LandingPage() {
	const defaultHref = exploreUrl("write");

	return (
		<div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
			<SiteNav />
			<main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center gap-4 px-4 py-4 md:px-6 lg:gap-5 lg:py-5">
				{/* Hero */}
				<section aria-label="Introduction" className="flex flex-col gap-2.5">
					<p className="f-eyebrow text-slate-500">
						Interactive visualization · {META.title}
					</p>
					<h2 className="max-w-[24ch] text-2xl font-semibold leading-tight tracking-tight text-slate-50 md:text-[2rem]">
						Follow one I/O operation from command to disk.
					</h2>
					<p className="f-body max-w-[72ch] text-slate-300">{META.intro}</p>
					<div className="flex flex-wrap items-center gap-3 pt-0.5">
						<a
							href={defaultHref}
							onClick={(e) => openExplore(e, defaultHref)}
							className="inline-flex h-9 items-center justify-center rounded-md bg-slate-100 px-6 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
						>
							Start exploring →
						</a>
						<a
							href="#scenarios"
							className="inline-flex h-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-6 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 hover:text-slate-50"
						>
							Pick a scenario
						</a>
						<p className="f-mono text-slate-500">
							Runs in your browser
						</p>
					</div>
				</section>

				{/* How it works */}
				<section aria-label="How it works" className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:gap-2.5">
					{HOW_IT_WORKS.map((s) => (
						<div
							key={s.title}
							className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2"
						>
							<h3 className="text-[0.8125rem] font-semibold text-slate-100">{s.title}</h3>
							<p className="f-body mt-0.5 text-slate-400">{s.body}</p>
						</div>
					))}
				</section>

				{/* Scenarios */}
				<section id="scenarios" aria-label="Scenarios" className="flex min-h-0 scroll-mt-4 flex-col gap-2">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<h2 className="f-title text-slate-50">Five paths through the stack</h2>
						<p className="f-body text-slate-500">Click any card to open it in the visualizer.</p>
					</div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2.5">
						{SCENARIOS.map((s) => (
							<ScenarioCard key={s.id} scenario={s} />
						))}
					</div>
				</section>

				{/* I/O stack */}
				<section aria-label="System layers" className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
					<h2 className="f-mono text-slate-500">The stack you’ll travel:</h2>
					<ul className="flex flex-wrap items-center gap-1.5">
						{LAYERS.map((l) => (
							<li
								key={l.id}
								title={l.description}
								className="f-mono cursor-default rounded-full border border-slate-800 bg-slate-900/40 px-2.5 py-0.5 text-slate-300"
							>
								{l.name}
							</li>
						))}
					</ul>
				</section>
			</main>

			<SiteFooter>
				<a
					href={defaultHref}
					onClick={(e) => openExplore(e, defaultHref)}
					className="f-mono text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
				>
					Explore →
				</a>
			</SiteFooter>
		</div>
	);
}
