import { Vec } from "./vec.js";

const padding = 20;
const primaryColor = "black";
const secondaryColor = "white";

export function drawRoute(route, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        (canvas.width - 2 * padding) / bounds.x,
        (canvas.height - 2 * padding) / bounds.y);

    const project = (point) => {
        // Scale and center
        const res = Vec.add(
            Vec.scale(Vec.subtract(point, center), scale),
            { x: 0.5 * canvas.width, y: 0.5 * canvas.height }
        );
        // Flip y axis
        return { x: res.x, y: canvas.height - res.y };
    };

    // Draw line
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = primaryColor;
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
    ctx.fillStyle = primaryColor;
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
    ctx.fillStyle = secondaryColor;
    for (let i = 0; i < route.markers.length; i++) {
        const marker = route.markers[i];
        const p = project(route.line[marker.index]);
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
};

export function drawProfile(route, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bounds
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    for (let p of route.lineProfile) {
        minHeight = Math.min(minHeight, p.height);
        maxHeight = Math.max(maxHeight, p.height);
    }
    const totalDistance = route.distanceSum[route.distanceSum.length - 1];
    const heightSpan = maxHeight - minHeight;
    const center = { x: 0.5 * totalDistance, y: minHeight + 0.5 * heightSpan }
    const scale = Math.min(
        (canvas.height - 2 * padding) / heightSpan,
        (canvas.width - 2 * padding) / totalDistance);

    const project = (distance, height) => {
        const point = { x: distance, y: height };
        // Scale and center
        const res = Vec.add(
            Vec.scale(Vec.subtract(point, center), scale),
            { x: 0.5 * canvas.width, y: 0.5 * canvas.height }
        );
        // Flip y axis
        return { x: res.x, y: canvas.height - res.y };
    };

    // Draw line profile
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = primaryColor;
    let first = true;
    for (let i = 0; i < route.lineProfile.length; i++) {
        const p = project(
            route.lineProfileDistanceSum[i],
            route.lineProfile[i].height);
        if (first) {
            first = false;
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    ctx.stroke();

    // Draw dots
    ctx.fillStyle = primaryColor;
    for (let i = 0; i < route.markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            route.markerProfile[i].height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw numbers
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = secondaryColor;
    for (let i = 0; i < route.markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            route.markerProfile[i].height);
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
};