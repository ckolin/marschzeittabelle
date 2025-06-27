<script lang="ts">
    import Icon from "./Icon.svelte";

    const { children, icon = undefined } = $props();
</script>

<div class="box">
    {#if icon}
        <div class="icon"><Icon name={icon} huge /></div>
    {/if}
    {@render children()}
</div>

<style>
    .box {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 0.3rem;
        color: var(--fg);
        outline: 2px solid var(--acc);
        border: 12px solid color-mix(in srgb, var(--acc), transparent 70%);
        backdrop-filter: blur(8px);
        padding: 0.8rem;
    }

    .icon {
        position: absolute;
        top: 0.5rem;
        right: 0.3rem;
        color: var(--acc);
        opacity: 0.3;
    }
</style>
