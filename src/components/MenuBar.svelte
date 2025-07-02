<script lang="ts">
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { GREEN, PINK } from "../lib/theme";
</script>

<div>
    <h3>Marschzeittabelle</h3>
    <Button --acc={PINK}><Icon name="delete" /> Verwerfen</Button>
    <Button --acc={GREEN}><Icon name="arrow_forward" /> Fertigstellen</Button>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
    }

    h3 {
        flex-grow: 1;
    }
</style>
