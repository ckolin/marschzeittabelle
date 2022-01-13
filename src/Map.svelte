<script>
    import { drawRoute } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (route && canvas) {
        drawRoute(route, canvas);
    }
</script>

<main>
    <canvas bind:this={canvas} width="300" height="300" />
</main>

<style>
</style>
