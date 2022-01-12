import { Vec } from "./vec.js";
import { epsilon } from "./import.js";

const baseUrl = "https://api3.geo.admin.ch/rest/services";

export function fetchProfile(line, ensureInputPoints, resolution) {
    const geometry = {
        type: "LineString",
        coordinates: line.map(p => [Math.round(p.x), Math.round(p.y)])
    };
    return fetch(`${baseUrl}/profile.json?sr=21781&distinct_points=${ensureInputPoints}&nb_points=${resolution}&geom=${JSON.stringify(geometry)}`)
        .then(res => res.json())
        .then(data => new Promise(resolve => {
            let profile = data.map(p => {
                return {
                    point: { x: p.easting, y: p.northing },
                    height: p.alts.COMB
                };
            });

            // Remove extra points not associated with a marker
            if (ensureInputPoints) {
                profile = profile.filter(p => line.some(l => Vec.distance(p.point, l) < epsilon));
            }

            resolve(profile);
        }));
}