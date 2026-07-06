<a class="container" href="https://eda.enterprises">
    <div>
        <p>
            Du brauchst noch ein cooles T-Shirt mit integrierter
            Zeltbau-Anleitung für deine nächste Wanderung?
        </p>
        <p>
            Dann schau doch mal bei
            <a href="https://eda.enterprises">Eda Enterprises</a> vorbei.
        </p>
    </div>
    <img src="ad01.jpg" alt="Foto von einem T-Shirt" />
    <img src="ad02.jpg" alt="Foto von einem T-Shirt" />
</a>

<style>
    .container {
        color: inherit;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1rem;
        border-radius: 1rem;
        background: linear-gradient(120deg, #0801, #0803);
        box-shadow: 0 0 0.1rem var(--shadow-color);
    }

    .container div {
        font-size: 1.1em;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    img {
        height: 15rem;
        border-radius: 1rem;
    }

    @media (max-width: 600px) {
        .container div {
            padding: 0;
        }

        img {
            display: none;
        }
    }
</style>
