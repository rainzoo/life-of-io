import type { ReactNode } from "react";

interface SiteFooterProps {
	/** Right-side slot, e.g. a link to the visualizer on the landing page. */
	children?: ReactNode;
	/** Inner content width; matches the page's main column. */
	maxWidthClass?: string;
}

/**
 * Shared credit footer: visible on every page. The visualizer's sticky
 * control bar keeps keyboard hints only, so the credit has one home.
 */
export function SiteFooter({ children, maxWidthClass = "max-w-[1120px]" }: SiteFooterProps) {
	return (
		<footer className="border-t border-border/60 px-4 py-4 md:px-6">
			<div className={`mx-auto flex w-full ${maxWidthClass} flex-wrap items-center justify-between gap-2`}>
				<p className="f-mono text-slate-500">
					Built with ❤️ by{" "}
					<a
						href="https://code.manas.me/"
						target="_blank"
						rel="noreferrer"
						className="underline decoration-slate-400 underline-offset-2 hover:text-slate-300"
					>
						Manas
					</a>{" "}
					· ←/→ step · Enter play · R restart
				</p>
				{children}
			</div>
		</footer>
	);
}
