<script>
    import { fade } from "svelte/transition";
</script>

<div transition:fade={{ duration: 100 }}>
    <div class="background"></div>
    <div class="dialog">
        <slot></slot>
    </div>
</div>

<style>
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: var(--shadow-color);
    }

    .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 3rem;
        border-radius: 2rem;
        background-color: var(--background-color);
        box-shadow: 1rem 1rem 2rem var(--shadow-color);
    }
</style>