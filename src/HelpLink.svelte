<script>
    export let topic = null;
</script>

<a href={topic == null ? "help" : `help#${topic}`} target="_blank" class="noprint">?</a>

<style>
    a {
        font-weight: bold;
    }
</style>
