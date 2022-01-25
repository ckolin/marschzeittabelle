<script>
    import Icon from "./Icon.svelte";

    import { formatDuration, formatTime } from "./modules/formatting.js";

    export let route;
    export let speed;

    let data = [];

    $: if (!window.isNaN(speed) && speed > 0) {
        data = calculate(route, speed);
    }

    function calculate(route, speed) {
        const res = [];
        for (let i = 0; i < route.markers.length; i++) {
            res[i] = {
                index: i + 1,
                name: route.markers[i].name,
                height: route.markerProfile[i].height,
                distance: route.distanceSum[route.markers[i].index] / 1000,
                effort: route.effortSum[i],
                duration: route.effortSum[i] / speed
            };

            if (i > 0) {
                res[i].diff = {
                    height: res[i].height - res[i - 1].height,
                    distance: res[i].distance - res[i - 1].distance,
                    effort: route.effort[i],
                    duration: res[i].duration - res[i - 1].duration
                };
            }
        }
        return res;
    }

    function exportCsv() {
        const header = [
            "Nr.",
            "Name",
            "Höhe / m",
            "Unterschied Höhe / m",
            "Total Distanz / km",
            "Unterschied Distanz / km",
            "Total Aufwand / Lkm",
            "Unterschied Aufwand / Lkm",
            "Total Dauer / h",
            "Unterschied Dauer / h",
            "Uhrzeit / h",
        ];

        const rows = data.map((row) => [
            row.index,
            row.name,
            row.height,
            row.diff?.height ?? 0,
            row.distance,
            row.diff?.distance ?? 0,
            row.effort,
            row.diff?.effort ?? 0,
            row.duration,
            row.diff?.duration ?? 0,
            row.duration,
        ]);

        const csv = [header, ...rows]
            .map((fields) => fields.map((f) => `"${f}"`).join(","))
            .join("\n");

        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

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
        {#if row.diff}
            <tr class="alt">
                <td />
                <td class="number">{Math.round(row.diff.height)} m</td>
                <td class="number">{row.diff.distance.toFixed(1)} km</td>
                <td class="number">{row.diff.effort.toFixed(1)} Lkm</td>
                <td class="number">{formatDuration(row.diff.duration)} h</td>
                <td />
            </tr>
        {/if}
        <tr>
            <td class="name"><span>{row.index}</span> {row.name}</td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{row.distance.toFixed(1)} km</td>
            <td class="number">{row.effort.toFixed(1)} Lkm</td>
            <td class="number">{formatDuration(row.duration)} h</td>
            <td class="number">{formatTime(row.duration)}</td>
        </tr>
    {/each}
</table>
<br />
<button on:click={exportCsv} class="noprint"><Icon name="output" /> CSV exportieren</button>

<style>
    table {
        white-space: nowrap;
    }

    th {
        text-align: left;
    }

    th, td {
        padding-left: 1rem;
    }

    th:first-child, td:first-child {
        padding-left: 0;
    }

    .name {
        font-weight: bold;
        color: var(--darker-accent-color);
    }

    .name span {
        display: inline-block;
        min-width: 1.3em;
        border-radius: 1em;
        font-weight: bold;
        text-align: center;
        color: var(--background-color);
        background: var(--darker-accent-color);
    }

    .alt {
        color: var(--accent-color);
    }

    .number {
        text-align: right;
        font-family: "Roboto Mono", monospace;
    }
</style>
