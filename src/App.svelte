<script>
	import Info from "./Info.svelte";
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
	{#if route}
		<div class="editor">
			<div class="header">
				<div class="info">
					<h2>Route</h2>
					<Info {route} />
				</div>
				<Map class="map" {route} />
			</div>
			<div class="controls">
				<input type="number" min="0.5" step="0.5" bind:value={speed} />
				<button on:click={reverse}>Richtung wechseln</button>
			</div>
			<div class="table">
				<h2>Marschzeittabelle</h2>
				<Table {route} {speed} />
			</div>
			<div class="profile">
				<h2>Höhenprofil</h2>
				<Profile {route} />
			</div>
		</div>
	{:else}
		<Introduction />
		<Upload bind:route />
	{/if}
	<p>{name}</p>
</main>

<style>
	.editor > div {
		overflow-x: auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.info {
		white-space: nowrap;
	}

	.controls, .table, .profile {
		grid-column-end: span 2;
	}
</style>
