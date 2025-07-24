// packages/backend/vite.config.ts
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";
import url from "node:url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
    plugins: [
        tanstackRouter({
            // Tell the plugin where the routes are, relative to THIS config file
            routesDirectory: path.resolve(__dirname, "../frontend/src/routes"),
            // Tell the plugin where to generate the route tree
            generatedRouteTree: path.resolve(__dirname, "../frontend/src/routeTree.gen.ts"),
        }),
    ],
});
//# sourceMappingURL=vite-config.js.map