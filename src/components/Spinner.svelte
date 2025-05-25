<script lang="ts">
    const { inline = false } = $props();
</script>

<div class:inline></div>

<style>
    div {
        display: block;
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--accent);
        border-bottom-color: transparent;
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
