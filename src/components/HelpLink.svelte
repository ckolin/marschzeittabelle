<script>
    export let topic = null;
    export let label = "?";
</script>

<a class="noprint" href={topic == null ? "help" : `help#${topic}`} target="_blank">
    {label}
</a>

<style>
    a {
        white-space: nowrap;
        font-weight: bold;
        cursor: help;
    }
</style>