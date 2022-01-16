<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (canvas) {
        drawProfile(route, canvas);
    }
</script>

<canvas bind:this={canvas} width="800" height="150" />

<style>
    @media print {
        canvas {
            max-width: 100%;
        }
    }
</style>
