export function logEvent(event) {
    if (!window.goatcounter?.count) {
        return;
    }

    window.goatcounter.count({
        path: event,
        event: true
    });
}

export function logError(error) {
    logEvent(`error-${error}`);
}
