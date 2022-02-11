<script>
    import { formatDuration, formatTime } from "../modules/formatting.js";
    import { logEvent } from "../modules/logging.js";
    import { calculateTotals, reverseRoute } from "../modules/route.js";
    import { calculateData, getCsv } from "../modules/table.js";
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";
    import SpeedDialog from "./SpeedDialog.svelte";
    import StartDialog from "./StartDialog.svelte";

    export let route;

    $: total = calculateTotals(route);
    
    let showSpeedDialog = false;    
    let showStartDialog = false;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function print() {
        // Log print event
        logEvent("print");
        // Open system print dialog
        window.print();
    }

    function downloadCsv() {
        // Log csv export event
        logEvent("export-csv");
        // Download csv as file
        const csv = getCsv(calculateData(route));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<SpeedDialog bind:show={showSpeedDialog} bind:speed={route.speed} />
<StartDialog bind:show={showStartDialog} bind:start={route.start} />
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
    <button on:click={print}>
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