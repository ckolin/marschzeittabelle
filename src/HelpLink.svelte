<script>
    export let topic = null;
    export let label = "?";
</script>

<a href={topic == null ? "help" : `help#${topic}`} target="_blank" class="noprint">{label}</a>

<style>
    a {
        padding: 0 0.35em;
        border-radius: 1em;
        font-weight: bold;
        text-decoration: none;
        color: var(--text-color);
        background: var(--lighter-accent-color);
    }
</style>
