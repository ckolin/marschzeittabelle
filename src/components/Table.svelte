<script>
    import { calculateData } from "../modules/table.js";
    import { formatDuration, formatTime } from "../modules/formatting.js";
    import { recalculate } from "../modules/route.js";
    import Icon from "./Icon.svelte";
    import MarkerDialog from "./MarkerDialog.svelte";


    export let route;

    let data = [];
    $: data = calculateData(route);
    
    let selectedMarker;
    // Hide break input for last marker
    $: showBreak = selectedMarker !== route.markers[route.markers.length - 1];

    function close() {
        recalculate(route);
        route = route;
        selectedMarker = null;
    }
</script>

<MarkerDialog marker={selectedMarker} {showBreak} on:close={close} />
<table>
    <tr>
        <th>Wegpunkt<br />Kommentar</th>
        <th>Höhe</th>
        <th>Distanz</th>
        <th>Aufwand</th>
        <th>Gehzeit</th>
        <th>Uhrzeit<br />Pause</th>
    </tr>
    {#each data as row}
        <tr>
            <td class="name">
                <span class="pill">{row.index + 1}</span> {row.name}
            </td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{row.distance.toFixed(1)} km</td>
            <td class="number">{row.effort.toFixed(1)} Lkm</td>
            <td class="number">{formatDuration(row.duration)} h</td>
            <td class="number">{formatTime(row.time)}</td>
            <td class="noprint">
                <button class="pill" on:click={() => selectedMarker = route.markers[row.index]}>
                    <Icon name="edit" />
                </button>
            </td>
        </tr>
        {#if row.comment || row.diff}
            <tr class="alt">
                <td class="comment">{row.comment ?? ""}</td>
                {#if row.diff}
                    <td class="number">{Math.round(row.diff.height)} m</td>
                    <td class="number">{row.diff.distance.toFixed(1)} km</td>
                    <td class="number">{row.diff.effort.toFixed(1)} Lkm</td>
                    <td class="number">{formatDuration(row.diff.duration)} h</td>
                {/if}
                {#if row.break > 0}
                    <td class="number">+{formatDuration(row.break / 60)}</td>
                {/if}
                <td />
            </tr>
        {/if}
    {/each}
</table>

<style>
    table {
        white-space: nowrap;
        border-spacing: 1px;
    }

    th, td {
        text-align: left;
    }

    th:not(:last-child), td:not(:last-child) {
        padding-right: 1rem;
    }

    .alt td {
        color: var(--accent-color);
    }
    
    .name {
        font-weight: bold;
        color: var(--darker-accent-color);
    }
    
    .name .pill {
        padding: 0;
        color: var(--background-color);
        background: var(--darker-accent-color);
    }

    .number {
        text-align: right;
        font-family: "Roboto Mono", monospace;
    }

    .comment {
        max-width: 20rem;
        white-space: normal;
    }
</style>
