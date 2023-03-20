import { formatCoordinates, formatTime } from "./formatting.js";

export function calculateData(route) {
    const res = [];

    // Calculate information and totals
    for (let i = 0; i < route.markers.length; i++) {
        res[i] = {
            index: i,
            name: route.markers[i].name,
            comment: route.markers[i].comment,
            coordinates: route.markers[i].point,
            height: route.markerProfile[i].height,
            distance: route.distanceSum[route.markers[i].index] / 1000,
            effort: route.effortSum[i],
            duration: route.effortSum[i] / route.speed,
            time: route.effortSum[i] / route.speed + route.breakSum[i] / 60 + route.start,
            break: route.markers[i].break
        };
    }

    // Calculate differences (alternate rows)
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
        "Wegpunkt",
        "Koordinaten",
        "Kommentar",
        "Höhe / m",
        "Differenz Höhe / m",
        "Total Distanz / km",
        "Differenz Distanz / km",
        "Total Aufwand / Lkm",
        "Differenz Aufwand / Lkm",
        "Total Gehzeit / h",
        "Differenz Gehzeit / h",
        "Uhrzeit / hh:mm",
        "Pause / min"
    ];

    const rows = data.map((row) => [
        row.index + 1,
        row.name,
        formatCoordinates(row.coordinates),
        row.comment ?? "",
        row.height,
        row.diff?.height ?? 0,
        row.distance,
        row.diff?.distance ?? 0,
        row.effort,
        row.diff?.effort ?? 0,
        row.duration,
        row.diff?.duration ?? 0,
        formatTime(row.time),
        row.break
    ]);

    return [header, ...rows]
        .map((fields) => fields.map((f) => `"${f}"`).join(","))
        .join("\n");
}
