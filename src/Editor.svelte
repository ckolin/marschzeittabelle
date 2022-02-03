<script>
    import Icon from "./Icon.svelte";
    import Info from "./Info.svelte";
    import Options from "./Options.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    export let route;
</script>

<div class="general">
    <div class="info">
        <h1 id="title" contenteditable="true" bind:textContent={route.title}></h1>
        <button class="pill noprint" on:click={() => document.getElementById("title").focus()}>
            <Icon name="edit" />
        </button>
        <Info {route} />
    </div>
    <div class="options noprint">
        <h2>Optionen</h2>
        <Options bind:route />
    </div>
</div>
<div class="table">
    <h2>Marschzeittabelle</h2>
    <Table bind:route />
</div>
<div class="profile">
    <h2>Höhenprofil</h2>
    <Profile {route} />
</div>

<style>
    h1, h2 {
        margin-bottom: 0.5rem;
    }

    .general {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .info {
        flex: 1 1 20rem;
    }

    .info h1 {
        display: inline-block;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
