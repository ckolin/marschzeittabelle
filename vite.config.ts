import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        {
            name: "help",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // @ts-ignore
                    if (req.url === "/help") {
                        // @ts-ignore
                        req.url = "/help.html";
                    }
                    next();
                });
            },
        },
    ],
});
