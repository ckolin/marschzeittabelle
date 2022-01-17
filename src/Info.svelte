<script>
    export let route;
</script>

Start: <b>{route.markers[0].name}</b><br />
Ende: <b>{route.markers[route.markers.length - 1].name}</b><br />
Distanz: <b>{(route.distanceSum[route.line.length - 1] / 1000).toFixed(1)} km</b><br />
Aufwand: <b>{(route.effortSum[route.markers.length - 1]).toFixed(1)} Lkm</b><br />

<style>
</style>
