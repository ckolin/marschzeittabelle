<script>
    export let route;
    export let speed;

    let data = [];

    $: data = calculate(route, speed);

    function calculate(route, speed) {
        const res = [];
        for (let i = 0; i < route.markers.length; i++) {
            res[i] = {
                number: i + 1,
                name: route.markers[i].name,
                distance: route.distanceSum[route.markers[i].index],
                height: route.markerProfile[i].height,
            };

            res[i].time = res[i].distance / speed / 1000 * 60;

            if (i > 0) {
                res[i].addedDistance = res[i].distance - res[i - 1].distance;
                res[i].addedHeight = res[i].height - res[i - 1].height;
            }
        }
        return res;
    }
</script>

<h2>Marschzeittabelle</h2>
<table>
    <tr>
        <th>#</th>
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
            </tr>
        {/if}
        <tr>
            <td>{row.number}</td>
            <td>{row.name}</td>
            <td class="number">{Math.round(row.distance)} m</td>
            <td class="number">{Math.round(row.height)} m</td>
            <td class="number">{Math.round(row.time)} min</td>
        </tr>
    {/each}
</table>

<style>
    .alt {
        opacity: 0.5;
    }

    .number {
        text-align: right;
    }
</style>
