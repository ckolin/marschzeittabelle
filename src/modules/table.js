export function calculateData(route, speed) {
    const res = [];
    for (let i = 0; i < route.markers.length; i++) {
        res[i] = {
            index: i + 1,
            name: route.markers[i].name,
            comment: route.markers[i].comment,
            height: route.markerProfile[i].height,
            distance: route.distanceSum[route.markers[i].index] / 1000,
            effort: route.effortSum[i],
            duration: route.effortSum[i] / speed
        };
    }

    for (let i = 1; i < route.markers.length; i++) {
        res[i - 1].diff = {
            height: res[i].height - res[i - 1].height,
            distance: res[i].distance - res[i - 1].distance,
            effort: route.effort[i],
            duration: res[i].duration - res[i - 1].duration
        };
    }

    return res;
}

export function getCsv(data) {
    const header = [
        "Nr.",
        "Name",
        "Höhe / m",
        "Unterschied Höhe / m",
        "Total Distanz / km",
        "Unterschied Distanz / km",
        "Total Aufwand / Lkm",
        "Unterschied Aufwand / Lkm",
        "Total Dauer / h",
        "Unterschied Dauer / h",
        "Uhrzeit / h",
    ];

    const rows = data.map((row) => [
        row.index,
        row.name,
        row.height,
        row.diff?.height ?? 0,
        row.distance,
        row.diff?.distance ?? 0,
        row.effort,
        row.diff?.effort ?? 0,
        row.duration,
        row.diff?.duration ?? 0,
        row.duration,
    ]);

    return [header, ...rows]
        .map((fields) => fields.map((f) => `"${f}"`).join(","))
        .join("\n");
}