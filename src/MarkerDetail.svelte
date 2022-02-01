<script>
    import Icon from "./Icon.svelte";

    import { fade } from "svelte/transition";

    export let route;
    export let index = null;

    $: marker = route.markers[index];
</script>

{#if index != null}
    <div transition:fade={{duration: 100}}>
        <div class="background" />
        <div class="content">
            <h2>{marker.name}</h2>
            <button on:click={() => (index = null)}>
                <Icon name="done" /> Fertig
            </button>
        </div>
    </div>
{/if}

<style>
    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: var(--background-color);
        opacity: 0.6;
    }

    .content {
        position: fixed;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        padding: 3rem;
        border-radius: 2rem;
        background-color: var(--background-color);
        box-shadow: 1rem 1rem 2rem rgba(0, 0, 0, 0.2);
    }
</style>
