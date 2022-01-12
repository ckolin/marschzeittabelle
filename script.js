const dbg = (obj) => { console.log(obj); return obj; };
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("kml");
input.addEventListener("change", () => {
    const reader = new FileReader();
    reader.addEventListener("load", () => generate(reader.result));
    reader.readAsText(input.files[0]);
});

const generate = (kmlString) => {
    // Parse file content
    const route = parse(kmlString);

    // Fetch height data
    const geometry = {
        type: "LineString",
        coordinates: route.markers.map(m => [m.point.x, m.point.y])
    };
    fetch(`https://api3.geo.admin.ch/rest/services/profile.json?distinct_points=true&geom=${JSON.stringify(geometry)}`)
        .then(res => res.json())
        .then(profile => dbg(profile.map(p => p.alts.COMB)));

    // Draw route
    display(route);

    // TODO: Draw height profile

    // Walk line from start to end
};

const parse = (kmlString) => {
    // Converts coordinates from WGS84 to LV03
    const parseCoordinates = (str) => {
        const wgs = str.split(",").map(s => Number(s));
        const ch = Swisstopo.WGStoCH(wgs[1], wgs[0]);
        return { x: ch[0], y: ch[1] };
    };

    const parser = new DOMParser();
    const kml = parser.parseFromString(kmlString, "application/xml");

    const lines = [];
    const markers = [];

    const placemarks = kml
        .querySelector("Document")
        .querySelectorAll("Placemark");

    for (let placemark of placemarks) {
        // Find lines
        if (placemark.querySelector("LineString")) {
            const points = placemark
                .querySelector("LineString coordinates")
                .innerHTML
                .split(" ")
                .map(s => parseCoordinates(s));
            lines.push({ points });
        }

        // Find markers
        if (placemark.querySelector("Point")) {
            const name = placemark.querySelector("name").innerHTML;
            const point = parseCoordinates(
                placemark.querySelector("Point coordinates").innerHTML);
            markers.push({ name, point });
        }
    }

    return { lines, markers };
};

const display = (route) => {
    // Calculate bounds
    const topLeft = { x: Infinity, y: Infinity };
    const bottomRight = { x: -Infinity, y: -Infinity };
    for (let p of route.lines[0].points) {
        topLeft.x = Math.min(p.x, topLeft.x);
        topLeft.y = Math.min(p.y, topLeft.y);
        bottomRight.x = Math.max(p.x, bottomRight.x);
        bottomRight.y = Math.max(p.y, bottomRight.y);
    }
    const size = canvas.width = canvas.height = 400;
    const bounds = Vec.subtract(bottomRight, topLeft);
    const center = Vec.add(topLeft, Vec.scale(bounds, 0.5));
    const zoom = canvas.width / Math.max(bounds.x, bounds.y);
    const padding = 0.1;

    const project = (point) => {
        // Scale and center
        const offset = Vec.add(
            Vec.scale(Vec.subtract(point, center), zoom * (1 - 2 * padding)),
            Vec.scale({ x: 1, y: 1 }, 0.5 * size)
        );
        // Flip y axis
        return Vec.add(
            Vec.multiply(offset, { x: 1, y: -1 }),
            { x: 0, y: size }
        );
    };

    // Draw line
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    let first = true;
    for (let point of route.lines[0].points) {
        const p = project(point);
        if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    ctx.stroke();

    // Draw dots
    ctx.fillStyle = "black";
    for (let marker of route.markers) {
        const p = project(marker.point);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw labels
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    for (let i = 0; i < route.markers.length; i++) {
        const marker = route.markers[i];
        const p = project(marker.point);
        ctx.fillText(i + 1, p.x, p.y + 1);
    }
};