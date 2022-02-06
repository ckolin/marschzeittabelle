<script>
    export let name;
    export let big = false;
</script>

<span class="material-icons-round" class:big>{name}</span>

<style>
    span {
        font-size: 18px;
        vertical-align: -0.15em;
    }

    .big {
        font-size: 24px;
    }
</style>
