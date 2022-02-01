<script>
    import Icon from "./Icon.svelte";
    import Info from "./Info.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    import { reverseRoute } from "./modules/route.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;
    
    let speedInput = 4;
    let speed = speedInput;
    $: if (!window.isNaN(speedInput) && speedInput > 0) {
        speed = speedInput;
    }
    
    let startInput = "00:00";

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function exportCsv() {
        const csv = getCsv(calculateData(route, speed));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<div class="general">
    <div class="info">
        <h2>Route</h2>
        <Info {route} {speed}/>
    </div>
    <div class="options noprint">
        <h2>Optionen</h2>
        <label for="start">Abreise</label>
        <input id="start" type="time" required bind:value={startInput} />
        <label for="speed">Geschwindigkeit in Lkm/h</label>
        <input id="speed" type="number" min="0.5" step="0.5" required bind:value={speedInput} />
        <button class="secondary" on:click={reverse}>
            <Icon name="swap_horiz" /> Richtung wechseln
        </button>
    </div>
</div>
<div class="table">
    <h2>Marschzeittabelle</h2>
    <Table bind:route {speed} />
</div>
<div class="profile">
    <h2>Höhenprofil</h2>
    <Profile {route} />
</div>
<div class="noprint">
    <br />
    <button on:click={() => window.print()}>
        <Icon name="print" /> Drucken
    </button>
    &nbsp;
    <button on:click={exportCsv} class="secondary">
        <Icon name="output" /> Exportieren (CSV)
    </button>
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

    .options input {
        margin-bottom: 0.5rem;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
