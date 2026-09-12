import { SiteNav } from "@/components/SiteNav";
import { ScenarioCard } from "@/components/landing/ScenarioCard";
import { exploreUrl, navigate } from "@/lib/route";
import { LAYERS, META, SCENARIOS } from "@/content/load";

const HOW_IT_WORKS = [
	{
		title: "1 · Pick a scenario",
		body: "Five everyday commands — write, read, touch, grep, direct I/O — each a guided path from syscall to NAND.",
	},
	{
		title: "2 · Step or play",
		body: "Scrub the timeline, autoplay at 1–3×, or use arrow keys. Every step lights up the layers it touches.",
	},
	{
		title: "3 · Read the evidence",
		body: "Latency waterfall shows order-of-magnitude cost; stacked Kernel / Device sections explain the mechanism.",
	},
] as const;

function openExplore(event: React.MouseEvent, href: string) {
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	event.preventDefault();
	navigate(href);
}

/** Marketing-light intro: what the app is, the 5 paths, the I/O stack. */
export function LandingPage() {
	const defaultHref = exploreUrl("write");

	return (
		<div className="flex min-h-screen flex-col bg-slate-950 text-foreground">
			<SiteNav />
			<main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
					{/* Hero */}
					<section aria-label="Introduction" className="flex flex-col gap-4">
						<p className="f-eyebrow text-slate-500">
							Interactive visualization · {META.title}
						</p>
						<h2 className="max-w-[24ch] text-3xl font-semibold leading-tight tracking-tight text-slate-50 md:text-4xl">
							Follow one I/O operation from command to disk.
						</h2>
						<p className="f-body max-w-[72ch] text-slate-300">{META.intro}</p>
						<div className="flex flex-wrap items-center gap-3 pt-1">
							<a
								href={defaultHref}
								onClick={(e) => openExplore(e, defaultHref)}
								className="inline-flex h-11 items-center justify-center rounded-md bg-slate-100 px-8 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
							>
								Start exploring →
							</a>
							<a
								href="#scenarios"
								className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-8 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 hover:text-slate-50"
							>
								Pick a scenario
							</a>
					</div>
					<p className="f-mono text-slate-500">
						Runs in your browser · deep-linkable steps
					</p>
				</section>

					{/* How it works */}
					<section aria-label="How it works" className="grid grid-cols-1 gap-3 md:grid-cols-3">
						{HOW_IT_WORKS.map((s) => (
							<div
								key={s.title}
								className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4"
							>
								<h3 className="text-[0.9375rem] font-semibold text-slate-100">{s.title}</h3>
								<p className="f-body mt-1.5 text-slate-400">{s.body}</p>
							</div>
						))}
					</section>

					{/* Scenarios */}
					<section id="scenarios" aria-label="Scenarios" className="flex scroll-mt-4 flex-col gap-3">
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<h2 className="f-title text-slate-50">Five paths through the stack</h2>
							<p className="f-body text-slate-500">Click any card to open it in the visualizer.</p>
						</div>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
							{SCENARIOS.map((s) => (
								<ScenarioCard key={s.id} scenario={s} />
							))}
							<a
								href={defaultHref}
								onClick={(e) => openExplore(e, defaultHref)}
								className="flex min-h-[120px] flex-col justify-center gap-1 rounded-xl border border-dashed border-slate-700 bg-transparent p-4 transition-colors hover:border-slate-500 hover:bg-slate-800/40"
							>
								<span className="text-[0.9375rem] font-semibold text-slate-200">
									Not sure where to start?
								</span>
								<span className="f-body text-slate-400">
									Take the 20-step write path — command to durable NAND.
								</span>
								<span className="f-mono pt-1 text-[0.75rem] text-slate-400">
									Begin with write →
								</span>
							</a>
						</div>
					</section>

					{/* I/O stack */}
					<section aria-label="System layers" className="flex flex-col gap-3">
						<h2 className="f-title text-slate-50">The stack you’ll travel</h2>
						<p className="f-body max-w-[72ch] text-slate-500">
							Every step highlights the layers it activates — from shell to flash cells.
						</p>
						<ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{LAYERS.map((l) => (
								<li
									key={l.id}
									className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5"
								>
									<p className="f-mono text-slate-200">{l.name}</p>
									<p className="mt-0.5 text-[0.8125rem] leading-relaxed text-slate-500">
										{l.description}
									</p>
								</li>
							))}
						</ul>
					</section>
				</main>

				<footer className="border-t border-border/60 px-4 py-4 md:px-6">
					<div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-2">
						<p className="f-mono text-slate-500">
							Keyboard: ←/→ step · Enter play · R restart
						</p>
						<a
							href={defaultHref}
							onClick={(e) => openExplore(e, defaultHref)}
							className="f-mono text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
						>
							Open the visualizer →
						</a>
					</div>
			</footer>
		</div>
	);
}
