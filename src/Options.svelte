<script>
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";

    import { formatDuration, formatTime } from "./modules/formatting";
    import { calculateTotals, reverseRoute } from "./modules/route.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;

    $: total = calculateTotals(route);
    
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

<div class="container">
    <div>
        <p>
            Start: <b>{route.markers[0].name}</b><br />
            Ziel: <b>{route.markers[route.markers.length - 1].name}</b>
        </p>
        <button class="pill noprint" on:click={reverse}>
            <Icon name="swap_vert" /> Richtung wechseln
        </button>
    </div>
    <div>
        Horizontaldistanz: <b>{total.distance.toFixed(1)} km</b><br />
        Auf-/Abstieg: ↑ <b>{Math.round(total.ascent)} m</b> ↓ <b>{Math.round(total.descent)} m</b><br />
        Aufwand: <b>{total.effort.toFixed(1)} Lkm</b> <HelpLink topic="calculation" /><br />
        Geschwindigkeit: <b id="speed" contenteditable="true" inputmode="number" bind:textContent={speedInput}></b><b>&nbsp;Lkm/h</b>
        <button class="pill noprint" on:click={() => document.getElementById("speed").focus()}>
            <Icon name="edit" />
        </button>
    </div>
    <div>
        Abreise: <b id="start" contenteditable="true" bind:textContent={startInput}></b>
        <button class="pill noprint" on:click={() => document.getElementById("start").focus()}>
            <Icon name="edit" />
        </button>
        <br />
        Ankunft: <b>{formatTime(route.start + total.duration)}</b><br />
        Gehzeit: <b>{formatDuration(total.duration)} h</b><br />
        Pausen: <b>{formatDuration(total.breakDuration)} h</b>
    </div>
</div>
<div class="noprint">
    <br />
    <button on:click={() => window.print()}>
        <Icon name="print" /> Drucken
    </button>
    &nbsp;
    <button on:click={exportCsv} class="secondary">
        <Icon name="output" /> Exportieren (CSV)
    </button>
</div>

<style>
    .container {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
    }

    .container p {
        margin-top: 0;
    }
</style>