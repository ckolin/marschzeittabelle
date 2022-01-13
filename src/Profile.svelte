<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (route?.lineProfile && route?.markerProfile && canvas) {
        drawProfile(route, canvas);
    }
</script>

<canvas bind:this={canvas} width="600" height="200" />

<style>
</style>
