<script>
    export let topic = null;
    export let label = "?";
</script>

<a class="noprint" href={topic == null ? "help" : `help#${topic}`} target="_blank" tabindex="-1">
   <button class="pill">{label}</button>
</a>
