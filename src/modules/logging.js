export function logEvent(name) {
    if (!window.goatcounter?.count) {
        return;
    }

    window.goatcounter.count({
        path: name,
        event: true
    });
}
