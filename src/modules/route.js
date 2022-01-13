import { Vec } from "./vec.js";
import { fetchProfile } from "./geoadmin.js";

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
        this.lineProfileDistanceSum = calculateDistanceSum(this.lineProfile.map(p => p.point));
    }

    async loadProfiles() {
        this.lineProfile = await fetchProfile(this.line, false, 100);
        this.markerProfile = await fetchProfile(this.markers.map(m => this.line[m.index]), true, this.markers.length);

        // Calculate distance sum for line profile
        this.lineProfileDistanceSum = calculateDistanceSum(this.lineProfile.map(p => p.point));
    }
}

function calculateDistanceSum(line) {
    const distanceSum = [];
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
        sum += Vec.distance(line[Math.max(0, i - 1)], line[i]);
        distanceSum[i] = sum;
    }
    return distanceSum;
}
