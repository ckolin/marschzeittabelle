import { Swisstopo } from "./swisstopo.js";
import { Vec } from "./vec.js";
import { Route } from "./route.js";

export const epsilon = 10;

export function importFile(file) {
    return readFile(file)
        .then((content) => parseKml(content))
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

async function parseKml(kmlString) {
    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlString, "application/xml");
    if (kml.querySelector("parsererror")) {
        throw "Die Datei ist nicht in gültigem KML-Format.";
    }

    const lines = [];
    const markers = [];

    const placemarks = kml
        .querySelectorAll("Placemark");
    for (let placemark of placemarks) {
        // Find lines
        if (placemark.querySelector("LineString")) {
            const points = placemark
                .querySelector("LineString coordinates")
                .innerHTML
                .trim()
                .split(" ")
                .map(s => parseCoordinates(s));
            lines.push(points);
        }
        // Find markers
        if (placemark.querySelector("Point")) {
            const name = placemark
                .querySelector("name")
                .innerHTML
                .trim();
            const point = parseCoordinates(
                placemark.querySelector("Point coordinates").innerHTML);
            markers.push({ name, point });
        }
    }

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
    for (let marker of markers) {
        let closest = 0;
        let minDistance = Infinity;
        for (let i = 0; i < line.length; i++) {
            const distance = Vec.distance(marker.point, line[i]);
            if (distance < minDistance) {
                closest = i;
                minDistance = distance;
            }
        }

        // Check if marker is on line
        if (minDistance > epsilon) {
            throw `Der Wegpunkt "${marker.name}" ist nicht auf der Linie, bzw. nicht in der Nähe eines Eckpunkts der Linie.`;   
        }

        marker.index = closest;
        delete marker.point;
    }

    // Bring markers in right order
    markers.sort((a, b) => a.index - b.index);

    return new Route(line, markers);
}

// Parses and converts coordinates from WGS84 to LV03
function parseCoordinates(str) {
    const wgs = str.split(",").map(s => Number(s));
    const ch = Swisstopo.WGStoCH(wgs[1], wgs[0]);
    return { x: ch[0], y: ch[1] };
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
