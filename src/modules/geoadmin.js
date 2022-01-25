import { Vec } from "./vec.js";

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
                throw "Das Höhenprofil konnte nicht geladen werden.";
            }
        })
        .then((data) => new Promise((resolve) => {
            let profile = data.map(p => ({
                point: { x: p.easting, y: p.northing },
                height: p.alts.COMB
            }));

            // Remove extra points not associated with a marker
            if (ensureInputPoints) {
                profile = profile.filter(p => line.some(l => Vec.distance(p.point, l) < epsilon));
            }

            resolve(profile);
        }))
        .catch(() => { throw "Die Verbindung zu den swisstopo-Servern ist fehlgeschlagen." });
}
