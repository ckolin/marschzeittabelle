<script lang="ts">
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
</script>

<div>
    <span>Marschzeittabelle</span>
    <Button><Icon name="arrow_forward" /> Fertigstellen</Button>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
    }
</style>
