<script lang="ts">
    import { search, type SearchResult } from "../lib/geoadmin";
    import type { Point2 } from "../lib/points";
    import Icon from "./Icon.svelte";

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

    function onkeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            onSelect(results[0].point);
        }
    }

    function onOutside(e: MouseEvent) {
        if (!e.composedPath().includes(container)) {
            focus = false;
            onHighlightEnd();
        }
    }

    function onSelect(point: Point2) {
        onNavigate(point);
        onHighlight(point);
    }
</script>

<svelte:body onmousedown={onOutside} />
<div class="container" bind:this={container}>
    <label class="bar">
        <input
            type="search"
            placeholder="Gipfel, Ortschaft, Haltestelle, ..."
            onfocus={() => (focus = true)}
            {onkeydown}
            bind:value={query}
        />
        <Icon name="search" />
    </label>
    {#if focus && results.length > 0}
        <div class="results">
            {#each results as { point, label }}
                <button onclick={() => onSelect(point)}>
                    {@html label}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .container {
        width: 22rem;
    }

    .bar {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    input {
        flex-grow: 1;
        background: none;
        border: none;
    }

    input:focus {
        outline: none;
    }

    .results {
        display: flex;
        flex-direction: column;
        margin-top: 0.5rem;
    }

    button {
        font-size: 0.85em;
        overflow: hidden;
        text-align: inherit;
        text-overflow: ellipsis;
        background: none;
        border: none;
        border-bottom: 1px solid
            color-mix(in srgb, var(--text), transparent 75%);
        padding: 0.4rem 0;
        cursor: pointer;
    }

    button:last-child {
        border-bottom: none;
    }
</style>
