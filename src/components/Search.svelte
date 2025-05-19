<script lang="ts">
    import { search, type SearchResult } from "../lib/geoadmin";

    const { onSelect }: { onSelect: (r: SearchResult) => void } = $props();

    let container: HTMLElement;
    let focus = $state(false);
    let query = $state("");
    let results: SearchResult[] = $state([]);

    let timeout: number;
    $effect(() => {
        clearTimeout(timeout);
        const q = query;
        timeout = setTimeout(() => search(q).then((r) => (results = r)), 200);
    });

    function onOutside(e: MouseEvent) {
        if (!e.composedPath().includes(container)) {
            focus = false;
        }
    }
</script>

<svelte:body onmousedown={onOutside} />
<div bind:this={container}>
    <input
        type="search"
        placeholder="Ort, Gipfel, Strasse suchen..."
        onfocus={() => (focus = true)}
        bind:value={query}
    />
    {#if focus}
        {#each results as r}
            <button onclick={() => onSelect(r)}>
                {@html r.label}
            </button>
        {/each}
    {/if}
</div>

<style>
    div {
        width: 25rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    button {
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: inherit;
        color: inherit;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        padding: 0.2rem 0;
        border-bottom: 1px solid var(--shadow-color);
    }

    button:last-child {
        border-bottom: none;
    }
</style>
