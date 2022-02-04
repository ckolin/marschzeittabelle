<script>
    import { formatDuration, formatTime } from "../modules/formatting";
    import { calculateTotals, reverseRoute } from "../modules/route.js";
    import { calculateData, getCsv } from "../modules/table.js";
    import Dialog from "./Dialog.svelte";
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";
    import TimeInput from "./TimeInput.svelte";

    export let route;

    $: total = calculateTotals(route);
    
    let showSpeedDialog = false;
    let speedInput = route.speed;
    $: if (!window.isNaN(speedInput) && speedInput > 0) {
        route.speed = speedInput;
    }
    
    let showStartDialog = false;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function downloadCsv() {
        const csv = getCsv(calculateData(route));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<Dialog title="Geschwindigkeit anpassen" bind:show={showSpeedDialog}>
    <label for="speed">Geschwindigkeit (Lkm/h)</label>
    <input id="speed" class="stretch" type="number" min="0.5" step="0.5" required bind:value={speedInput} />
</Dialog>
<Dialog title="Abreise anpassen" bind:show={showStartDialog}>
    <label for="start">Abreise (hh:mm)</label>
    <TimeInput id="start" bind:hours={route.start} />
</Dialog>
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
        Geschwindigkeit: <b>{route.speed} Lkm/h</b>
        <button class="pill noprint" on:click={() => showSpeedDialog = true}>
            <Icon name="edit" />
        </button>
    </div>
    <div>
        Abreise: <b>{formatTime(route.start)}</b>
        <button class="pill noprint" on:click={() => showStartDialog = true}>
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
    <button on:click={downloadCsv} class="secondary">
        <Icon name="output" /> Exportieren (CSV)
    </button>
</div>

<style>
    .container {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
    }

    .container div {
        flex: 1 0 auto;
    }

    .container p {
        margin-top: 0;
    }
</style>