import { Vec } from "./vec.js";

export class Route {
    constructor(line, markers) {
        this.line = line;
        this.markers = markers;
        this.distanceSum = calculateDistanceSum(this.line);
        this.lineProfile = null;
        this.markerProfile = null;
    }

    reverse() {
        this.line.reverse();
        this.markers.reverse();
        this.markers.forEach(m => m.index = this.line.length - m.index - 1);
        this.distanceSum = calculateDistanceSum(route.line);

        if (this.lineProfile) {
            this.lineProfile.reverse();
        }
        if (this.markerProfile) {
            this.markerProfile.reverse();
        }
    }
}

export function calculateDistanceSum(line) {
    const distanceSum = [];
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
        sum += Vec.distance(line[Math.max(0, i - 1)], line[i]);
        distanceSum[i] = sum;
    }
    return distanceSum;
}
