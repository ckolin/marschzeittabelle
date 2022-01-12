<script>
    import { parseKml } from "./modules/import.js";
    import { fetchProfile } from "./modules/geoadmin.js";

    export let route = null;

    let files;

    $: if (files && files[0]) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            route = parseKml(reader.result);

            // Load height data
            fetchProfile(route.line, false, 100)
                .then(profile => route.lineProfile = profile);
            fetchProfile(route.markers.map(m => route.line[m.index]), true, route.markers.length)
                .then(profile => route.markerProfile = profile);
        });
        reader.readAsText(files[0]);
    }
</script>

<main>
    <input type="file" accept=".kml, text/xml" bind:files />
</main>

<style>
</style>
