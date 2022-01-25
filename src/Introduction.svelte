<script>
    import HelpLink from "./HelpLink.svelte";
</script>

<div class="title">
<h1>Marschzeit&shy;tabelle<br />leicht gemacht.</h1>
<p class="subtitle">Wir übertragen deine Route automatisch in eine Marschzeittabelle, damit du dich auf die Wanderplanung konzentrieren kannst.</p>
</div>
<div class="tutorial">
    <div>
        <h2>1. Planen</h2>
        <p>Route einzeichnen und Wegpunkte benennen - das kennst du bereits.</p>
        <h2>2. Exportieren</h2>
        <p>In wenigen Klicks erledigt. <HelpLink topic="export" label="Wie geht das?" /></p>
        <h2>3. Hochladen</h2>
        <p>Jetzt noch Geschwindigkeit, Startzeit, Bemerkungen und Pausen hinzufügen.</p>
    </div>
    <img src="example.jpg" alt="Beispiel" />
</div>

<style>
    .title {
        text-align: center;
    }
    
    h1 {
        font-size: 4em;
        font-weight: 900;
        color: var(--darker-accent-color);
        margin-bottom: 1rem;
    }

    @media (max-width: 800px) {
        h1 {
            font-size: 3em;
        }
    }
    
    .subtitle {
        font-size: 1.4em;
    }

    .tutorial {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin: 2rem;
    }

    .tutorial div {
        flex: 1 1 15rem;
    }

    .tutorial img {
        width: 100%;
        flex: 0 1 20rem;
        border-radius: 1rem;
        box-shadow: 1rem 1rem 2rem rgba(0, 0, 0, 0.1);
    }

    h2 {
        margin-bottom: 0;
    }

    p {
        margin-top: 0;
    }
</style>