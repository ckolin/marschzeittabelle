<script>
    import Icon from "./Icon.svelte";

    import { fade } from "svelte/transition";

    export let route;
    export let selected = null;

    $: marker = route.markers[selected];
</script>

{#if selected != null}
    <div transition:fade={{ duration: 100 }}>
        <div class="background"></div>
        <div class="detail">
            <h2>Wegpunkt bearbeiten</h2>
            <form on:submit|preventDefault>
                <label for="name">Name</label>
                <input id="name" type="text" bind:value={marker.name} />
                <label for="comment">Kommentar</label>
                <input id="comment" type="text" bind:value={marker.comment} />
                <br />
                <button on:click={() => (selected = null)}>
                    <Icon name="done" /> Fertig
                </button>
            </form>
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
        opacity: 0.8;
    }

    .detail {
        position: fixed;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        padding: 3rem;
        border-radius: 2rem;
        background-color: var(--background-color);
        box-shadow: 1rem 1rem 2rem rgba(0, 0, 0, 0.1);
    }

    h2 {
        margin-top: 0;
    }

    label, input {
        display: block;
    }

    input {
        margin-bottom: 0.5rem;
    }
</style>
