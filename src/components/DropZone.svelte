<script lang="ts">
    import { fade } from "svelte/transition";
    import Icon from "./Icon.svelte";

    let { files = $bindable() } = $props();
    let dragging = $state(false);
</script>

<svelte:window
    ondragenter={(e) => (dragging = e.dataTransfer?.items[0].kind === "file")}
/>
{#if dragging}
    <div out:fade
        role="region"
        ondrop={(e) => {
            files = e.dataTransfer?.files;
            dragging = false;
            e.preventDefault();
        }}
        ondragover={(e) => e.preventDefault()}
        ondragleave={() => (dragging = false)}
    >
        <Icon name="upload_file" huge />
        <p>Datei hier ablegen (GPX oder KML)</p>
    </div>
{/if}

<style>
    div {
        z-index: 1000;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: var(--fg);
        background: color-mix(in srgb, var(--bg), transparent 70%);
        backdrop-filter: blur(16px);
    }

    div :global(*) {
        pointer-events: none;
    }

    div p {
        font-size: 1.5em;
    }
</style>
