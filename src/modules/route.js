import { Vec } from "./vec.js";
import { fetchProfile } from "./geoadmin.js";

export class Route {
    constructor(line, markers) {
        this.line = line;
        this.markers = markers;
    }

    async loadProfiles() {
        this.lineProfile = await fetchProfile(this.line, false, 100);
        this.markerProfile = await fetchProfile(this.markers.map(m => this.line[m.index]), true, this.markers.length);
        this.calculateDistances();
        return this;
    }

    reverse() {
        this.line.reverse();
        this.markers.reverse();
        this.markers.forEach(m => m.index = this.line.length - m.index - 1);
        this.lineProfile?.reverse();
        this.markerProfile?.reverse();
        this.calculateDistances();
    }

    calculateDistances() {
        this.distanceSum = calculateDistanceSum(this.line);
        this.lineProfileDistanceSum = calculateDistanceSum(this.lineProfile.map(p => p.point));

        this.effort = [];
        this.effort[0] = 0;
        for (let i = 1; i < this.markers.length; i++) {
            const run = this.distanceSum[this.markers[i].index] - this.distanceSum[this.markers[i - 1].index];
            const rise = this.markerProfile[i].height - this.markerProfile[i - 1].height;
            const slope = rise / run;

            this.effort[i] = run / 1000;
            if (slope > 0) {
                this.effort[i] += rise / 100;
            } else if (slope < -0.2) {
                this.effort[i] += Math.abs(rise) / 150;
            }
        }

        this.effortSum = calculateSum(this.effort);
    }
}

function calculateDistanceSum(line) {
    const distances = line.map((_, i) => Vec.distance(line[Math.max(0, i - 1)], line[i]));
    return calculateSum(distances);
}

function calculateSum(values) {
    const res = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        res[i] = sum;
    }
    return res;
}
