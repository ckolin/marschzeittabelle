<script>
    import { drawProfile } from "./modules/drawing.js";

    export let route;

    let canvas;

    $: if (canvas) {
        canvas.width = 800;
        canvas.height = 200;
        drawProfile(route, canvas);
    }
</script>

<canvas bind:this={canvas} />

<style>
    @media print {
        canvas {
            max-width: 100%;
        }
    }
</style>
