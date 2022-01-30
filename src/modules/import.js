import { Swisstopo } from "./swisstopo.js";
import { Vec } from "./vec.js";
import { Route } from "./route.js";

const epsilon = 10;

export function importFile(file) {
    return readFile(file)
        .then((content) => parseXml(content))
        .then((xml) => {
            if (file.name.endsWith(".kml")) {
                return readKml(xml);
            } else if (file.name.endsWith(".gpx")) {
                return readGpx(xml);
            }
        })
        .then(({ lines, markers }) => buildRoute(lines, markers))
        .then((route) => route.loadProfiles());
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result));
        reader.addEventListener("error", () => reject("Die Datei konnte nicht gelesen werden."));
        reader.readAsText(file);
    });
}

async function parseXml(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "application/xml");
    if (xml.querySelector("parsererror")) {
        throw "Die Datei ist nicht in gültigem XML-Format.";
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
        // Find lines
        if (placemark.querySelector("LineString")) {
            const points = placemark
                .querySelector("LineString coordinates")
                .innerHTML
                .trim()
                .split(" ")
                .map(s => coords(s));
            lines.push(points);
        }

        // Find markers
        if (placemark.querySelector("Point")) {
            const name = placemark
                .querySelector("name")
                .innerHTML
                .trim();
            const point = coords(placemark
                .querySelector("Point coordinates")
                .innerHTML);
            markers.push({ name, point });
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

    // Find markers stored as track points
    const nameElements = xml.querySelectorAll("trkpt > name");
    for (let nameElement of nameElements) {
        const name = nameElement
            .innerHTML
            .trim();
        const point = coords(nameElement.parentElement);
        markers.push({ name, point });
    }

    // Find markers stored as waypoints
    if (markers.length === 0) {
        const waypoints = xml.querySelectorAll("wpt");
        for (let waypoint of waypoints) {
            const name = waypoint
                .querySelector("name")
                .innerHTML
                .trim();
            const point = coords(waypoint);
            markers.push({ name, point });
        }
    }

    return { lines, markers };
}

// Converts coordinates from WGS84 to LV03
function convertCoordinates(lat, long) {
    const [x, y] = Swisstopo.WGStoCH(Number(lat), Number(long));
    return { x, y };
}

async function buildRoute(lines, markers) {
    // Check if route contains line and markers
    if (lines.length === 0) {
        throw "Die Route enthält keine Linie."
    }
    if (markers.length === 0) {
        throw "Die Route enthält keine Wegpunkte."
    }

    // Merge disjointed lines
    while (lines.length > 1) {
        const connected = findConnectedLines(lines, epsilon);
        if (connected == null) {
            throw "Die Route enthält Linien, die nicht miteinander verbunden sind.";
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
            .filter(m => lastPoint == null || !Vec.equal(m.point, lastPoint))
            .filter(m => Vec.distance(m.point, line[i]) < epsilon);
        if (matches.length === 0) {
            continue; // No markers here
        }

        // Detect multiple markers in the same place
        const duplicates = matches
            .filter(m => m.index == null);
        if (matches.length > 1) {
            const list = duplicates
                .map(m => `"${m.name}"`)
                .join(", ");
            throw `Mehrere Wegpunkte am selben Ort: ${list}.`;
        }

        // Assign index
        const marker = matches[0];
        if (marker.index == null) {
            // Marker has not been used
            marker.index = i;
        } else {
            // Line has looped back to this marker
            // Create duplicate of used marker
            markers.push({
                name: marker.name,
                point: marker.point,
                index: i
            });
        }

        lastPoint = marker.point;
    }

    // Check if all markers have been assigned
    const unassigned = markers
        .filter(m => m.index == null);
    if (unassigned.length > 0) {
        const list = unassigned
            .map(m => `"${m.name}"`)
            .join(", ");
        throw `Wegpunkte nicht in der Nähe von Eckpunkten der Linie: ${list}.`;
    }

    // Bring markers in right order
    markers.sort((a, b) => a.index - b.index);

    return new Route(line, markers);
}

function findConnectedLines(lines) {
    const areEqual = (a, b) => Vec.distance(a, b) < epsilon;

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
