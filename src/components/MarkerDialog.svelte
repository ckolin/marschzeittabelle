<script>
    import { recalculate } from "../modules/route.js";
    import Dialog from "./Dialog.svelte";

    export let route;
    export let selected = null;
    
    $: marker = route.markers[selected];

    function close() {
        recalculate(route);
        route = route;
        selected = null;
    }
</script>

<Dialog title="Wegpunkt bearbeiten" show={selected != null} on:close={close}>
    <label for="name">Name</label>
    <input id="name" type="text" required bind:value={marker.name} />
    <label for="comment">Kommentar</label>
    <textarea id="comment" bind:value={marker.comment} />
    {#if selected < route.markers.length - 1}
        <label for="break">Pause (min)</label>
        <input id="break" type="number" step="5" min="0" required bind:value={marker.break} />
        <button type="button" class="pill" on:click={() => marker.break = 5}>5 min</button>
        <button type="button" class="pill" on:click={() => marker.break = 15}>15 min</button>
        <button type="button" class="pill" on:click={() => marker.break = 30}>30 min</button>
        <br />
    {/if}
</Dialog>

<style>
    textarea {
        resize: none;
    }
</style>
