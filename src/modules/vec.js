export class Vec {
    static equal(a, b) {
        return a.x === b.x && a.y === b.y;
    }
    
    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }

    static subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    static scale(vec, fac) {
        return { x: vec.x * fac, y: vec.y * fac };
    }

    static length(vec) {
        return Math.hypot(vec.x, vec.y);
    }

    static distance(a, b) {
        return Vec.length(Vec.subtract(b, a));
    }
}
