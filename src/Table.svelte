<script>
    import Icon from "./Icon.svelte";
    import MarkerDetail from "./MarkerDetail.svelte";

    import { formatDuration, formatTime } from "./modules/formatting.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;
    export let speed;

    let data = [];
    let detailIndex;

    $: if (!window.isNaN(speed) && speed > 0) {
        data = calculateData(route, speed);
    }

    function exportCsv() {
        const csv = getCsv(data);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<table>
    <tr>
        <th />
        <th class="close">Wegpunkt</th>
        <th>Höhe</th>
        <th>Distanz</th>
        <th>Aufwand</th>
        <th>Dauer</th>
        <th>Uhrzeit</th>
    </tr>
    {#each data as row}
        <tr>
            <td><span class="index">{row.index}</span></td>
            <td class="name close">{row.name}</td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{row.distance.toFixed(1)} km</td>
            <td class="number">{row.effort.toFixed(1)} Lkm</td>
            <td class="number">{formatDuration(row.duration)} h</td>
            <td class="number">{formatTime(row.duration)}</td>
        </tr>
        {#if row.comment || row.diff}
            <tr class="alt">
                <td />
                <td class="comment close">{row.comment ?? ""}</td>
                {#if row.diff}
                    <td class="number">{Math.round(row.diff.height)} m</td>
                    <td class="number">{row.diff.distance.toFixed(1)} km</td>
                    <td class="number">{row.diff.effort.toFixed(1)} Lkm</td>
                    <td class="number">{formatDuration(row.diff.duration)} h</td>
                {:else}
                    <td />
                    <td />
                    <td />
                    <td />
                {/if}
                <td />
            </tr>
        {/if}
    {/each}
</table>
<br />
<button on:click={exportCsv} class="noprint"><Icon name="output" /> CSV exportieren</button>

<style>
    table {
        white-space: nowrap;
    }

    th, td {
        text-align: left;
        vertical-align: bottom;
    }

    th:not(:first-child), td:not(:first-child) {
        padding-left: 1rem;
    }

    .close {
        padding-left: 0.25rem;
    }

    .alt td {
        vertical-align: top;
        color: var(--accent-color);
    }

    .number {
        text-align: right;
        font-family: "Roboto Mono", monospace;
    }

    .index {
        display: inline-block;
        min-width: 1.3em;
        border-radius: 1em;
        font-weight: bold;
        text-align: center;
        color: var(--background-color);
        background: var(--darker-accent-color);
    }

    .name {
        font-weight: bold;
        color: var(--darker-accent-color);
    }

    .comment {
        max-width: 20rem;
        white-space: normal;
    }
</style>
