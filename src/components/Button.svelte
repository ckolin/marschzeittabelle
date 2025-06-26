<script lang="ts">
    const { children, onclick = undefined } = $props();
</script>

<button {onclick}>{@render children()}</button>

<style>
    button {
        position: relative;
        font-weight: bold;
        color: var(--fg);
        background: color-mix(in srgb, var(--acc), transparent 70%);
        border: none;
        padding: 0.3rem 0.5rem;
        border-bottom: 2px solid var(--acc);
        transition: transform 100ms;
    }

    button:hover {
        transform: rotate(-1deg) scale(1.05);
    }
</style>
