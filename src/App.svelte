<script>
	import Map from "./Map.svelte";
	import Profile from "./Profile.svelte";
	import Table from "./Table.svelte";
	import Introduction from "./Introduction.svelte";
	import Upload from "./Upload.svelte";
	import { theme } from "./modules/theme.js";

	export let name;

	let route;
	let speed = 4;

	function reverse() {
		route.reverse();
		route = route;
	}

	// Set theme styles
	for (let key of Object.keys(theme)) {
		const property = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
		document.documentElement.style.setProperty(property, theme[key]);
	}
</script>

<main>
	<p>{name}</p>

	{#if route}
		<input type="number" bind:value={speed} />
		<button on:click={reverse}>Richtung wechseln</button>
		<Map {route} />
		<Profile {route} />
		<Table {route} {speed} />
	{:else}
		<Introduction />
		<Upload bind:route />
	{/if}
</main>

<style>
</style>
