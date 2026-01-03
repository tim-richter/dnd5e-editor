import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.GITHUB_PAGES === "true" ? "/dnd5e-editor/" : "/",
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "node",
	},
});
