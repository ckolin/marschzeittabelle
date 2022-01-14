<script>
    export let route;
    export let speed;

    let data = [];

    $: if (!isNaN(speed) && speed > 0) {
        data = calculate(route, speed);
    }

    function calculate(route, speed) {
        const res = [];
        for (let i = 0; i < route.markers.length; i++) {
            res[i] = {
                index: i + 1,
                name: route.markers[i].name,
                distance: route.distanceSum[route.markers[i].index],
                height: route.markerProfile[i].height,
            };

            res[i].time = res[i].distance / speed / 1000 * 60;

            if (i > 0) {
                res[i].addedDistance = res[i].distance - res[i - 1].distance;
                res[i].addedHeight = res[i].height - res[i - 1].height;
                res[i].addedTime = res[i].time - res[i - 1].time;
            }
        }
        return res;
    }
</script>

<h2>Marschzeittabelle</h2>
<table>
    <tr>
        <th />
        <th>Wegpunkt</th>
        <th colspan="2">Distanz</th>
        <th colspan="2">Höhe</th>
        <th colspan="2">Zeit</th>
    </tr>
    {#each data as row, i}
        {#if i > 0}
            <tr class="alt">
                <td />
                <td />
                <td class="number">{Math.round(row.addedDistance)}</td>
                <td class="unit">m</td>
                <td class="number">{Math.round(row.addedHeight)}</td>
                <td class="unit">m</td>
                <td class="number">{Math.round(row.addedTime)}</td>
                <td class="unit">min</td>
            </tr>
        {/if}
        <tr>
            <td class="index">{row.index}</td>
            <td class="name">{row.name}</td>
            <td class="number">{Math.round(row.distance)}</td>
            <td class="unit">m</td>
            <td class="number">{Math.round(row.height)}</td>
            <td class="unit">m ü.M.</td>
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
        padding: 0 0.3em;
        border-radius: 50%;
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
        color: var(--lighter-accent-color);
    }

    .number {
        padding-right: 0;
        text-align: right;
    }

    .unit {
        padding-left: 0;
    }
</style>
