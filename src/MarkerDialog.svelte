<script>
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

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

{#if selected != null}
    <Dialog>
        <h2>Wegpunkt bearbeiten</h2>
        <form on:submit|preventDefault>
            <label for="name">Name</label>
            <input id="name" type="text" required bind:value={marker.name} />
            <label for="comment">Kommentar</label>
            <textarea id="comment" bind:value={marker.comment} />
            {#if selected < route.markers.length - 1}
                <label for="break">Pause (min)</label>
                <input id="break" type="number" step="5" min="0" required bind:value={marker.break} />
            {/if}
            <br />
            <button on:click={close}>
                <Icon name="done" /> Fertig
            </button>
        </form>
    </Dialog>
{/if}

<style>
    h2 {
        margin-top: 0;
    }

    label, input, textarea {
        display: block;
    }

    input, textarea {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    textarea {
        resize: none;
    }

    button {
        float: right;
    }
</style>
