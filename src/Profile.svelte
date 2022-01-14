<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (canvas) {
        drawProfile(route, canvas);
    }
</script>

<canvas bind:this={canvas} width="800" height="100" />

<style>
</style>
