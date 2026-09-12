import { EXPLORE_PATH, getRoute, navigate } from "@/lib/route";

function open(event: React.MouseEvent, href: string) {
	// Preserve SPA navigation; let modifier-clicks open new tabs normally.
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	event.preventDefault();
	navigate(href);
}

/**
 * Shared top navigation: brand goes home (/), links switch between the
 * landing overview and the interactive visualizer (/explore).
 */
export function SiteNav() {
	const route = getRoute();
	const onLanding = route === "landing";

	const linkClass = (active: boolean) =>
		`f-mono rounded-md px-2.5 py-1.5 text-[0.75rem] transition-colors ${
			active
				? "bg-slate-700 text-slate-100"
				: "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
		}`;

	return (
		<nav
			aria-label="Site"
			className="flex items-center justify-between gap-3 border-b border-border/60 bg-slate-950 px-4 py-2 md:px-6"
		>
			<a
				href="/"
				onClick={(e) => open(e, "/")}
				className="f-title px-2 text-[1.125rem] text-slate-50 hover:text-white"
				aria-label="Life of IO — home"
			>
				Life of IO
			</a>
			<div className="flex items-center gap-1">
				<a
					href="/"
					onClick={(e) => open(e, "/")}
					aria-current={onLanding ? "page" : undefined}
					className={linkClass(onLanding)}
				>
					Overview
				</a>
				<a
					href={EXPLORE_PATH}
					onClick={(e) => open(e, EXPLORE_PATH)}
					aria-current={!onLanding ? "page" : undefined}
					className={linkClass(!onLanding)}
				>
					Explore →
				</a>
			</div>
		</nav>
	);
}
