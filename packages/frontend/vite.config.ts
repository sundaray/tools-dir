import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import url from "node:url";
import type { BuildEnvironmentOptions } from "vite";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSR configuration
const ssrBuildConfig: BuildEnvironmentOptions = {
  ssr: true,
  outDir: "dist/server",
  ssrEmitAssets: true,
  copyPublicDir: false,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, "src/entry-server.tsx"),
    output: {
      entryFileNames: "[name].js",
      chunkFileNames: "assets/[name]-[hash].js",
      assetFileNames: "assets/[name]-[hash][extname]",
    },
  },
};

// Client-specific configuration
const clientBuildConfig: BuildEnvironmentOptions = {
  outDir: "dist/client",
  emitAssets: true,
  copyPublicDir: true,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, "src/entry-client.tsx"),
    output: {
      entryFileNames: "static/[name].js",
      chunkFileNames: "static/assets/[name]-[hash].js",
      assetFileNames: "static/assets/[name]-[hash][extname]",
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  return {
    plugins: [
      viteTsConfigPaths(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: configEnv.isSsrBuild ? ssrBuildConfig : clientBuildConfig,
  };
});
