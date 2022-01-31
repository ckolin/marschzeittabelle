export function equal(a, b) {
    return a.x === b.x && a.y === b.y;
}

export function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(vec, fac) {
    return { x: vec.x * fac, y: vec.y * fac };
}

export function length(vec) {
    return Math.hypot(vec.x, vec.y);
}

export function distance(a, b) {
    return length(subtract(b, a));
}
