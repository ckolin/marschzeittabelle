<script lang="ts">
    import Button from "./Button.svelte";
    import ColorBox from "./ColorBox.svelte";
    import Icon from "./Icon.svelte";
    import { BLUE, GREEN, PINK, YELLOW } from "../lib/theme";
    import isolines from "../assets/isolines.svg";

    let dragging = $state(false);
</script>

<svelte:window
    ondragenter={(e) => (dragging = e.dataTransfer?.items[0].kind === "file")}
/>
<div
    class="drop"
    style:visibility={dragging ? "visible" : "hidden"}
    role="region"
    ondragleave={() => (dragging = false)}
>
    <Icon name="upload_file" huge />
    <p>Datei hier ablegen (GPX oder KML)</p>
</div>
<div class="background" style:background-image="url({isolines})"></div>
<main ondragleave={(e) => e.stopPropagation()}>
    <div class="title">
        <h1>Marschzeittabelle leicht gemacht</h1>
        <p>
            Schluss mit Schnur und Kopfrechnen! Plane deine Route und übertrage
            sie automatisch in eine Marschzeittabelle.
        </p>
    </div>
    <div class="outer">
        <ColorBox icon="gesture" --acc={PINK}>
            <span>Schritt 1</span>
            <h3>Route zeichnen</h3>
            <p>
                Mit automatischer Wegführung entlang von Wanderwegen und
                Strassen.
            </p>
            <Button><Icon name="map" /> Karte öffnen</Button>
            <div class="or">
                <hr />
                <span>oder</span>
                <hr />
            </div>
            <h3>Route importieren</h3>
            <p>
                Untersützt sind GPX- und KML-Dateien, z.B. aus der swisstopo-App
                oder von Outdooractive.com.
            </p>
            <Button><Icon name="upload" /> Datei hochladen</Button>
        </ColorBox>
        <div class="inner">
            <ColorBox icon="add_location_alt" --acc={GREEN}>
                <span>Schritt 2</span>
                <h3>Wegpunkte setzen</h3>
                <p>
                    Hohe und tiefe Punkte, sowie Schlüsselstellen und Rastplätze
                    kennzeichnen.
                </p>
            </ColorBox>
            <ColorBox icon="description" --acc={BLUE}>
                <span>Schritt 3</span>
                <h3>Marschzeittabelle bearbeiten</h3>
                <p>
                    Laufgeschwindigkeit und Abreisezeit anpassen. Pausen,
                    Kommentare und Autor*in hinzufügen. Fertig!
                </p>
            </ColorBox>
        </div>
    </div>
    <ColorBox icon="history" --acc={YELLOW}>
        <span>Zuletzt bearbeitet</span>
        <h3>Aasdlfkj</h3>
        <p><Icon name="schedule" /> vor 3 Stunden</p>
        <Button><Icon name="file_open" /> Öffnen</Button>
    </ColorBox>
    <p>
        Marschzeittabelle.ch | <a href="">Hilfe</a> |
        <a href="https://github.com/ckolin/marschzeittabelle" target="_blank">
            Quellcode
        </a>
    </p>
</main>

<style>
    .drop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: var(--fg);
        background: color-mix(in srgb, var(--bg), transparent 70%);
        backdrop-filter: blur(16px);
        z-index: 10;
    }

    .drop :global(*) {
        pointer-events: none;
    }

    .drop p {
        font-size: 1.5em;
    }

    .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        pointer-events: none;
        opacity: 0.5;
        z-index: -1;
    }

    main {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 3rem;
        margin: 5rem calc(50% - 20rem);
    }

    .title {
        text-shadow: 0 0 2px var(--bg);
    }

    .title p {
        font-size: 1.2em;
        margin-top: 0.5rem;
    }

    .outer,
    .inner {
        display: flex;
        gap: 1.5rem;
    }

    .outer {
        text-align: initial;
        flex-direction: row;
    }

    .inner {
        flex-direction: column;
    }

    span {
        color: var(--acc);
        font-weight: bold;
    }

    .or {
        flex-grow: 1;
        align-self: stretch;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .or hr {
        flex-grow: 1;
        border: 1px solid var(--acc);
        opacity: 0.3;
        margin: 0.5rem 0;
    }

    @media (max-width: 45rem) {
        main {
            margin: 1rem;
        }

        .outer {
            flex-direction: column;
        }
    }
</style>
