<script>
    import { fade } from "svelte/transition";
    import Editor from "./Editor.svelte";
    import Introduction from "./Introduction.svelte";
    import Import from "./Import.svelte";

    import Profile from "./Profile.svelte";
    import { testRoute } from "../modules/test";

    let route;
</script>

<svelte:head>
    <title>{route == null ? "" : `${route.title} - `}Marschzeittabelle</title>
</svelte:head>
<Profile route={testRoute} />
<!--
{#if route == null}
    <main>
        <Introduction />
        <Import bind:route />
    </main>
{:else}
    <header class="noprint">
        <a href=".">❮ startseite</a>
    </header>
    <main transition:fade>
        <Editor bind:route />
    </main>
{/if}
<footer>
    <span>marschzeittabelle.ch</span>
    <span class="noprint">
        | <a href="help" target="_blank">hilfe</a>
        | <a href="https://github.com/ckolin/marschzeittabelle" target="_blank">quellcode</a>
    </span>
</footer>-->

<style>
    footer {
        text-align: center;
        margin-top: 2rem;
    }
</style>
