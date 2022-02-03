<script>
    import Icon from "./Icon.svelte";

    import { formatTime } from "./modules/formatting";
    import { reverseRoute } from "./modules/route.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;
    
    let speedInput = route.speed;
    $: if (!window.isNaN(speedInput) && speedInput > 0) {
        route.speed = speedInput;
    }
    
    let startInput = formatTime(route.start);
    $: route.start = startInput
        .split(":")
        .map((n, i) => Number(n) / 60 ** i)
        .reduce((a, b) => a + b);

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function exportCsv() {
        const csv = getCsv(calculateData(route));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<p>
    <button class="stretch secondary" on:click={reverse}>
        <Icon name="swap_horiz" /> Richtung wechseln
    </button>
    <br />
    <label for="speed">Geschwindigkeit (Lkm/h)</label>
    <input id="speed" class="stretch" type="number" min="0.5" step="0.5" required bind:value={speedInput} />
    <label for="start">Abreise</label>
    <input id="start" class="stretch" type="time" required bind:value={startInput} />
</p>
<p>
    <button on:click={() => window.print()}>
        <Icon name="print" /> Drucken
    </button>
    &nbsp;
    <button on:click={exportCsv} class="secondary">
        <Icon name="output" /> Exportieren (CSV)
    </button>
</p>

<style>
    p:first-of-type {
        margin-top: 0
    }

    p {
        margin-bottom: 0;
    }

    label {
        display: block;
    }

    .stretch {
        width: 100%;
    }

    input, button {
        margin-bottom: 0.5rem;
    }
</style>