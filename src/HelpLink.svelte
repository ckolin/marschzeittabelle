<script>
    export let topic = null;
</script>

<a href={topic == null ? "hilfe" : `hilfe#${topic}`} target="_blank">?</a>

<style>
    a {
        font-weight: bold;
    }
</style>
