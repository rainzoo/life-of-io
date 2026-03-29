import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		sourcemap: false, // Reduce bundle size for production
		assetsInlineLimit: 0, // Don't inline assets as base64 for better CDN performance
	},
	base: "/", // Ensure assets load correctly on Cloudflare Pages
});
