import App from "./App.svelte";

const app = new App({
	target: document.body,
	props: {
		name: "marschzeittabelle.ch"
	}
});

export default app;