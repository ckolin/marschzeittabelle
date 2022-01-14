<script>
    import { parseKml } from "./modules/import.js";

    export let route = null;

    let files;

    $: if (files && files[0]) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const res = parseKml(reader.result);
            res.loadProfiles().then(() => route = res); // Trigger reactivity
        });
        reader.readAsText(files[0]);
    }
</script>

<div
    on:drop|preventDefault={(e) => files = e.dataTransfer.files}
    on:dragover|preventDefault>
    {#if !(files && files[0])}
        <h2>Route hochladen</h2>
        <p>Unterstützt sind Exporte im <b>KML-Format</b> von <a href="https://map.geo.admin.ch" target="_blank">map.geo.admin.ch</a> oder der <a href="https://www.swisstopo.admin.ch/en/maps-data-online/maps-geodata-online/swisstopo-app.html" target="_blank">swisstopo-App</a>.</p>
        <p>Datei hierher ziehen oder...</p>
        <input type="file" id="upload" accept=".kml" bind:files />
        <button>
            <label for="upload">Datei auswählen</label>
        </button>
        <br>
    {:else}
        <h3>Route wird gewandert...</h3>
    {/if}
</div>

<style>
    div {
        border-radius: 1rem;
        border: 3px dashed var(--lighter-accent-color);
        padding: 3rem;
        text-align: center;
    }

    input {
        opacity: 0;
        position: absolute;
        width: 0;
        height: 0;
    }

    label {
        cursor: inherit;
    }
</style>
