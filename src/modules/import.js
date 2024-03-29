import { formatCoordinates } from "./formatting.js";
import { loadData } from "./route.js";
import { Swisstopo } from "./swisstopo.js";
import * as vec from "./vec.js";

const epsilon = 10;

export function importFile(file) {
    return readFile(file)
        .then(
            (content) => parseXml(content),
            () => {
                // Promise was rejected
                throw {
                    id: "file-error",
                    message: "Die Datei konnte nicht gelesen werden."
                };
            })
        .then((xml) => {
            if (file.name.endsWith(".kml")) {
                return readKml(xml);
            } else if (file.name.endsWith(".gpx")) {
                return readGpx(xml);
            }
        })
        .then(({ lines, markers }) => buildRoute(lines, markers, file.name))
        .then((route) => loadData(route));
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result));
        reader.addEventListener("error", reject);
        reader.readAsText(file);
    });
}

async function parseXml(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "application/xml");
    if (xml.querySelector("parsererror")) {
        throw {
            id: "invalid-xml",
            message: "Die Datei ist nicht in gültigem XML-Format."
        };
    }
    return xml;
}

async function readKml(xml) {
    const lines = [];
    const markers = [];

    const coords = (str) => {
        const [long, lat] = str.split(",");
        return convertCoordinates(lat, long);
    };

    const placemarks = xml.querySelectorAll("Placemark");
    for (let placemark of placemarks) {
        // Find lines and polygons
        const lineCoordinates = placemark
            .querySelector(":is(LineString, LinearRing) coordinates");
        if (lineCoordinates) {
            const points = lineCoordinates
                .innerHTML
                .trim()
                .split(" ")
                .map(s => coords(s));
            lines.push(points);
        }

        // Find named markers
        const pointCoordinates = placemark
            .querySelector("Point coordinates");
        if (pointCoordinates) {
            const name = placemark
                .querySelector("name")
                ?.innerHTML
                ?.trim();
            const comment = placemark
                .querySelector("description")
                ?.innerHTML
                ?.trim();
            const point = coords(pointCoordinates.innerHTML);
            if (name != null) {
                markers.push({ name, comment, point });
            }
        }
    }

    return { lines, markers };
}

async function readGpx(xml) {
    const lines = [];
    const markers = [];

    const coords = (p) => convertCoordinates(
        p.getAttribute("lat"), p.getAttribute("lon"));

    // Find lines
    const segments = xml.querySelectorAll("trkseg");
    for (let segment of segments) {
        const points = Array.from(segment.querySelectorAll("trkpt"))
            .map(p => coords(p));
        lines.push(points);
    }

    // Find named markers stored as track points
    // Used by outdooractive.com
    const trackpoints = xml.querySelectorAll("trkpt");
    for (let trackpoint of trackpoints) {
        const name = trackpoint
            .querySelector("name")
            ?.innerHTML
            ?.trim();
        const comment = trackpoint
            .querySelector("desc")
            ?.innerHTML
            ?.trim();
        const point = coords(trackpoint);
        if (name != null) {
            markers.push({ name, comment, point });
        }
    }

    // Find named markers stored as waypoints
    // Used by swisstopo app
    if (markers.length === 0) {
        const waypoints = xml.querySelectorAll("wpt");
        for (let waypoint of waypoints) {
            const name = waypoint
                .querySelector("name")
                ?.innerHTML
                ?.trim();
            const point = coords(waypoint);
            if (name != null) {
                markers.push({ name, point });
            }
        }
    }

    return { lines, markers };
}

// Converts coordinates from WGS84 to LV03
function convertCoordinates(lat, long) {
    const [x, y] = Swisstopo.WGStoCH(Number(lat), Number(long));
    return { x, y };
}

async function buildRoute(lines, markers, fileName) {
    // Check if route contains line and markers
    if (lines.length === 0) {
        throw {
            id: "no-line",
            message: "Die Route enthält keine Linie."
        };
    }
    if (markers.length < 2) {
        throw {
            id: "no-markers",
            message: "Die Route enthält weniger als zwei Wegpunkte."
        };
    }

    // Merge disjointed lines
    while (lines.length > 1) {
        const connected = findConnectedLines(lines, epsilon);
        if (connected == null) {
            throw {
                id: "disjoint-lines",
                message: "Die Route enthält Linien, die nicht miteinander verbunden sind."
            };
        }

        if (connected.reverseFirst) {
            lines[connected.i].reverse();
        }
        if (connected.reverseSecond) {
            lines[connected.j].reverse();
        }
        // Append points of second line
        lines[connected.i].push(...lines[connected.j]);
        // Remove second line
        lines.splice(connected.j, 1);
    }
    const line = lines[0];

    // Assign markers to points on line
    let lastPoint = null;
    for (let i = 0; i < line.length; i++) {
        // Find matching markers while not using markers twice in a row
        const matches = markers
            .filter(m => lastPoint == null || !vec.equal(m.point, lastPoint))
            .filter(m => vec.distance(m.point, line[i]) < epsilon);
        if (matches.length === 0) {
            continue; // No markers here
        }

        const marker = matches[0];

        // Remove any duplicates
        const duplicates = matches
            .filter(m => m.index == null && m !== marker);
        markers = markers
            .filter(m => !duplicates.includes(m));

        // Assign index
        if (marker.index == null) {
            // Marker has not been used
            marker.index = i;
        } else {
            // Line has looped back to this marker
            // Create duplicate of used marker
            const clone = Object.assign({}, marker);
            clone.index = i;
            markers.push(clone);
        }

        lastPoint = marker.point;
    }

    // Check if all markers have been assigned
    const unassigned = markers
        .filter(m => m.index == null);
    if (unassigned.length > 0) {
        const list = unassigned
            .map(m => m.name ? `"${m.name}"` : formatCoordinates(m.point))
            .join(", ");
        throw {
            id: "marker-not-on-line",
            message: `Wegpunkte nicht in der Nähe von Eckpunkten der Linie: ${list}.`
        };
    }

    // Bring markers in right order
    markers.sort((a, b) => a.index - b.index);

    // Initialize break duration
    for (let marker of markers) {
        marker.break = 0;
    }

    // Remove file extension from title
    const title = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

    return {
        line,
        mapScale: 25,
        markers,
        speed: 4,
        start: 0,
        title
    };
}

function findConnectedLines(lines) {
    const areEqual = (a, b) => vec.distance(a, b) < epsilon;

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (areEqual(lines[i][lines[i].length - 1], lines[j][0])) {
                // Matching directions, matching order: -> ->
                return { i, j, reverseFirst: false, reverseSecond: false };
            } else if (areEqual(lines[i][0], lines[j][lines[j].length - 1])) {
                // Matching directions, reversed order: <- <-
                return { i, j, reverseFirst: true, reverseSecond: true };
            } else if (areEqual(lines[i][0], lines[j][0])) {
                // Opposing directions, matching order: <- ->
                return { i, j, reverseFirst: true, reverseSecond: false };
            } else if (areEqual(lines[i][lines[i].length - 1], lines[j][lines[j].length - 1])) {
                // Opposing directions, reversed order: -> <-
                return { i, j, reverseFirst: false, reverseSecond: true };
            }
        }
    }

    // No connected lines found
    return null;
}
