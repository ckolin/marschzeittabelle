<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (route && route.lineProfile && route.markerProfile && canvas) {
        drawProfile(route, canvas);
    }
</script>

<main>
    <canvas bind:this={canvas} width="600" height="200" />
</main>

<style>
</style>
