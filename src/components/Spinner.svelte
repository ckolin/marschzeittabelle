<script>
    export let small = false;
</script>

<div class:small></div>

<style>
    div {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--lighter-accent-color);
        border-bottom-color: var(--accent-color);
        border-radius: 50%;
        animation: rotation 1s linear infinite;
    }

    div.small {
        width: 1rem;
        height: 1rem;
        border-width: 2px;
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
