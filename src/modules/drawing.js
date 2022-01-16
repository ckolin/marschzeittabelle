import { Vec } from "./vec.js";
import { theme } from "./theme.js";

const dotRadius = 10;
const padding = dotRadius;
const lineWidth = 4;

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
            { x: 0.5 * canvas.width, y: 0.5 * canvas.height });
        // Flip y axis
        return { x: res.x, y: canvas.height - res.y };
    };
    
    const followLineProfile = () => {
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
    };

    // Draw area under line
    ctx.beginPath();
    followLineProfile();
    const topLeft = project(0, maxHeight);
    const bottomLeft = project(0, minHeight);
    const bottomRight = project(totalDistance, minHeight);
    ctx.lineTo(bottomRight.x, canvas.height);
    ctx.lineTo(bottomLeft.x, canvas.height);
    const gradient = ctx.createLinearGradient(0, topLeft.y, 0, canvas.height);
    gradient.addColorStop(0, theme.lighterAccentColor);
    gradient.addColorStop(1, theme.backgroundColor);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw line
    ctx.beginPath();
    followLineProfile();
    ctx.lineWidth = lineWidth;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = theme.accentColor;
    ctx.stroke();

    // Draw dots
    ctx.fillStyle = theme.darkerAccentColor;
    for (let i = 0; i < route.markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            route.markerProfile[i].height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw numbers
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.backgroundColor;
    for (let i = 0; i < route.markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            route.markerProfile[i].height);
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
};