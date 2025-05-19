export interface SearchResult {
    label: string;
    lngLat: [number, number];
}

export async function search(query: string): Promise<SearchResult[]> {
    if (query.length === 0) {
        return [];
    }
    const res = await fetch(
        `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${query}&type=locations&lang=de&limit=5`,
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
