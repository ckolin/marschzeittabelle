<script lang="ts">
    const { inline = false } = $props();
</script>

<div class:inline></div>

<style>
    div {
        display: block;
        width: 2rem;
        height: 2rem;
        border: 3px solid color-mix(in srgb, var(--acc), transparent 75%);
        border-bottom-color: var(--acc);
        border-radius: 50%;
        animation: rotation 1s linear infinite;
    }

    div.inline {
        display: inline-block;
        width: 1em;
        height: 1em;
        vertical-align: -0.1em;
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
