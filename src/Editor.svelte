<script>
    import Icon from "./Icon.svelte";
    import Info from "./Info.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";

    import { reverseRoute } from "./modules/route.js";
    import { calculateData, getCsv } from "./modules/table.js";

    export let route;
    
    let speedInput = 4;
    let speed;
    $: if (!window.isNaN(speedInput) && speedInput > 0) {
        speed = speedInput;
    }
    
    let startInput = "00:00";
    let start;
    $: start = startInput
        .split(":")
        .map((n, i) => Number(n) / 60 ** i)
        .reduce((a, b) => a + b);

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function exportCsv() {
        const csv = getCsv(calculateData(route, speed, start));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "marschzeittabelle.csv";
        a.click();
    }
</script>

<div class="general">
    <div class="info">
        <h1>Route</h1>
        <Info {route} {speed} {start} />
    </div>
    <div class="options noprint">
        <button on:click={() => window.print()}>
            <Icon name="print" /> Drucken
        </button>
        &nbsp;
        <button on:click={exportCsv} class="secondary">
            <Icon name="output" /> Exportieren (CSV)
        </button>
        <br />
        <br />
        <button class="stretch secondary" on:click={reverse}>
            <Icon name="swap_horiz" /> Richtung wechseln
        </button>
        <br />
        <label for="speed">Geschwindigkeit (Lkm/h)</label>
        <input id="speed" class="stretch" type="number" min="0.5" step="0.5" required bind:value={speedInput} />
        <label for="start">Abreise</label>
        <input id="start" class="stretch" type="time" required bind:value={startInput} />
    </div>
</div>
<div class="table">
    <h2>Marschzeittabelle</h2>
    <Table bind:route {speed} {start} />
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
        margin-top: 2rem;
    }

    .general h1 {
        margin-top: 0;
    }

    .options label {
        display: block;
    }

    .options .stretch {
        width: 100%;
    }

    .options input, button {
        margin-bottom: 0.5rem;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }
</style>
