<script>
    import Icon from "./Icon.svelte";
    import Info from "./Info.svelte";
    import Introduction from "./Introduction.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";
    import Upload from "./Upload.svelte";

    import { reverseRoute } from "./modules/route.js";

    let route;
    let speed = 4;

    function reverse() {
        reverseRoute(route);
        route = route;
    }

    function print() {
        window.print();
    }
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
        <div class="editor">
            <div class="general">
                <div class="info">
                    <h2>Route</h2>
                    <Info {route} {speed}/>
                </div>
                <div class="options noprint">
                    <h2>Optionen</h2>
                    <label for="speed">Geschwindigkeit in Lkm/h</label>
                    <input id="speed" type="number" min="0.5" step="0.5" bind:value={speed} />
                    <br />
                    <button class="secondary" on:click={reverse}><Icon name="swap_horiz" /> Richtung wechseln</button>
                    <br />
                    <br />
                    <button on:click={print}><Icon name="download" /> Herunterladen</button>
                </div>
            </div>
            <div class="table">
                <h2>Marschzeittabelle</h2>
                <Table {route} {speed} />
            </div>
            <div class="profile">
                <h2>Höhenprofil</h2>
                <Profile {route} />
            </div>
        </div>
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
    .general {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .options label, input {
        display: block;
    }

    @media not print {
        .table, .profile {
            overflow-x: auto;
        }
    }

    footer {
        text-align: center;
        margin-top: 2rem;
    }
</style>
