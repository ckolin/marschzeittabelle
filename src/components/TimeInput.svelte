<script>
    import { formatTime } from "../modules/formatting";
    
    export let id;
    export let hours;

    let [hour, minute] = formatTime(hours)
        .split(":");

    $: hours = Number(hour) + Number(minute) / 60;

    function pad(event) {
        const input = event.target;
        if (window.isNaN(input.value)) {
            input.value = 0;
        }
        if (input.value.length > 2) {
            input.value = input.value.slice(-2);
        }
        input.value = input.value.padStart(2, "0");
    }
</script>

<div>
    <input {id} type="number" min="0" max="23" required bind:value={hour} on:input={pad} />
    <span>:</span>
    <input type="number" min="0" max="59" required bind:value={minute} on:input={pad} />
</div>

<style>
    div {
        font-size: 2em;
    }

    input {
        width: 3em;
    }
</style>