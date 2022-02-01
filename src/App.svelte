<script>
    import Editor from "./Editor.svelte";
    import Introduction from "./Introduction.svelte";
    import Upload from "./Upload.svelte";

    let route;
</script>

{#if route != null}
    <header class="noprint">
        <a href=".">❮ startseite</a>
    </header>
{/if}
<main>
    {#if route == null}
        <Introduction />
        <Upload bind:route />
    {:else}
        <Editor {route} />
    {/if}
</main>
<footer>
    <span>marschzeittabelle.ch</span>
    <span class="noprint">
        | <a href="help">hilfe</a>
        | <a href="https://github.com/ckolin/marschzeittabelle">github</a>
    </span>
</footer>

<style>
    footer {
        text-align: center;
        margin-top: 2rem;
    }
</style>
