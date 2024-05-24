<script>
    import { formatDuration, formatTime } from "../modules/formatting.js";
    import { logError, logEvent } from "../modules/logging.js";
    import { calculateTotals, loadMaps, reverseRoute } from "../modules/route.js";
    import { calculateData, getCsv } from "../modules/table.js";
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";
    import MapScaleDialog from "./MapScaleDialog.svelte";
    import SpeedDialog from "./SpeedDialog.svelte";
    import Spinner from "./Spinner.svelte";
    import StartDialog from "./StartDialog.svelte";

    export let route;

    $: total = calculateTotals(route);

    let showSpeedDialog = false;
    let showStartDialog = false;
    let showMapScaleDialog = false;

    let loadingMaps;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function reloadMaps() {
        loadingMaps = true;
        loadMaps(route)
            .then(() => new Promise((resolve) => {
                // Fake loading to prevent flickering
                setTimeout(resolve, 300);
            }))
            .then(() => {
                route = route;
                loadingMaps = false;
            })
            .catch((error) => {
                // Log error loading maps
                logError(error.id);
                alert(error.message);
            });
    }

    function print() {
        if (window.print) {
            logEvent("print");
            // Open system print dialog
            window.print();
        } else {
            logError("print");
            alert("Dein Browser unterstützt das Drucken nicht.");
        }
    }

    function downloadCsv() {
        // Log csv export event
        logEvent("export-csv");
        // Download csv as file
        const csv = getCsv(calculateData(route));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `${route.title || "marschzeittabelle"}.csv`;
        a.click();
    }
</script>

<SpeedDialog bind:show={showSpeedDialog} bind:speed={route.speed} />
<StartDialog bind:show={showStartDialog} bind:start={route.start} />
<MapScaleDialog bind:show={showMapScaleDialog} bind:scale={route.mapScale} on:close={reloadMaps} />
<div class="container">
    <div>
        <span>Start: </span><b>{route.markers[0].name}</b><br />
        <span>Ziel: </span><b>{route.markers[route.markers.length - 1].name}</b><br />
        <span>Landeskarten 1:{route.mapScale}'000: </span>
        <button class="pill noprint" disabled={loadingMaps} on:click={() => showMapScaleDialog = true}>
            <Icon name="edit" />
        </button>
        <br />
        {#if loadingMaps}
            <Spinner small />
            <br />
        {:else}
            {#each route.maps as map}
                <b>{map.name} ({map.id})</b><br />
            {/each}
        {/if}
        <button class="pill noprint pad" on:click={reverse}>
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
        <span>Gehzeit: </span><b>{formatDuration(total.walkingDuration)} h</b><br />
        <span>Pausen: </span><b>{formatDuration(total.breakDuration)} h</b>
    </div>
</div>
<div class="noprint">
    <br />
    <button on:click={print}>
        <Icon name="print" /> Drucken (PDF)
    </button>
    &nbsp;
    <button on:click={downloadCsv} class="secondary">
        <Icon name="table_chart" /> Tabelle exportieren (CSV)
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

    button.pad {
        margin-top: 0.5rem;
    }
</style>
