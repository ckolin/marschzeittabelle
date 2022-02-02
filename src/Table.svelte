<script>
    import Icon from "./Icon.svelte";
    import MarkerDialog from "./MarkerDialog.svelte";

    import { formatDuration, formatTime } from "./modules/formatting.js";
    import { calculateData } from "./modules/table.js";

    export let route;
    export let speed;
    export let start;

    let data = [];
    let selected;

    $: data = calculateData(route, speed, start);
</script>

<MarkerDialog bind:route bind:selected />
<table>
    <tr>
        <th>Wegpunkt</th>
        <th>Höhe</th>
        <th>Distanz</th>
        <th>Aufwand</th>
        <th>Dauer</th>
        <th>Uhrzeit</th>
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
                <button class="pill" on:click={() => selected = row.index}>
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
        vertical-align: bottom;
    }

    th:not(:last-child), td:not(:last-child) {
        padding-right: 1rem;
    }

    .alt td {
        vertical-align: top;
        color: var(--accent-color);
    }
    
    .name {
        font-weight: bold;
        color: var(--darker-accent-color);
    }
    
    .name .pill {
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
