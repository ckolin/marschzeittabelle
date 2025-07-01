<script lang="ts">
    import Landing from "./components/Landing.svelte";
    import { BLACK, RED, WHITE } from "./lib/theme";

    const map = import("./components/Map.svelte");
    let view: "landing" | "map" | "table" = "landing";
</script>

{#if view === "landing"}
    <Landing onMapOpen={() => (view = "map")} />
{:else if view === "map"}
    {#await map then Map}
        <Map.default --acc={RED} />
    {/await}
{/if}

<style>
</style>
