<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from "svelte/transition";
    import Icon from "./Icon.svelte";

    export let title;
    export let show = false;

    const dispatch = createEventDispatcher();

    function close() {
        show = false;
        dispatch("close");
    }
</script>

{#if show}
    <div transition:fade={{ duration: 100 }}>
        <div class="background"></div>
        <div class="dialog">
            <h2>{title}</h2>
            <form on:submit|preventDefault={close}>
                <slot></slot>
                <br />
                <button>
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
        background-color: var(--shadow-color);
    }

    .dialog {
        position: fixed;
        width: 25rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 3rem;
        border-radius: 2rem;
        background-color: var(--background-color);
        box-shadow: 1rem 1rem 2rem var(--shadow-color);
    }
    
    @media (max-width: 600px) {
        .dialog {
            left: 10vw;
            width: 80vw;
            transform: translate(0, -50%);
            padding: 1rem;
            border-radius: 1rem;
        }
    }

    h2 {
        margin-top: 0;
    }
    
    button {
        float: right;
    }
</style>
