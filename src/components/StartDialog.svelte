<script>
    import { formatTime } from "../modules/formatting";
    import Dialog from "./Dialog.svelte";
    
    export let show;
    export let start;

    let [hours, minutes] = formatTime(start)
        .split(":");

    $: start = Number(hours) + Number(minutes) / 60;

    function pad(event) {
        const input = event.target;
        if (input.value.length > 2) {
            input.value = input.value.slice(-2);
        }
        input.value = input.value.padStart(2, "0");
    }

    function select(event) {
        event.target.select();
    }
</script>

<Dialog title="Abreise anpassen" bind:show>
    <label for="hours">Abreise (hh:mm)</label>
    <div>
        <input
            id="hours"
            type="number"
            min="0"
            max="23"
            required
            bind:value={hours}
            on:input={pad}
            on:focus={select} />
        <span>:</span>
        <input
            type="number"
            min="0"
            max="59"
            required
            bind:value={minutes}
            on:input={pad}
            on:focus={select} />
    </div>
</Dialog>

<style>
    div {
        font-size: 1.4rem;
    }

    input {
        width: 3em;
    }
</style>
