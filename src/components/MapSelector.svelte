<script lang="ts">
    import pixelkarteIcon from "../assets/pixelkarte.jpg";
    import baseIcon from "../assets/base.jpg";
    import imageryBaseIcon from "../assets/imagerybase.jpg";

    const baseMaps = [
        { id: "pixelkarte", label: "Pixelkarte", icon: pixelkarteIcon },
        { id: "base", label: "Base Map", icon: baseIcon },
        { id: "imagerybase", label: "Imagery Base Map", icon: imageryBaseIcon },
    ] as const;

    let { baseMap = $bindable(), onchange } = $props();
</script>

<div>
    {#each baseMaps as { id, label, icon }}
        <label>
            <input type="radio" value={id} bind:group={baseMap} {onchange} />
            <img src={icon} alt={label} />
        </label>
    {/each}
</div>

<style>
    div {
        display: flex;
    }

    input {
        position: fixed;
        opacity: 0;
    }

    img {
        display: block;
        width: 3rem;
        height: 5rem;
        object-fit: cover;
        transition:
            width 100ms,
            border-width 100ms;
    }

    label:first-child img {
        border-radius: 0.5rem 0 0 0.5rem;
    }

    label:last-child img {
        border-radius: 0 0.5rem 0.5rem 0;
    }

    input:checked + img {
        width: 5rem;
        border: 4px solid var(--secondary);
    }
</style>
