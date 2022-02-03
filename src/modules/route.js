import * as vec from "./vec.js";
import { fetchProfile } from "./geoadmin.js";

export function calculateTotals(route) {
    const distance = route.distanceSum[route.line.length - 1] / 1000;
    const effort = route.effortSum[route.markers.length - 1]
    const walkingDuration = effort / route.speed;
    const breakDuration = route.breakSum[route.markers.length - 1] / 60;
    const duration = walkingDuration + breakDuration;
    const {ascent, descent} = calculateHeightDifference(route);

    return {
        distance,
        effort,
        walkingDuration,
        breakDuration,
        duration,
        ascent,
        descent
    };
}

function calculateHeightDifference(route) {
    let ascent = 0, descent = 0;
    for (let i = 1; i < route.markers.length; i++) {
        const diff = route.markerProfile[i].height - route.markerProfile[i - 1].height;
        if (diff > 0) {
            ascent += diff;
        } else {
            descent -= diff;
        }
    }
    
    return { ascent, descent };
}

export async function loadProfiles(route) {
    // Load data from api
    route.lineProfile = await fetchProfile(route.line, false, 100);
    route.markerProfile = await fetchProfile(route.markers.map(m => route.line[m.index]), true, route.markers.length);

    recalculate(route);
    return route;
}

export function reverseRoute(route) {
    // Reverse order
    route.line.reverse();
    route.markers.reverse();
    route.lineProfile?.reverse();
    route.markerProfile?.reverse();

    // Get new marker indexes
    route.markers.forEach(m => m.index = route.line.length - m.index - 1);

    recalculate(route);
}

export function recalculate(route) {
    route.distanceSum = calculateDistanceSum(route.line);
    route.lineProfileDistanceSum = calculateDistanceSum(route.lineProfile.map(p => p.point));
    route.effort = calculateEffort(route);
    route.effortSum = calculateSum(route.effort);
    route.breakSum = [0, ...calculateSum(route.markers.map(m => m.break))];
}

function calculateDistanceSum(line) {
    const distances = line
        .map((_, i) => vec.distance(line[Math.max(0, i - 1)], line[i]));
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

// Calculate effort (Leistungskilometer) using formula found here: https://de.wikipedia.org/wiki/Leistungskilometer
function calculateEffort(route) {
    const effort = [];
    effort[0] = 0;
    for (let i = 1; i < route.markers.length; i++) {
        const run = route.distanceSum[route.markers[i].index] - route.distanceSum[route.markers[i - 1].index];
        const rise = route.markerProfile[i].height - route.markerProfile[i - 1].height;
        const slope = rise / run;

        effort[i] = run / 1000;
        if (slope > 0) {
            effort[i] += rise / 100;
        } else if (slope < -0.2) {
            effort[i] += Math.abs(rise) / 150;
        }
    }
    return effort;
}
