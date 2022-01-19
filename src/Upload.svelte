<script>
    import { importFile } from "./modules/import.js";

    export let route = null;

    let files;
    let promise;

    $: if (files && files[0]) {
        promise = importFile(files[0])
            .then((result) => route = result); // Trigger reactivity
    }
</script>

<div
    on:drop|preventDefault={(e) => files = e.dataTransfer.files}
    on:dragover|preventDefault>
    {#if files && files[0]}
        {#await promise}
            <h3>Route wird gewandert...</h3>
        {:catch error}
            <h3>Hoppla Schorsch!</h3>
            <p>Es gab einen Fehler beim Import:<br />{error}</p>
            <button class="secondary" on:click={() => files = null}>Nochmal versuchen</button>
        {/await}
    {:else}
        <h2>Route hochladen</h2>
        <p>Unterstützt sind Exporte im <b>KML-Format</b> von <a href="https://map.geo.admin.ch" target="_blank">map.geo.admin.ch</a> oder der <a href="https://www.swisstopo.admin.ch/en/maps-data-online/maps-geodata-online/swisstopo-app.html" target="_blank">swisstopo-App</a>.</p>
        <p>Datei hierher ziehen oder...</p>
        <input type="file" id="upload" accept=".kml" bind:files />
        <button>
            <label for="upload">Datei auswählen</label>
        </button>
        <br>
    {/if}
</div>

<style>
    div {
        border-radius: 2rem;
        border: 3px dashed var(--lighter-accent-color);
        padding: 3rem 2rem;
        text-align: center;
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
