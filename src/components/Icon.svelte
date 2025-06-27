<script lang="ts">
    const { name, big = false, huge = false } = $props();
</script>

<span class="material-symbols-outlined" class:big class:huge>{name}</span>

<style>
    span {
        font-size: 18px;
        vertical-align: -0.15em;
        user-select: none;
    }

    .big {
        font-size: 24px;
    }

    .huge {
        font-size: 96px;
    }
</style>
