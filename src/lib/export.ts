import type { Line2 } from "./points";
import simplify from "simplify-js";
import { LV95toWGS } from "swiss-projection";

export function downloadGpx(name: string, author: string, line: Line2) {
    const simplified: Line2 = simplify(
        line.map(([x, y]) => ({ x, y })),
        1,
    ).map(({ x, y }) => [x, y]);
    const trackPoints = LV95toWGS(simplified).map(
        ([x, y]) => `<trkpt lat="${y}" lon="${x}"></trkpt>`,
    );
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="marschzeittabelle.ch" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
        <metadata>
            <name>${name}</name>
            <author><name>${author}</name></author>
        </metadata>
        <trk>
            <name>${name}</name>
            <trkseg>
                ${trackPoints}
            </trkseg>
        </trk>
    </gpx>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([xml], { type: "text/xml" }));
    a.download = `${name}.gpx`;
    a.click();
}
