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
    console.log(error);
    logEvent(`error-${error}`);
}
