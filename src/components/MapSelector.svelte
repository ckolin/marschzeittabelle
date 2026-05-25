<script module lang="ts">
    const baseMaps = [
        { id: "pixelkarte", icon: pixelkarteIcon, label: "Pixelkarte" },
        { id: "base", icon: baseIcon, label: "Base Map" },
        { id: "imagerybase", icon: imageryBaseIcon, label: "Imagery Base Map" },
    ] as const;

    export type BaseMap = (typeof baseMaps)[number]["id"];
</script>

<script lang="ts">
    import baseIcon from "../assets/base.jpg";
    import imageryBaseIcon from "../assets/imagerybase.jpg";
    import pixelkarteIcon from "../assets/pixelkarte.jpg";

    let {
        baseMap = $bindable(),
        onchange,
    }: {
        baseMap: BaseMap;
        onchange: () => void;
    } = $props();
</script>

<div>
    {#each baseMaps as { id, icon, label } (id)}
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
        --radius: 0;
        display: block;
        width: 4rem;
        cursor: pointer;
    }

    label:first-child img {
        border-radius: var(--radius) 0 0 var(--radius);
    }

    label:last-child img {
        border-radius: 0 var(--radius) var(--radius) 0;
    }

    input:checked + img {
        outline: 3px solid var(--acc);
        outline-offset: -3px;
    }
</style>
