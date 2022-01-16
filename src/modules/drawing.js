import { Vec } from "./vec.js";
import { theme } from "./theme.js";

export function drawProfile(route, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dotRadius = 10;
    const padding = dotRadius + 2;
    const lineWidth = 4;
    const bottom = 40;

    // Figure out scale of drawing
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    for (let p of route.lineProfile) {
        minHeight = Math.min(minHeight, p.height);
        maxHeight = Math.max(maxHeight, p.height);
    }
    const bounds = {
        x: route.distanceSum[route.distanceSum.length - 1],
        y: maxHeight - minHeight
    };
    const scale = Math.min(
        (canvas.width - 2 * padding) / bounds.x,
        (canvas.height - 2 * padding - bottom) / bounds.y);

    // Fit canavs to drawing
    canvas.width = Math.ceil(bounds.x * scale + 2 * padding);
    canvas.height = Math.ceil(bounds.y * scale + 2 * padding + bottom);

    const project = (distance, height) => Vec.add(
        Vec.scale({ x: distance, y: minHeight - height }, scale),
        { x: padding, y: canvas.height - padding - bottom });

    const followLineProfile = () => {
        for (let i = 0; i < route.lineProfile.length; i++) {
            const p = project(
                route.lineProfileDistanceSum[i],
                route.lineProfile[i].height);

            if (i === 0) {
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
    const bottomRight = project(bounds.x, minHeight);
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

    // Draw dots and numbers
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < route.markerProfile.length; i++) {
        const p = project(
            route.distanceSum[route.markers[i].index],
            route.markerProfile[i].height);

        ctx.beginPath();
        ctx.arc(p.x, p.y, dotRadius, 0, 2 * Math.PI);
        ctx.fillStyle = theme.darkerAccentColor;
        ctx.fill();

        ctx.fillStyle = theme.backgroundColor;
        ctx.fillText(i + 1, p.x, p.y + 0.5);
    }
}
