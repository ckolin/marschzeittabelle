<script>
    import Icon from "./Icon.svelte";
    import Info from "./Info.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    import { reverseRoute } from "./modules/route.js";

    export let route;
    let speed = 4;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function print() {
        window.print();
    }
</script>

<div class="general">
    <div class="info">
        <h2>Route</h2>
        <Info {route} {speed}/>
    </div>
    <div class="options noprint">
        <h2>Optionen</h2>
        <label for="speed">Geschwindigkeit in Lkm/h</label>
        <input id="speed" type="number" min="0.5" step="0.5" bind:value={speed} />
        <br />
        <button class="secondary" on:click={reverse}><Icon name="swap_horiz" /> Richtung wechseln</button>
        <br />
        <br />
        <button on:click={print}><Icon name="download" /> Herunterladen</button>
    </div>
</div>
<div class="table">
    <h2>Marschzeittabelle</h2>
    <Table {route} {speed} />
</div>
<div class="profile">
    <h2>Höhenprofil</h2>
    <Profile {route} />
</div>

<style>
    .general {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .options label, input {
        display: block;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
