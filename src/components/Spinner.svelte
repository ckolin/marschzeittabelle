<script lang="ts">
    const { small = false } = $props();
</script>

<div class:small></div>

<style>
    div {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--secondary-light);
        border-bottom-color: var(--secondary);
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
