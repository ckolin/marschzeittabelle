const key = "route-v001"; // Versioned key to prevent import of outdated model

export function saveRoute(route) {
    const value = {
        line: route.line,
        mapScale: route.mapScale,
        markers: route.markers,
        speed: route.speed,
        start: route.start,
        title: route.title,
        timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(value));
}

export function loadRoute() {
    return JSON.parse(localStorage.getItem(key));
}
