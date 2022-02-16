<script>
    import { recalculate } from "../modules/route.js";
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

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
        <input id="break" type="number" min="0" required bind:value={marker.break} />
        <button type="button" class="pill" on:click={() => marker.break = 0}><Icon name="block" /> Keine</button>
        <button type="button" class="pill" on:click={() => marker.break = 5}><Icon name="hourglass_bottom" /> 5 min</button>
        <button type="button" class="pill" on:click={() => marker.break = 15}><Icon name="hourglass_full" /> 15 min</button>
        <br />
    {/if}
</Dialog>

<style>
    textarea {
        resize: none;
    }
</style>
