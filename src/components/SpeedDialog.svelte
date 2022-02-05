<script>
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";

    export let show;
    export let speed;

    let input = speed;
    
    $: if (!window.isNaN(input) && input > 0) {
        speed = input;
    }
</script>

<Dialog title="Geschwindigkeit anpassen" bind:show>
    <label for="speed">Geschwindigkeit (Lkm/h)</label>
    <input id="speed" type="number" min="0.1" step="0.1" required bind:value={input} />
    <button type="button" class="pill" on:click={() => input += 0.5}>
        <Icon name="add" /> Schneller
    </button>
    <button type="button" class="pill" on:click={() => input = Math.max(0.5, input - 0.5)}>
        <Icon name="remove" /> Langsamer
    </button>
    <br />
</Dialog>
