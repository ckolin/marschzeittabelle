<script>
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

    export let route;
    export let show;

    let speedInput = route.speed;
    $: if (!window.isNaN(speedInput) && speedInput > 0) {
        route.speed = speedInput;
    }
</script>

<Dialog title="Geschwindigkeit anpassen" {show}>
    <form on:submit|preventDefault>
        <label for="speed">Geschwindigkeit (Lkm/h)</label>
        <input id="speed" class="stretch" type="number" min="0.5" step="0.5" required bind:value={speedInput} />
        <br />
        <button on:click={() => show = false}>
            <Icon name="done" /> Fertig
        </button>
    </form>
</Dialog>

<style>
    button {
        float: right;
    }
</style>
