// Resolution in m/px for each zoom level
// See https://wmts.geo.admin.ch/EPSG/2056/1.0.0/WMTSCapabilities.xml
import type { Line2, Point2 } from "./points";

// Highest resolution removed because it is slow to render
const RESOLUTIONS = [
    4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
    1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5,
];
const TILE_SIZE_PIXELS = 256;
const ORIGIN_X = 2420000;
const ORIGIN_Y = 1350000;
const A4_RATIO = 297 / 210;

export async function getMapImage(
    line: Line2,
    margin: number = 0.05,
): Promise<OffscreenCanvas> {
    // Find bounding box
    const xs = line.map(([x]) => x);
    const ys = line.map(([, y]) => y);
    let west = Math.min(...xs);
    let south = Math.min(...ys);
    let east = Math.max(...xs);
    let north = Math.max(...ys);
    // Apply relative margins
    const centerX = (east + west) / 2;
    const centerY = (north + south) / 2;
    let width = (east - west) * (1 + 2 * margin);
    let height = (north - south) * (1 + 2 * margin);
    // Fit to A4 paper
    const ratio = height / width;
    const targetRatio = ratio < 1 ? 1 / A4_RATIO : A4_RATIO;
    if (ratio < targetRatio) {
        height = width * targetRatio;
    } else {
        width = height / targetRatio;
    }
    west = centerX - width / 2;
    south = centerY - height / 2;
    east = centerX + width / 2;
    north = centerY + height / 2;
    const canvas = await drawMap([west, south, east, north]);
    const ctx = canvas.getContext("2d")!;
    const proj = ([x, y]: Point2): Point2 => [
        ((x - west) / (east - west)) * canvas.width,
        ((north - y) / (north - south)) * canvas.height,
    ];
    ctx.moveTo(...proj(line[0]));
    for (let i = 1; i < line.length; i++) {
        ctx.lineTo(...proj(line[i]));
    }
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#f008";
    ctx.stroke();
    return canvas;
}

async function drawMap(
    bounds: readonly [number, number, number, number],
    style: "color" | "grayscale" = "color",
    maxImageSize: number = 2000,
): Promise<OffscreenCanvas> {
    const [west, south, east, north] = bounds.map((n) => Math.floor(n));
    let z = RESOLUTIONS.length - 1;
    while (
        Math.max(east - west, north - south) / RESOLUTIONS[z] >
        maxImageSize
    ) {
        z--;
    }
    const resolution = RESOLUTIONS[z];
    const tileSize = resolution * TILE_SIZE_PIXELS;

    const canvas = new OffscreenCanvas(
        (east - west) / resolution,
        (north - south) / resolution,
    );
    const ctx = canvas.getContext("2d")!;

    const styleName =
        style === "color"
            ? "ch.swisstopo.pixelkarte-farbe"
            : "ch.swisstopo.pixelkarte-grau";
    const drawTile = async (x: number, y: number) => {
        const i = Math.floor((x - ORIGIN_X) / tileSize);
        const j = Math.floor((ORIGIN_Y - y) / tileSize);
        const res = await fetch(
            `https://wmts.geo.admin.ch/1.0.0/${styleName}/default/current/2056/${z}/${i}/${j}.jpeg`,
        );
        if (!res.ok) {
            return;
        }
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        const tileX = i * tileSize + ORIGIN_X;
        const tileY = ORIGIN_Y - j * tileSize;
        ctx.drawImage(
            bitmap,
            Math.floor((tileX - west) / resolution),
            Math.floor(canvas.height - (tileY - south) / resolution),
        );
    };

    const promises = [];
    for (let x = west; x < east + tileSize; x += tileSize) {
        for (let y = south; y < north + tileSize; y += tileSize) {
            promises.push(drawTile(x, y));
        }
    }
    await Promise.all(promises);
    return canvas;
}
