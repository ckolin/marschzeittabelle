import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        {
            name: "help",
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    // @ts-expect-error
                    if (req.url === "/help") {
                        // @ts-expect-error
                        req.url = "/help.html";
                    }
                    next();
                });
            },
        },
    ],
});
