<script module lang="ts">
    const baseMaps = [
        { id: "pixelkarte", icon: pixelkarteIcon, label: "Pixelkarte" },
        { id: "base", icon: baseIcon, label: "Base Map" },
        { id: "imagerybase", icon: imageryBaseIcon, label: "Imagery Base Map" },
    ] as const;

    export type BaseMap = (typeof baseMaps)[number]["id"];
</script>

<script lang="ts">
    import pixelkarteIcon from "../assets/pixelkarte.jpg";
    import baseIcon from "../assets/base.jpg";
    import imageryBaseIcon from "../assets/imagerybase.jpg";

    let {
        baseMap = $bindable(),
        onchange,
    }: {
        baseMap: BaseMap;
        onchange: () => void;
    } = $props();
</script>

<div>
    {#each baseMaps as { id, icon, label }}
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
        width: 4rem;
        object-fit: cover;
        transition: border-width 100ms;
    }

    label:first-child img {
        border-radius: 0.5rem 0 0 0.5rem;
    }

    label:last-child img {
        border-radius: 0 0.5rem 0.5rem 0;
    }

    input:checked + img {
        border: 3px solid var(--secondary);
    }
</style>
