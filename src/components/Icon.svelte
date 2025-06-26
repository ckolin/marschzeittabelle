<script lang="ts">
    const { name, big = false } = $props();
</script>

<span class="material-symbols-outlined" class:big>{name}</span>

<style>
    span {
        font-size: var(--size, 18px);
        vertical-align: -0.15em;
        user-select: none;
    }

    .big {
        font-size: var(--size, 24px);
    }
</style>
