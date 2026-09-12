import { useEffect, useState } from "react";

export const EXPLORE_PATH = "/explore";

export type RouteName = "landing" | "explore";

function routeForPath(pathname: string): RouteName {
	return pathname === EXPLORE_PATH || pathname.startsWith(`${EXPLORE_PATH}/`)
		? "explore"
		: "landing";
}

/** Current SPA route derived from pathname. No dependency on react-router. */
export function getRoute(): RouteName {
	if (typeof window === "undefined") return "landing";
	return routeForPath(window.location.pathname);
}

/** SPA navigation that notifies `useRoute` listeners. Falls back to assign. */
export function navigate(to: string): void {
	if (typeof window === "undefined") return;
	window.history.pushState({}, "", to);
	window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Deep link into the viz for a scenario, preserving the explore path. */
export function exploreUrl(scenarioId: string): string {
	return `${EXPLORE_PATH}?scenario=${encodeURIComponent(scenarioId)}`;
}

/**
 * Legacy root deep links (`/?scenario=read&step=2`) predate the landing page.
 * Rewrite them once to `/explore?...` so old shares keep working.
 */
export function rewriteLegacyVizSearch(): void {
	if (typeof window === "undefined") return;
	if (window.location.pathname !== "/") return;
	const params = new URLSearchParams(window.location.search);
	if (!params.has("scenario") && !params.has("step") && !params.has("play")) return;
	window.history.replaceState(
		{},
		"",
		`${EXPLORE_PATH}${params.toString() ? `?${params.toString()}` : ""}`,
	);
	window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Re-renders on back/forward and programmatic `navigate` calls. */
export function useRoute(): RouteName {
	const [route, setRoute] = useState<RouteName>(getRoute);
	useEffect(() => {
		const onChange = () => setRoute(getRoute());
		window.addEventListener("popstate", onChange);
		return () => window.removeEventListener("popstate", onChange);
	}, []);
	return route;
}
