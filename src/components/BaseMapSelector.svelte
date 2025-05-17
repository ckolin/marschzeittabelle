<script lang="ts">
    import pixelkarteIcon from "../assets/pixelkarte.jpg";
    import baseIcon from "../assets/base.jpg";
    import imageryBaseIcon from "../assets/imagerybase.jpg";

    const baseMaps = [
        { id: "pixelkarte", label: "Pixelkarte", icon: pixelkarteIcon },
        { id: "base", label: "Base Map", icon: baseIcon },
        { id: "imagerybase", label: "Imagery Base Map", icon: imageryBaseIcon },
    ];

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
        gap: 0.5rem;
    }

    input {
        position: fixed;
        opacity: 0;
    }

    img {
        display: block;
        width: 5rem;
        object-fit: cover;
        border-radius: 0.5rem;
        border-width: 0;
        transition: border-width 100ms;
    }
    
    input:checked + img {
        border: 4px solid var(--accent-color);
    }
</style>
