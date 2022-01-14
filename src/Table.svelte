<script>
    export let route;
    export let speed;

    let data = [];

    $: data = calculate(route, speed);

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
        <th></th>
        <th>Wegpunkt</th>
        <th>Distanz</th>
        <th>Höhe</th>
        <th>Zeit</th>
    </tr>
    {#each data as row, i}
        {#if i > 0}
            <tr class="alt">
                <td />
                <td />
                <td class="number">{Math.round(row.addedDistance)} m</td>
                <td class="number">{Math.round(row.addedHeight)} m</td>
                <td class="number">{Math.round(row.addedTime)} min</td>
            </tr>
        {/if}
        <tr>
            <td class="index">{row.index}</td>
            <td class="name">{row.name}</td>
            <td class="number">{Math.round(row.distance)} m</td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{Math.round(row.time)} min</td>
        </tr>
    {/each}
</table>

<style>
    .index {
        width: 20px;
        height: 20px;
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
        padding: 0 1em;
        text-align: right;
    }
</style>
