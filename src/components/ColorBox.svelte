<script lang="ts">
    import Icon from "./Icon.svelte";

    const { children, icon = undefined, noborder = false } = $props();
</script>

<div class="box" class:noborder>
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
        background: var(--bg);
        outline: 2px solid var(--acc);
        border: 12px solid color-mix(in srgb, var(--acc), transparent 70%);
        padding: 0.8rem;
        box-shadow: 0 0 0.5rem var(--shadow);
    }

    .box.noborder {
        border: none;
    }

    .icon {
        position: absolute;
        top: 0.5rem;
        right: 0.3rem;
        color: var(--acc);
        opacity: 0.3;
    }
</style>
