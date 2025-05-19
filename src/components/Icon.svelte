<script lang="ts">
    const { name, big = false } = $props();
</script>

<span class="material-symbols-outlined" class:big>{name}</span>

<style>
    span {
        font-size: 18px;
        vertical-align: -0.15em;
    }

    .big {
        font-size: 24px;
    }
</style>
