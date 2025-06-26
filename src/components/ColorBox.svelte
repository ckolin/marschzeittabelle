<script lang="ts">
    const { children } = $props();
</script>

<div>
    {@render children()}
</div>

<style>
    div {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 0.3rem;
        color: var(--fg);
        outline: 2px solid var(--acc);
        border: 12px solid color-mix(in srgb, var(--acc), transparent 70%);
        padding: 0.8rem;
    }
</style>
