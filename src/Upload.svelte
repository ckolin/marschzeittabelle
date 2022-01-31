<script>
    import Icon from "./Icon.svelte";

    import { importFile } from "./modules/import.js";

    export let route = null;

    let files;
    let promise;

    $: if (files && files[0]) {
        promise = importFile(files[0])
            .then((result) => route = result);
    }
</script>

<div
    on:drop|preventDefault={(e) => files = e.dataTransfer.files}
    on:dragover|preventDefault>
    {#if files && files[0]}
        {#await promise}
            <h3>Route wird gewandert...</h3>
        {:catch error}
            <h3>Hoppla!</h3>
            <p>Es gab einen Fehler beim Import:<br />{error}</p>
            <button class="secondary" on:click={() => files = null}>Nochmal versuchen</button>
        {/await}
    {:else}
        <h2>Route hochladen</h2>
        <p>Unterstützt sind <b>KML-Dateien</b> von <a href="https://map.geo.admin.ch" target="_blank">map.geo.admin.ch</a> oder der <a href="https://www.swisstopo.admin.ch/en/maps-data-online/maps-geodata-online/swisstopo-app.html" target="_blank">swisstopo-App</a>, sowie <b>GPX-Dateien</b> von <a href="https://www.outdooractive.com/de/routeplanner" target="_blank">outdooractive.com</a>.</p>
        <p>Datei hierher ziehen oder...</p>
        <input type="file" id="upload" accept=".kml, .gpx" bind:files />
        <button>
            <label for="upload"><Icon name="upload_file" /> Datei auswählen</label>
        </button>
        <br>
    {/if}
</div>

<style>
    div {
        border-radius: 2rem;
        border: 3px dashed var(--lighter-accent-color);
        padding: 3rem 6rem;
        text-align: center;
    }

    @media (max-width: 600px) {
        div {
            padding: 2rem;
        }
    }

    div h2 {
        margin: 0;
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
