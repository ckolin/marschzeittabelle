import * as vec from "./vec.js";

const baseUrl = "https://api3.geo.admin.ch/rest/services";
const epsilon = 2;

export function fetchProfile(line, ensureInputPoints, resolution) {
    const geometry = {
        type: "LineString",
        coordinates: line.map(p => [Math.round(p.x), Math.round(p.y)])
    };
    return fetch(`${baseUrl}/profile.json`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `sr=21781&distinct_points=${ensureInputPoints}&nb_points=${resolution}&geom=${JSON.stringify(geometry)}`
    })
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw {
                    id: "response-not-ok",
                    message: "Das Höhenprofil konnte nicht geladen werden."
                };
            }
        })
        .then((data) => new Promise((resolve) => {
            let profile = data.map(p => ({
                point: { x: p.easting, y: p.northing },
                height: p.alts.COMB
            }));

            // Remove extra points not associated with a marker
            if (ensureInputPoints) {
                profile = profile.filter(p => line.some(l => vec.distance(p.point, l) < epsilon));
            }

            resolve(profile);
        }))
        .catch(() => {
            throw {
                id: "connection-failed",
                message: "Die Verbindung zu den swisstopo-Servern ist fehlgeschlagen."
            };
        });
}

export function fetchMaps(line) {
    const geometry = {
        paths: [line.map(p => [Math.round(p.x), Math.round(p.y)])]
    };
    return fetch(`${baseUrl}/all/MapServer/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `geometry=${JSON.stringify(geometry)}&geometryType=esriGeometryPolyline&layers=all:ch.swisstopo.pixelkarte-pk25.metadata&tolerance=0&returnGeometry=false`
    })
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw {
                    id: "response-not-ok",
                    message: "Die Landeskarten konnten nicht geladen werden."
                }
            }
        })
        .then((data) => new Promise((resolve) => {
            const maps = data.results
                .map((r) => ({ id: r.id, label: r.attributes.lk_name }));
            resolve(maps);
        }))
        .catch(() => {
            throw {
                id: "connection-failed",
                message: "Die Verbindung zu den swisstopo-Servern ist fehlgeschlagen."
            };
        });
}