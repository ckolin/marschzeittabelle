import type { LineString } from "geojson";
import type { Line2, Line3 } from "./points";

const BASE_URL = import.meta.env.VITE_GEOADMIN_URL;

export interface SearchResult {
    label: string;
    lngLat: [number, number];
}

export async function search(query: string): Promise<SearchResult[]> {
    if (query.length === 0) {
        return [];
    }
    const res = await fetch(
        `${BASE_URL}/api/SearchServer?searchText=${query}&type=locations&lang=de&limit=5`,
    );
    const json = await res.json();
    return json.results
        .map((r: any) => r.attrs)
        .map(
            (a: any) =>
                ({
                    label: a.label,
                    lngLat: [a.lon, a.lat],
                }) as SearchResult,
        )
        .filter((r: SearchResult) => r.label.length < 255);
}

export async function fetchProfile(
    line: Line2,
    resolution: number = 200,
): Promise<Line3> {
    if (line.length === 0) {
        return [];
    }
    const geom: LineString = {
        type: "LineString",
        coordinates: line.map(([x, y]) => [Math.round(x), Math.round(y)]),
    };
    const res = await fetch(`${BASE_URL}/profile.json`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `sr=2056&nb_points=${resolution}&geom=${JSON.stringify(geom)}`,
    });
    const json = await res.json();
    const profile = json.map((p: any) => [p.easting, p.northing, p.alts.COMB]);
    return profile;
}
