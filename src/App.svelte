<script>
    import Info from "./Info.svelte";
    import Map from "./Map.svelte";
    import Profile from "./Profile.svelte";
    import Table from "./Table.svelte";
    import Introduction from "./Introduction.svelte";
    import Upload from "./Upload.svelte";

    import { theme } from "./modules/theme.js";

    let route;
    let speed = 4;

    function reverse() {
        route.reverse();
        route = route;
    }

    function print() {
        window.print();
    }

    // Set theme styles
    for (let key of Object.keys(theme)) {
        const property = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        document.documentElement.style.setProperty(property, theme[key]);
    }
</script>

<header>
    <span>
        <a href="">startseite</a>
    </span>
    <span>
        <a href="#">über diese seite</a> |
        <a href="#">faq</a> |
        <a href="https://github.com/ckolin/marschzeittabelle">github</a>
    </span>
</header>
<main>
    {#if route}
        <div class="editor">
            <div class="general">
                <div class="info">
                    <h2>Route</h2>
                    <Info {route} />
                </div>
                <Map {route} />
            </div>
            <div class="options">
                <h2>Optionen</h2>
                <label for="speed">Geschwindigkeit in Lkm/h</label>
                <input id="speed" type="number" min="0.5" step="0.5" bind:value={speed} />
                <br />
                <button class="secondary" on:click={reverse}>Richtung wechseln</button>
                <br />
                <br />
                <button on:click={print}>Herunterladen</button>
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
    {:else}
        <Introduction />
        <Upload bind:route />
    {/if}
</main>
<footer>marschzeittabelle.ch</footer>

<style>
    header {
        display: flex;
        justify-content: space-between;
    }

    .general {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .info {
        white-space: nowrap;
    }

    .options label, input {
        display: block;
    }

    .general, .table, .profile {
        overflow-x: auto;
    }

    .options, .table, .profile {
        grid-column-end: span 2;
    }

    footer {
        margin-top: 1rem;
    }

    @media print {
        header, .options {
            display: none;
        }
    }
</style>
