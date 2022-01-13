import { Vec } from "./vec.js";
import { fetchProfile } from "./modules/geoadmin.js";

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
        this.distanceSum = calculateDistanceSum(this.line);
        this.lineProfile?.reverse();
        this.markerProfile?.reverse();
    }

    async loadProfiles() {
        this.lineProfile = await fetchProfile(route.line, false, 100);
        this.markerProfile = await fetchProfile(route.markers.map(m => route.line[m.index]), true, route.markers.length);
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
