import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

	build: {
		outDir: "dist",
		ssr: "src/server/server.tsx",
		rollupOptions: {
			input: {
				client: path.resolve(__dirname, "src/client/client.tsx"),
			},
		},
	},
});
