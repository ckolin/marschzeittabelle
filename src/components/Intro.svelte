<script lang="ts">
    import Button from "./Button.svelte";
    import ColorBox from "./ColorBox.svelte";
    import Icon from "./Icon.svelte";
    import { BLUE, GREEN, PINK } from "../lib/theme";
</script>

<main>
    <div class="title">
        <h1>Marschzeittabelle leicht gemacht</h1>
        <p>
            Schluss mit Schnur und Kopfrechnen! Übertrage deine Route
            automatisch in eine Marschzeittabelle.
        </p>
    </div>
    <div class="outer">
        <ColorBox --acc={PINK}>
            <div class="icon"><Icon name="gesture" --size="96px" /></div>
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
            <ColorBox --acc={GREEN}>
                <div class="icon">
                    <Icon name="add_location_alt" --size="96px" />
                </div>
                <span>Schritt 2</span>
                <h3>Wegpunkte setzen</h3>
                <p>
                    Hohe und tiefe Punkte, sowie Schlüsselstellen und Rastplätze
                    kennzeichnen.
                </p>
            </ColorBox>
            <ColorBox --acc={BLUE}>
                <div class="icon">
                    <Icon name="description" --size="96px" />
                </div>
                <span>Schritt 3</span>
                <h3>Marschzeittabelle bearbeiten</h3>
                <p>
                    Laufgeschwindigkeit und Abreisezeit anpassen. Pausen,
                    Kommentare und Autor*in hinzufügen. Fertig!
                </p>
            </ColorBox>
        </div>
    </div>
    <p>
        Marschzeittabelle.ch | <a href="">Hilfe</a> | <a href="">Quellcode</a>
    </p>
</main>

<style>
    main {
        color: var(--fg);
        background: var(--bg);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 3rem;
        margin: 5rem calc(50% - 20rem);
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
        align-items: start;
    }

    .inner {
        flex-direction: column;
    }

    .icon {
        position: absolute;
        top: 0.5rem;
        right: 0.3rem;
        color: var(--acc);
        opacity: 0.3;
    }

    span {
        color: var(--acc);
        font-weight: bold;
    }

    .or {
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
</style>
