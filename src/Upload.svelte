<script>
    import { parseKml } from "./modules/import.js";

    export let route = null;

    let files;

    $: if (files && files[0]) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const res = parseKml(reader.result);
            res.loadProfiles().then(() => (route = res)); // Trigger reactivity
        });
        reader.readAsText(files[0]);
    }
</script>

<input type="file" accept=".kml, text/xml" bind:files />

<style>
</style>
