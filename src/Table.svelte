<script>
    import MarkerDetail from "./MarkerDetail.svelte";

    import { formatDuration, formatTime } from "./modules/formatting.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;
    export let speed;

    let data = [];
    let selected;

    $: data = calculateData(route, speed);
</script>

<MarkerDetail bind:route bind:selected />
<table>
    <tr>
        <th />
        <th>Wegpunkt</th>
        <th>Höhe</th>
        <th>Distanz</th>
        <th>Aufwand</th>
        <th>Dauer</th>
        <th>Uhrzeit</th>
    </tr>
    {#each data as row}
        <tr>
            <td><span class="index">{row.index}</span></td>
            <td class="name" on:click={() => selected = row.index - 1}>{row.name}</td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{row.distance.toFixed(1)} km</td>
            <td class="number">{row.effort.toFixed(1)} Lkm</td>
            <td class="number">{formatDuration(row.duration)} h</td>
            <td class="number">{formatTime(row.duration)}</td>
        </tr>
        {#if row.comment || row.diff}
            <tr class="alt">
                <td />
                <td class="comment">{row.comment ?? ""}</td>
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

<style>
    table {
        white-space: nowrap;
    }

    th, td {
        text-align: left;
        vertical-align: bottom;
    }

    th:not(:last-child), td:not(:last-child) {
        padding-right: 1rem;
    }

    th:first-child, td:first-child {
        padding-right: 0.2rem;
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
