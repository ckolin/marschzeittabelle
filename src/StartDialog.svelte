<script>
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

    import { formatTime } from "./modules/formatting";

    export let route;
    export let show;

    let startInput = formatTime(route.start);
    $: route.start = startInput
        .split(":")
        .map((n, i) => Number(n) / 60 ** i)
        .reduce((a, b) => a + b);
</script>

<Dialog title="Abreise anpassen" {show}>
    <form on:submit|preventDefault>
        <label for="start">Abreise</label>
        <input id="start" class="stretch" type="time" required bind:value={startInput} />
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