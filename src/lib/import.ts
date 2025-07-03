import type { Line2, Point2 } from "./points";
import { gpx, kml } from "@tmcw/togeojson";
import cleanCoords from "@turf/clean-coords";
import distance from "@turf/distance";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import polygonToLine from "@turf/polygon-to-line";
import type { LineString, Polygon, Position } from "geojson";
import { WGStoLV95 } from "swiss-projection";

const EPSILON = 10;

export async function importFile(file: File): Promise<[Line2, Waypoint[]]> {
    const text = await file.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    let geojson = file.name.endsWith(".kml")
        ? (kml(xml, { skipNullGeometry: true }) as FeatureCollection)
        : gpx(xml);
    console.log(geojson);
    const lineString = extractSingleLineString(geojson);
    const waypoints = extractWaypoints(geojson, lineString);
    const line: Line2 = lineString.coordinates.map(([x, y]) =>
        WGStoLV95([x, y]),
    );
    return [line, waypoints];
}

function extractSingleLineString(geojson: FeatureCollection): LineString {
    const lines: LineString[] = [];
    for (const feature of geojson.features) {
        if (feature.geometry.type === "LineString") {
            lines.push(feature.geometry);
        } else if (feature.geometry.type === "Polygon") {
            const line = polygonToLine(feature.geometry as Polygon) as Feature;
            lines.push(line.geometry as LineString);
        }
    }
    while (lines.length > 1) {
        const conn = findConnectedLines(lines);
        if (conn == undefined) {
            // TODO: Throw exception
            throw null;
        }
        if (conn.revFst) {
            lines[conn.fst].coordinates.reverse();
        }
        if (conn.revSnd) {
            lines[conn.snd].coordinates.reverse();
        }
        // Append points of second line to first
        lines[conn.fst].coordinates.push(...lines[conn.snd].coordinates);
        // Remove second line
        lines.splice(conn.snd, 1);
    }
    return cleanCoords(lines[0]);
}

function findConnectedLines(lines: LineString[]):
    | {
          fst: number;
          snd: number;
          revFst: boolean;
          revSnd: boolean;
      }
    | undefined {
    const equal = (a: Position, b: Position) =>
        distance(a, b, { units: "meters" }) < EPSILON;
    const first = (l: LineString) => l.coordinates[0];
    const last = (l: LineString) => l.coordinates[l.coordinates.length - 1];
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (equal(last(lines[i]), first(lines[j]))) {
                // Matching directions, matching order: -> ->
                return { fst: i, snd: j, revFst: false, revSnd: false };
            } else if (equal(first(lines[i]), last(lines[j]))) {
                // Matching directions, reversed order: <- <-
                return { fst: i, snd: j, revFst: true, revSnd: true };
            } else if (equal(first(lines[i]), first(lines[j]))) {
                // Opposing directions, matching order: <- ->
                return { fst: i, snd: j, revFst: true, revSnd: false };
            } else if (equal(last(lines[i]), last(lines[j]))) {
                // Opposing directions, reversed order: -> <-
                return { fst: i, snd: j, revFst: false, revSnd: true };
            }
        }
    }
    return undefined;
}

interface Waypoint {
    name: string;
    comment: string;
    point: Point2;
}

function extractWaypoints(
    geojson: FeatureCollection,
    line: LineString,
): Waypoint[] {
    const waypoints: Waypoint[] = [];
    for (const feature of geojson.features) {
        if (
            feature.geometry.type !== "Point" ||
            feature.properties?.name == undefined
        ) {
            continue;
        }
        const nearest = nearestPointOnLine(line, feature.geometry, {
            units: "meters",
        });
        const [x, y] = nearest.geometry.coordinates;
        if (nearest.properties.dist < EPSILON) {
            waypoints.push({
                name: feature.properties.name,
                comment: feature.properties.description ?? "",
                point: WGStoLV95([x, y]),
            });
        }
    }
    return waypoints;
}
