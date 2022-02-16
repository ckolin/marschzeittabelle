<script>
    import Dialog from "./Dialog.svelte";
    
    export let show;
    export let scale;
</script>

<Dialog title="Kartenmassstab wählen" bind:show on:close>
    <label for="scale">Massstab</label>
    <select id="scale" required bind:value={scale}>
        <option value={25}>1:25'000</option>
        <option value={50}>1:50'000</option>
        <option value={100}>1:100'000</option>
    </select>
    <br />
</Dialog>
