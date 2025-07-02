<script lang="ts">
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import { GREEN, PINK } from "../lib/theme";
</script>

<nav>
    <span>Marschzeittabelle</span>
    <Button --acc={PINK}><Icon name="delete" /> Verwerfen</Button>
    <Button --acc={GREEN}><Icon name="arrow_forward" /> Fertigstellen</Button>
</nav>

<style>
    nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        box-shadow: 0 0 0.5rem var(--shadow);
        z-index: 10;
    }

    span {
        flex-grow: 1;
    }
</style>
