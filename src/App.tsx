import { useEffect } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { VizApp } from "@/components/viz/VizApp";
import { rewriteLegacyVizSearch, useRoute } from "@/lib/route";
import { META } from "@/content/load";

function App() {
	const route = useRoute();

	useEffect(() => {
		rewriteLegacyVizSearch();
	}, []);

	useEffect(() => {
		document.title =
			route === "explore" ? `Explore · ${META.title}` : `${META.title} · ${META.filesystem} on ${META.device}`;
	}, [route]);

	if (route === "explore") return <VizApp />;
	return <LandingPage />;
}

export default App;
