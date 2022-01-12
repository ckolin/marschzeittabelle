const dbg = (obj) => { console.log(obj); return obj; };
const routeCanvas = document.getElementById("route-canvas");
const profileCanvas = document.getElementById("profile-canvas");

const input = document.getElementById("kml");
input.addEventListener("change", () => {
    const reader = new FileReader();
    reader.addEventListener("load", () => generate(reader.result));
    reader.readAsText(input.files[0]);
});

const epsilon = 2;

const generate = (kmlString) => {
    // Parse file content
    const route = parseKml(kmlString);

    // Draw route
    //reverseRoute(route);
    reverseRoute(route);
    drawRoute(route);

    // Draw height profile
    Promise.all([
        fetchProfile(route.line, false, 100),
        fetchProfile(route.markers.map(m => route.line[m.index]), true, route.markers.length)])
        .then(([lineProfile, markerProfile]) => drawProfile(route, lineProfile, markerProfile));

    // Walk line from start to end
};

const fetchProfile = (line, ensureInputPoints, resolution) => {
    const api = "https://api3.geo.admin.ch/rest/services/profile.json";
    const geometry = {
        type: "LineString",
        coordinates: line.map(p => [Math.round(p.x), Math.round(p.y)])
    };
    return fetch(`${api}?sr=21781&distinct_points=${ensureInputPoints}&nb_points=${resolution}&geom=${JSON.stringify(geometry)}`)
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
};

const parseKml = (kmlString) => {
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
            lines.push(points);
        }

        // Find markers
        if (placemark.querySelector("Point")) {
            const name = placemark.querySelector("name").innerHTML;
            const point = parseCoordinates(
                placemark.querySelector("Point coordinates").innerHTML);
            markers.push({ name, point });
        }
    }

    // Merge disjointed lines
    while (lines.length > 1) {
        const connected = findConnectedLines(lines, epsilon);
        if (connected == null) {
            console.error("Lines are not connected");
            return;
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

        marker.index = closest;
        delete marker.point;
    }

    // Bring markers in right order
    markers.sort((a, b) => a.index - b.index);

    // Calculate prefix sum of distance
    const distanceSum = calculateDistanceSum(line);

    return { line, markers, distanceSum };
};

const findConnectedLines = (lines) => {
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
};

const calculateDistanceSum = (line) => {
    const distanceSum = [];
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
        sum += Vec.distance(line[Math.max(0, i - 1)], line[i]);
        distanceSum[i] = sum;
    }
    return distanceSum;
};

const reverseRoute = (route) => {
    route.line.reverse();
    route.markers.reverse();
    route.markers.forEach(m => m.index = route.line.length - m.index - 1);
    route.distanceSum = calculateDistanceSum(route.line);
};

const drawRoute = (route) => {
    const ctx = routeCanvas.getContext("2d");
    routeCanvas.width = routeCanvas.height = 400;
    const padding = 20;

    // Calculate bounds
    const topLeft = { x: Infinity, y: Infinity };
    const bottomRight = { x: -Infinity, y: -Infinity };
    for (let p of route.line) {
        topLeft.x = Math.min(p.x, topLeft.x);
        topLeft.y = Math.min(p.y, topLeft.y);
        bottomRight.x = Math.max(p.x, bottomRight.x);
        bottomRight.y = Math.max(p.y, bottomRight.y);
    }
    const bounds = Vec.subtract(bottomRight, topLeft);
    const center = Vec.add(topLeft, Vec.scale(bounds, 0.5));
    const scale = Math.min(
        (routeCanvas.width - 2 * padding) / bounds.x,
        (routeCanvas.height - 2 * padding) / bounds.y);

    const project = (point) => {
        // Scale and center
        const res = Vec.add(
            Vec.scale(Vec.subtract(point, center), scale),
            { x: 0.5 * routeCanvas.width, y: 0.5 * routeCanvas.height }
        );
        // Flip y axis
        return { x: res.x, y: routeCanvas.height - res.y };
    };

    // Draw line
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    let first = true;
    for (let point of route.line) {
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
        const p = project(route.line[marker.index]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw numbers
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    for (let i = 0; i < route.markers.length; i++) {
        const marker = route.markers[i];
        const p = project(route.line[marker.index]);
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
};

const drawProfile = (route, lineProfile, markerProfile) => {
    const ctx = profileCanvas.getContext("2d");
    profileCanvas.width = 800;
    profileCanvas.height = 200;
    const padding = 20;

    // Calculate bounds
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    for (let p of lineProfile) {
        minHeight = Math.min(minHeight, p.height);
        maxHeight = Math.max(maxHeight, p.height);
    }
    const totalDistance = route.distanceSum[route.distanceSum.length - 1];
    const heightSpan = maxHeight - minHeight;
    const center = { x: 0.5 * totalDistance, y: minHeight + 0.5 * heightSpan }
    const scale = Math.min(
        (profileCanvas.height - 2 * padding) / heightSpan,
        (profileCanvas.width - 2 * padding) / totalDistance);

    const project = (distance, height) => {
        const point = { x: distance, y: height };
        // Scale and center
        const res = Vec.add(
            Vec.scale(Vec.subtract(point, center), scale),
            { x: 0.5 * profileCanvas.width, y: 0.5 * profileCanvas.height }
        );
        // Flip y axis
        return { x: res.x, y: profileCanvas.height - res.y };
    };

    // Calculate distance sum for generated line
    const lineProfileDistanceSum = calculateDistanceSum(lineProfile.map(p => p.point));

    // Draw line profile
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    let first = true;
    for (let i = 0; i < lineProfile.length; i++) {
        const p = project(
            lineProfileDistanceSum[i],
            lineProfile[i].height);
        if (first) {
            first = false;
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    ctx.stroke();


    // Draw dots
    ctx.fillStyle = "black";
    for (let i = 0; i < markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            markerProfile[i].height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw numbers
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    for (let i = 0; i < markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            markerProfile[i].height);
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
};