<script>
	import Map from "./Map.svelte";
	import Profile from "./Profile.svelte";
	import Table from "./Table.svelte";
	import Introduction from "./Introduction.svelte";
	import Upload from "./Upload.svelte";

	export let name;

	let route;
	let speed = 4;

	function reverse() {
		route.reverse();
		route = route;
	}
</script>

<main>
	<p>{name}</p>

	{#if route}
		<input type="number" bind:value={speed}>
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
