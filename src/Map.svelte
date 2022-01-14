<script>
    import { drawRoute } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (canvas) {
        drawRoute(route, canvas);
    }
</script>

<canvas bind:this={canvas} width="300" height="300" />

<style>
</style>
