<script>
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
                time: route.effortSum[i] / speed * 60
            };

            if (i > 0) {
                res[i].diff = {
                    height: res[i].height - res[i - 1].height,
                    distance: res[i].distance - res[i - 1].distance,
                    effort: route.effort[i],
                    time: res[i].time - res[i - 1].time
                };
            }
        }
        return res;
    }
</script>

<table>
    <tr>
        <th />
        <th>Wegpunkt</th>
        <th colspan="2">Höhe</th>
        <th colspan="2">Distanz</th>
        <th colspan="2">Aufwand</th>
        <th colspan="2">Zeit</th>
    </tr>
    {#each data as row}
        {#if row.diff}
            <tr class="alt">
                <td />
                <td />
                <td class="number">{Math.round(row.diff.height)}</td>
                <td class="unit">m</td>
                <td class="number">{row.diff.distance.toFixed(1)}</td>
                <td class="unit">km</td>
                <td class="number">{row.diff.effort.toFixed(1)}</td>
                <td class="unit">Lkm</td>
                <td class="number">{Math.round(row.diff.time)}</td>
                <td class="unit">min</td>
            </tr>
        {/if}
        <tr>
            <td class="index"><span>{row.index}</span></td>
            <td class="name">{row.name}</td>
            <td class="number">{Math.round(row.height)}</td>
            <td class="unit">m</td>
            <td class="number">{row.distance.toFixed(1)}</td>
            <td class="unit">km</td>
            <td class="number">{row.effort.toFixed(1)}</td>
            <td class="unit">Lkm</td>
            <td class="number">{Math.round(row.time)}</td>
            <td class="unit">min</td>
        </tr>
    {/each}
</table>

<style>
    table {
        table-layout: fixed;
        white-space: nowrap;
    }

    th {
        text-align: left;
    }

    th, td {
        padding: 0 0.4em;
        word-wrap: break-word;
    }

    .index {
        text-align: right;
    }

    .index span {
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

    .alt {
        color: var(--accent-color);
    }

    .number {
        padding-right: 0;
        text-align: right;
    }

    .unit {
        padding-left: 0;
    }
</style>
