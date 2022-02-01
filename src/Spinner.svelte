<div></div>

<style>
    div {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 0.2rem solid var(--lighter-accent-color);
        border-bottom-color: var(--accent-color);
        border-radius: 50%;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
