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
    <div>
        <input
            type="search"
            placeholder="Gipfel, Ortschaft, Haltestelle, ..."
            onfocus={() => (focus = true)}
            {onkeydown}
            bind:value={query}
        />
        <Icon name="search" />
    </div>
    {#if focus}
        {#each results as { point, label }}
            <button onclick={() => onSelect(point)}>
                {@html label}
            </button>
        {/each}
    {/if}
</div>

<style>
    .container {
        width: 20rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .container div {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    input {
        flex-grow: 1;
        font: inherit;
        background: none;
        border: none;
        border-radius: 0.2rem;
    }

    input:focus {
        outline: none;
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
