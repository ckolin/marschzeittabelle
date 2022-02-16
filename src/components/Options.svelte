<script>
    import { formatDuration, formatTime } from "../modules/formatting.js";
    import { logError, logEvent } from "../modules/logging.js";
    import { calculateTotals, loadMaps, reverseRoute } from "../modules/route.js";
    import { calculateData, getCsv } from "../modules/table.js";
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";
    import MapScaleDialog from "./MapScaleDialog.svelte";
    import SpeedDialog from "./SpeedDialog.svelte";
    import StartDialog from "./StartDialog.svelte";

    export let route;

    $: total = calculateTotals(route);
    
    let showSpeedDialog = false;    
    let showStartDialog = false;
    let showMapScaleDialog = false;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function reloadMaps() {
        loadMaps(route)
            .then(() => route = route)
            .catch((error) => {
                // Log error loading maps
                logError(error.id);
                
                alert(error.message);
            });
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
<MapScaleDialog bind:show={showMapScaleDialog} bind:scale={route.mapScale} on:close={reloadMaps} />
<div class="container">
    <div>
        <p>
            <span>Start: </span><b>{route.markers[0].name}</b><br />
            <span>Ziel: </span><b>{route.markers[route.markers.length - 1].name}</b><br />
            <span>Landeskarten 1:{route.mapScale}'000: </span><br />
            <b>{route.maps.map(m => `${m.id}`).join(", ")}</b>
            <button class="pill noprint" on:click={() => showMapScaleDialog = true}>
                <Icon name="edit" />
            </button>
        </p>
        <button class="pill noprint" on:click={reverse}>
            <Icon name="swap_vert" /> Richtung wechseln
        </button>
    </div>
    <div>
        <span>Horizontaldistanz: </span><b>{total.distance.toFixed(1)} km</b><br />
        <span>Auf-/Abstieg: </span>↑ <b>{Math.round(total.ascent)} m</b> ↓ <b>{Math.round(total.descent)} m</b><br />
        <span>Aufwand: </span><b>{total.effort.toFixed(1)} Lkm</b> <HelpLink topic="calculation" /><br />
        <span>Geschwindigkeit: </span><b>{route.speed} Lkm/h</b>
        <button class="pill noprint" on:click={() => showSpeedDialog = true}>
            <Icon name="edit" />
        </button>
    </div>
    <div>
        <span>Abreise: </span><b>{formatTime(route.start)}</b>
        <button class="pill noprint" on:click={() => showStartDialog = true}>
            <Icon name="edit" />
        </button>
        <br />
        <span>Ankunft: </span><b>{formatTime(route.start + total.duration)}</b><br />
        <span>Gehzeit: </span><b>{formatDuration(total.duration)} h</b><br />
        <span>Pausen: </span><b>{formatDuration(total.breakDuration)} h</b>
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
        gap: 1rem;
    }

    .container div {
        flex: 1 0 auto;
    }

    .container p {
        margin-top: 0;
    }
</style>