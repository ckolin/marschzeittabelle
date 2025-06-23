import * as vec from "./vec.js";
import simplify from "simplify-js";

const baseUrl = "https://api3.geo.admin.ch/rest/services";
const epsilon = 2;

export function fetchProfile(line, ensureInputPoints, resolution) {
    const coordinates = simplifyTo(line.map(({x, y}) => [x, y]), 2000);
    const geometry = {
        type: "LineString",
        coordinates,
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
    const path = simplifyTo(line.map(({x, y}) => [x, y]), 100);
    const geometry = {
        paths: [path]
    };
    const query = `geometry=${JSON.stringify(geometry)}&geometryType=esriGeometryPolyline&layers=all:ch.swisstopo.pixelkarte-pk${mapScale}.metadata&tolerance=0&returnGeometry=false`;
    return fetch(`${baseUrl}/all/MapServer/identify?${query}`)
        .catch(handleConnectionError)
        .then((res) => handleResponse(res, "Die Landeskarten konnten nicht geladen werden."))
        .then((data) => new Promise((resolve) => {
            const all = data.results
                .map((r) => ([r.attributes.tileid, r.attributes.lk_name]));
            const unique = [...new Map(all).entries()]
                .map(([id, label]) => ({ id, label }));
            resolve(unique);
        }));
}

function simplifyTo(line, max, tol = 1) {
    const simplified = simplify(
        line.map(([x, y]) => ({ x, y })),
        tol,
    ).map(({ x, y }) => [x, y]);
    if (simplified.length > max) {
        return simplifyTo(simplified, max, tol * 2);
    } else {
        return simplified;
    }
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
