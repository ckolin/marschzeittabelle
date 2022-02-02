<script>
    import HelpLink from "./HelpLink.svelte";

    import { formatDuration, formatTime } from "./modules/formatting.js";

    export let route;
    export let speed;
    export let start;

    $: distance = route.distanceSum[route.line.length - 1] / 1000;
    $: effort = route.effortSum[route.markers.length - 1]
    $: duration = effort / speed;
    $: breaks = route.breakSum[route.markers.length - 1] / 60;
    $: total = duration + breaks;
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

<p>
    Start: <b>{route.markers[0].name}</b><br />
    Ziel: <b>{route.markers[route.markers.length - 1].name}</b><br />
</p>
<p>
    Auf-/Abstieg: ↑ <b>{Math.round(ascent)} m</b> ↓ <b>{Math.round(descent)} m</b><br />
    Distanz: <b>{distance.toFixed(1)} km</b><br />
    Aufwand: <b>{effort.toFixed(1)} Lkm</b> <HelpLink topic="calculation" /><br />
</p>
<p>
    Geschwindigkeit: <b>{speed} Lkm/h</b><br />
    Dauer: <b>{formatTime(start)}</b> - <b>{formatTime(start + total)}</b> (<b>{formatDuration(total)} h</b>)<br />
    davon Gehzeit: <b>{formatDuration(duration)} h</b><br />
    davon Pausen: <b>{formatDuration(breaks)} h</b><br />
</p>

<style>
    p {
        margin-top: 0;
    }
</style>