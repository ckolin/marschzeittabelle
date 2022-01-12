<script>
	import Map from "./Map.svelte";
	import Profile from "./Profile.svelte";
	import Introduction from "./Introduction.svelte";
	import Upload from "./Upload.svelte";

	export let name;

	let route;
</script>

<main>
	<h1>{name}</h1>

	{#if route}
		<Map {route} />
		<Profile {route} />
	{:else}
		<Introduction />
		<Upload bind:route />
	{/if}
</main>

<style>
</style>
