import App from "./App.svelte";

import { applyStyles } from "./modules/theme.js";

const app = new App({ target: document.body });
export default app;

applyStyles();
