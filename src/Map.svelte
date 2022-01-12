<script>
    import { drawRoute } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (route && canvas) {
        drawRoute(route, canvas);
    }
</script>

<main>
    <canvas bind:this={canvas} width="400" height="400" />
</main>

<style>
</style>
