<script>
    import Editor from "./Editor.svelte";
    import Introduction from "./Introduction.svelte";
    import Upload from "./Upload.svelte";

    import { fade } from "svelte/transition";

    let route;
</script>

{#if route == null}
    <main>
        <Introduction />
        <Upload bind:route />
    </main>
{:else}
    <header class="noprint">
        <a href=".">❮ startseite</a>
    </header>
    <main transition:fade>
        <Editor {route} />
    </main>
{/if}
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
