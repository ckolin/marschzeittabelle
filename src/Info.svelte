<script>
    export let route;
</script>

Start: <b>{route.markers[0].name}</b><br>
Ende: <b>{route.markers[route.markers.length - 1].name}</b><br>
Distanz: <b>{Math.round(route.distanceSum[route.line.length - 1])} m</b><br>

<style>
</style>
