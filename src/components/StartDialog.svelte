<script>
    import { formatTime } from "../modules/formatting.js";
    import Dialog from "./Dialog.svelte";
    import Icon from "./Icon.svelte";
    
    export let show;
    export let start;

    let input = formatTime(start);
    $: start = input
        .split(":")
        .map((n, i) => Number(n) / 60 ** i)
        .reduce((a, b) => a + b);
</script>

<Dialog title="Abreise anpassen" bind:show>
    <label for="start">Abreise</label>
    <input id="start" type="time" required bind:value={input} />
    <button type="button" class="pill" on:click={() => input = "08:00"}>
        <Icon name="brightness_low" /> 08:00
    </button>
    <button type="button" class="pill" on:click={() => input = "12:00"}>
        <Icon name="brightness_medium" /> 12:00
    </button>
    <button type="button" class="pill" on:click={() => input = "16:00"}>
        <Icon name="brightness_high" /> 16:00
    </button>
    <br />
</Dialog>
