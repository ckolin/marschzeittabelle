<script>
    import { parseKml } from "./modules/import.js";

    export let route = null;

    let files;

    $: if (files && files[0]) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            route = parseKml(reader.result);
            route.loadProfiles().then(() => (route = route)); // Trigger reactivity
        });
        reader.readAsText(files[0]);
    }
</script>

<main>
    <input type="file" accept=".kml, text/xml" bind:files />
</main>

<style>
</style>
