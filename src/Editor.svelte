<script>
    import { slide } from "svelte/transition";

    import Icon from "./Icon.svelte";
    import Options from "./Options.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    export let route;

    let showProfile = true;
</script>

<div class="options">
    <h1 id="title" contenteditable="true" bind:textContent={route.title}></h1>
    <button class="pill noprint" on:click={() => document.getElementById("title").focus()}>
        <Icon name="edit" />
    </button>
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
        display: inline-block;
        margin-bottom: 0.5rem;
    }

    :is(h1, h2) + button {
        vertical-align: 0.2em;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
