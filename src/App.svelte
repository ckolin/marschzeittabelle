<script lang="ts">
    import Landing from "./components/Landing.svelte";
    import MenuBar from "./components/MenuBar.svelte";
    import { State } from "./lib/state";
    import { RED } from "./lib/theme";

    const map = import("./components/Map.svelte");
    let view: "landing" | "map" | "table" = $state("landing");

    let appState = $state(State.new());
</script>

{#if view === "landing"}
    <Landing onMapOpen={() => (view = "map")} />
{:else if view === "map"}
    <div class="layout">
        <nav>
            <MenuBar />
        </nav>
        <main>
            {#await map then Map}
                <Map.default --acc={RED} />
            {/await}
        </main>
    </div>
{/if}

<style>
    .layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    main {
        flex-grow: 1;
    }
</style>
