<script>
    import HelpLink from "./HelpLink.svelte";

    import { formatDuration } from "./modules/formatting.js";

    export let route;
    export let speed;

    $: ({ascent, descent} = calculateHeightDifference(route));

    function calculateHeightDifference(route) {
        let ascent = 0, descent = 0;
        for (let i = 1; i < route.markers.length; i++) {
            const diff = route.markerProfile[i].height - route.markerProfile[i - 1].height;
            if (diff > 0) {
                ascent += diff;
            } else {
                descent -= diff;
            }
        }
        return { ascent, descent };
    }
</script>

Start: <b>{route.markers[0].name}</b><br />
Ende: <b>{route.markers[route.markers.length - 1].name}</b><br />
Auf-/Abstieg: ↑ <b>{Math.round(ascent)} m</b> ↓ <b>{Math.round(descent)} m</b><br />
Distanz: <b>{(route.distanceSum[route.line.length - 1] / 1000).toFixed(1)} km</b><br />
Aufwand: <b>{route.effortSum[route.markers.length - 1].toFixed(1)} Lkm</b> <HelpLink topic="berechnung" /><br />
Dauer: <b>{formatDuration(route.effortSum[route.markers.length - 1] / speed)} h</b><br />

<style>
</style>
