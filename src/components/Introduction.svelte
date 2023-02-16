<script>
    import HelpLink from "./HelpLink.svelte";
    import Icon from "./Icon.svelte";
</script>

<div class="title">
    <h1>Marschzeit&shy;tabelle<br />leicht gemacht.</h1>
    <h2>Übertrage deine Route automatisch in eine Marschzeittabelle.</h2>
</div>
<div class="tutorial">
    <div class="steps">
        <h2>1. Planen <Icon name="draw" big /></h2>
        <p>Route einzeichnen und Wegpunkte benennen - das kennst du bereits.</p>
        <h2>2. Exportieren <Icon name="output" big /></h2>
        <p>In wenigen Klicks erledigt. <HelpLink topic="export" label="Wie geht das?" /></p>
        <h2>3. Hochladen <Icon name="upload_file" big /></h2>
        <p>Jetzt noch Geschwindigkeit, Abreisezeit, Kommentare und Pausen anpassen.</p>
    </div>
    <video autoplay controls loop muted>
        <source src="recording.webm" />
    </video>
</div>

<style>
    .title {
        text-align: center;
    }
    
    .title h1 {
        font-size: 4rem;
        font-weight: 900;
        margin-bottom: 1rem;
        background: linear-gradient(to bottom right, var(--accent-color), var(--darker-accent-color));
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
    }

    .title h2 {
        font-weight: normal;
        font-size: 1.5rem;
    }
    
    @media (max-width: 700px) {
        .title h1 {
            font-size: 2.5rem;
        }

        .title h2 {
            font-size: 1.2rem;
        }
    }

    .tutorial {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: stretch;
        gap: 1rem;
        margin: 2rem 1rem;
    }

    .steps {
        flex: 1 1 15rem;
    }

    .steps h2 {
        margin-bottom: 0;
    }

    .steps p {
        margin-top: 0;
    }

    video {
        flex: 0 1 25rem;
        width: 100%;
        height: fit-content;
        border-radius: 1rem;
        box-shadow: 1rem 1rem 2rem var(--shadow-color);
        border: 2px solid var(--shadow-color);
    }
</style>
