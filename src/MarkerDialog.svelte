<script>
    import Dialog from "./Dialog.svelte";

    import { recalculate } from "./modules/route.js";

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
    {/if}
</Dialog>

<style>
    textarea {
        resize: none;
    }
</style>
