<script lang="ts">
    import Intro from "./components/Intro.svelte";
    import Map from "./components/Map.svelte";
    import { BLACK, RED, WHITE } from "./lib/theme";
</script>

<Intro --fg={BLACK} --bg={WHITE} />
<!--<Map --acc={RED} --fg={WHITE} --bg={BLACK} />-->

<style>
</style>
