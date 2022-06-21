export function logEvent(event) {
    if (!window.goatcounter?.count) {
        return;
    }

    window.goatcounter.count({
        path: event,
        title: "",
        event: true
    });
}

export function logError(error) {
    if (error == null) {
        document.body.innerHTML = `
        <style>
            img {
                display: block;
                margin-top: 5rem;
                margin-left: auto;
                width: 40%;
            }

            body {
                font-size: 20px;
            }
        </style>
        <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.politifact.com%2Fpolitifact%2Fphotos%2FHomer_Simpson.jpg&f=1&nofb=1">
        <h2>D'oh! Da isch öppis schiefgloffe 😕</h2>
        <p>Scho sit längerem versuech ich, dem Fehler wos bi dir grad geh het uf d Spur z cho.</p>
        <p>Ich wär dir unglaublich dankbar, wenn du churz chönntisch schildere was du klickt hesch sowie was du hesch welle mache und mir es E-Mail a mzt (at) colins.computer würdsch schicke.</p>
        <p>Falls möglech wärs super, wenn du au no d Route chasch mitschicke.<p>
        <p>Danke vilmal und no en schöne Tag! 💚</p>`;
    }
    logEvent(`error-${error}`);
}
