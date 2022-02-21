<script>
    import { slide } from "svelte/transition";
    import { saveRoute } from "../modules/storage.js";
    import Icon from "./Icon.svelte";
    import Options from "./Options.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    export let route;
    $: saveRoute(route); // Save route whenever it is changed

    let showProfile = true;
</script>

<div class="options">
    <h1>
        <input id="title" type="text" bind:value={route.title} />
    </h1>
    <div class="noprint">
        <button class="pill" on:click={() => document.getElementById("title").select()}>
            <Icon name="edit" /> Titel bearbeiten
        </button>
        <br />
        <br />
    </div>
    <Options bind:route />
</div>
<div class="table">
    <h2>Marschzeittabelle</h2>
    <Table bind:route />
</div>
<div class="profile" class:noprint={!showProfile}>
    <h2>Höhenprofil</h2>
    <button class="pill noprint" on:click={() => (showProfile = !showProfile)}>
        {#if showProfile}
            <Icon name="visibility_off" /> Ausblenden
        {:else}
            <Icon name="visibility" /> Anzeigen
        {/if}
    </button>
    {#if showProfile}
        <div transition:slide={{ duration: 100 }}>
            <Profile {route} />
        </div>
    {/if}
</div>

<style>
    h1, h2 {
        margin-bottom: 0.5rem;
    }

    h1 input {
        width: 100%;
        padding: 0;
        border: none;
        font-weight: inherit;
    }

    h2 {
        display: inline-block;
    }

    h2 + button {
        vertical-align: 0.2em;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
