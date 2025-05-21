<script lang="ts">
    import { search, type SearchResult } from "../lib/geoadmin";
    import type { Point2 } from "../lib/points";

    const {
        onHighlight,
        onHighlightEnd,
        onNavigate,
    }: {
        onHighlight: (p: Point2) => void;
        onHighlightEnd: () => void;
        onNavigate: (p: Point2) => void;
    } = $props();

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
            onHighlightEnd();
        }
    }
</script>

<svelte:body onmousedown={onOutside} />
<div bind:this={container}>
    <input
        type="search"
        placeholder="Gipfel, Ortschaft, Haltestelle, ..."
        onfocus={() => (focus = true)}
        bind:value={query}
    />
    {#if focus}
        {#each results as { point, label }}
            <button
                onclick={() => {
                    onNavigate(point);
                    onHighlight(point);
                }}
            >
                {@html label}
            </button>
        {/each}
    {/if}
</div>

<style>
    div {
        width: 20rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    input {
        font: inherit;
        background: #fff;
        border: 1px solid var(--shadow);
        padding: 0.25rem 0.5rem;
        border-radius: 0.2rem;
    }

    input:focus {
        outline: 2px solid var(--secondary);
    }

    button {
        font: inherit;
        font-size: 0.8em;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: inherit;
        color: inherit;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        padding: 0.3rem 0;
        border-bottom: 1px solid var(--shadow);
    }

    button:last-child {
        border-bottom: none;
    }
</style>
