<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (canvas) {
        drawProfile(route, canvas);
    }
</script>

<h2>Höhenprofil</h2>
<canvas bind:this={canvas} width="600" height="200" />

<style>
</style>
