import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load HTTPS certs for dev server
const getHttpsConfig = () => {
	const keyPath = path.resolve(__dirname, ".cert/key.pem");
	const certPath = path.resolve(__dirname, ".cert/cert.pem");

	if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
		return {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath),
		};
	}

	return false;
};

const httpsConfig = getHttpsConfig();

export default defineConfig({
	plugins: [tailwindcss()],

	build: {
		// Output directory
		outDir: "dist",

		// Generate manifest for WordPress to reference
		manifest: true,

		// Increase chunk size warning limit
		chunkSizeWarningLimit: 600,

		// Rollup options
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "assets/js/main.js"),
			},
			output: {
				// Output format - ES modules for better code splitting
				format: "es",

				// Entry file names
				entryFileNames: "js/[name].min.js",

				// Chunk file names for code splitting
				chunkFileNames: "js/chunks/[name]-[hash].js",

				// Asset file names (CSS, images, etc.)
				assetFileNames: (assetInfo) => {
					if (!assetInfo.name) {
						return "assets/[name]-[hash][extname]";
					}

					const info = assetInfo.name.split(".");
					const ext = info[info.length - 1];

					if (/css/.test(ext)) {
						return "css/[name].min[extname]";
					}
					return "assets/[name]-[hash][extname]";
				},

				// Manual chunks configuration for vendor code splitting
				manualChunks: (id) => {
					// Split large animation libraries into separate chunks
					if (id.includes("lottie-web")) {
						return "lottie";
					}
					if (id.includes("gsap")) {
						return "gsap";
					}
					if (id.includes("@unseenco/taxi")) {
						return "taxi";
					}
					if (id.includes("lenis")) {
						return "lenis";
					}
					if (id.includes("split-type")) {
						return "split-type";
					}
					// Group all other node_modules into a vendor chunk
					if (id.includes("node_modules")) {
						return "vendor";
					}
				},
			},
		},

		// Source maps
		sourcemap: false,
	},

	server: {
		// Port for dev server (forced to 3000)
		port: 3000,
		strictPort: true,

		// HTTPS with mkcert locally-trusted certificates
		https: httpsConfig,

		// Automatically open browser
		open: false,

		// Enable CORS
		cors: true,

		// HMR options
		hmr: {
			host: "localhost",
			port: 3000,
			protocol: httpsConfig ? "wss" : "ws",
		},

		// Proxy settings if needed
		proxy: {},
	},

	// CSS options
	css: {
		devSourcemap: true,
	},

	// Resolve options
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "assets"),
		},
	},
});
