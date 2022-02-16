<script>
    import { importFile } from "../modules/import.js";
    import { logError, logEvent } from "../modules/logging.js";
    import Icon from "./Icon.svelte";
    import Spinner from "./Spinner.svelte";

    export let route = null;

    let files;
    let promise;

    $: if (files && files[0]) {
        promise = importFile(files[0])
            .then((result) => new Promise((resolve) => {
                // Log successful upload
                logEvent("upload");
                // Fake loading to prevent flickering and make upload times more consistent
                setTimeout(() => resolve(result), 500);
            }))
            .then((result) => route = result)
            .catch((error) => {
                // Log upload error
                logError(error.id);
                throw error;
            });
    }
</script>

<div
    on:drop|preventDefault={(e) => files = e.dataTransfer.files}
    on:dragover|preventDefault>
    {#if files && files[0]}
        {#await promise}
            <h2>Route wird gewandert...</h2>
            <br />
            <Spinner />
        {:catch error}
            <h2>Hoppla!</h2>
            <p>Es gab einen Fehler beim Import:<br />{error.message}</p>
            <button class="secondary" on:click={() => files = null}>
                <Icon name="refresh" /> Nochmal versuchen
            </button>
        {/await}
    {:else}
        <h2>Route hochladen</h2>
        <p>Unterstützt sind <b>KML-Dateien</b> von <a href="https://map.geo.admin.ch" target="_blank">map.geo.admin.ch</a> oder der <a href="https://www.swisstopo.admin.ch/en/maps-data-online/maps-geodata-online/swisstopo-app.html" target="_blank">swisstopo-App</a>, sowie <b>GPX-Dateien</b> von <a href="https://www.outdooractive.com/de/routeplanner" target="_blank">outdooractive.com</a>.</p>
        <p>Datei hierher ziehen oder...</p>
        <input type="file" id="upload" accept=".kml, .gpx" bind:files />
        <button on:click={() => document.getElementById("upload").click()}>
            <Icon name="upload_file" /> Datei auswählen
        </button>
        <br>
    {/if}
</div>

<style>
    div {
        padding: 3rem 6rem;
        border-radius: 2rem;
        border: 3px dashed var(--lighter-accent-color);
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
        display: none;
    }
</style>
