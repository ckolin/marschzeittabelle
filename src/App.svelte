<script>
	import Map from "./Map.svelte";
	import Profile from "./Profile.svelte";
	import Introduction from "./Introduction.svelte";
	import Upload from "./Upload.svelte";

	export let name;

	let route;

	function reverse() {
		route.reverse();
		route = route;
	}
</script>

<main>
	<p>{name}</p>

	{#if route}
		<button on:click={reverse}>Richtung wechseln</button>
		<Map {route} />
		<Profile {route} />
	{:else}
		<Introduction />
		<Upload bind:route />
	{/if}
</main>

<style>
</style>
