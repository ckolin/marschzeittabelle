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
        .catch(handleConnectionError)
        .then((res) => handleResponse(res, "Das Höhenprofil konnten nicht geladen werden."))
        .then((data) => new Promise((resolve) => {
            // Check for empty response
            if (data.length === 0) {
                throw {
                    id: "empty-response",
                    message: "Für die Route sind keine Höhendaten verfügbar."
                };
            }

            let profile = data.map(p => ({
                point: { x: p.easting, y: p.northing },
                height: p.alts.COMB
            }));

            // Remove extra points not associated with a marker
            if (ensureInputPoints) {
                profile = profile.filter(p => line.some(l => vec.distance(p.point, l) < epsilon));
            }

            resolve(profile);
        }));
}

export function fetchMaps(line, mapScale) {
    const geometry = {
        paths: [line.map(p => [Math.round(p.x), Math.round(p.y)])]
    };
    return fetch(`${baseUrl}/all/MapServer/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `geometry=${JSON.stringify(geometry)}&geometryType=esriGeometryPolyline&layers=all:ch.swisstopo.pixelkarte-pk${mapScale}.metadata&tolerance=0&returnGeometry=false`
    })
        .catch(handleConnectionError)
        .then((res) => handleResponse(res, "Die Landeskarten konnten nicht geladen werden."))
        .then((data) => new Promise((resolve) => {
            const maps = data.results
                .map((r) => ({ id: r.attributes.tileid, name: r.attributes.lk_name }));
            resolve(maps);
        }));
}

function handleConnectionError() {
    throw {
        id: "connection-failed",
        message: "Die Verbindung zu den swisstopo-Servern ist fehlgeschlagen."
    };
}

async function handleResponse(response, message) {
    if (!response.ok) {
        throw {
            id: "response-not-ok",
            message
        };
    }
    
    try {
        return await response.json();
    } catch {
        throw {
            id: "invalid-json",
            message
        };
    }
}
