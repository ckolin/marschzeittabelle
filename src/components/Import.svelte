<script>
    import { fade } from "svelte/transition";
    import { formatRelative } from "../modules/formatting.js";
    import { importFile } from "../modules/import.js";
    import { loadData } from "../modules/route.js";
    import { loadRoute } from "../modules/storage.js";
    import { logError, logEvent } from "../modules/logging.js";
    import Icon from "./Icon.svelte";
    import Spinner from "./Spinner.svelte";

    export let route = null;

    let files;
    let recent = loadRoute();
    
    let promise;

    $: if (files && files[0]) {
        // Log file upload attempt
        logEvent("upload-file");
        promise = finish(importFile(files[0]));
    }

    function openRecent() {
        // Log attempt to open recent
        logEvent("open-recent");
        promise = finish(loadData(recent));
    }

    function finish(importPromise) {
        return importPromise
            .then((result) => new Promise((resolve) => {
                // Log successful import
                logEvent("import-success");
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

    function reset() {
        files = null;
        promise = null;
    }
</script>

{#if promise == null}
    <div class="import" in:fade={{ duration: 100 }}>
        <div
            class="upload"
            on:drop|preventDefault={(e) => files = e.dataTransfer.files}
            on:dragover|preventDefault>
            <h2>Route hochladen</h2>
            <p>Unterstützt sind <b>KML-Dateien</b> von <a href="https://map.geo.admin.ch" target="_blank">map.geo.admin.ch</a> oder der <a href="https://www.swisstopo.admin.ch/en/maps-data-online/maps-geodata-online/swisstopo-app.html" target="_blank">swisstopo-App</a>, sowie <b>GPX-Dateien</b> von <a href="https://www.outdooractive.com/de/routeplanner" target="_blank">outdooractive.com</a>.</p>
            <p>Datei hierher ziehen oder...</p>
            <input type="file" id="upload" accept=".kml, .gpx" bind:files />
            <button on:click={() => document.getElementById("upload").click()}>
                <Icon name="upload_file" /> Datei auswählen
            </button>
        </div>
        {#if recent}
            <div class="recent">
                <h2>Zuletzt bearbeitet</h2>
                <p>
                    <b>"{recent.title}"</b><br />
                    <Icon name="schedule" /> {formatRelative(recent.timestamp)}
                </p>
                <button class="secondary" on:click={openRecent}>
                    <Icon name="file_open" /> Öffnen
                </button>
            </div>
        {/if}
    </div>
{:else}
    <div class="message" in:fade={{ duration: 100 }}>
        {#await promise}
            <h2>Route wird gewandert...</h2>
            <br />
            <Spinner />
        {:catch error}
            <h2>Hoppla!</h2>
            <p>
                Es gab einen Fehler beim Import:<br />
                <b>{error.message}</b>
            </p>
            <button class="secondary" on:click={reset}>
                <Icon name="refresh" /> Nochmal versuchen
            </button>
        {/await}
    </div>
{/if}

<style>
    h2 {
        margin: 0;
    }

    .import {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        text-align: center;
    }

    .upload {
        flex: 4 0 25rem;
        padding: 3rem 5rem;
        border-radius: 2rem;
        border: 3px dashed var(--lighter-accent-color);
    }

    @media (max-width: 700px) {
        .upload {
            padding: 1rem;
        }
    }

    input#upload {
        display: none;
    }

    .recent {
        flex: 1 0 10rem;
    }

    .message {
        padding: 4rem;
        text-align: center;
    }
</style>
