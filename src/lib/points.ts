export type Point2 = [number, number];
export type Point3 = [number, number, number];
export type Line2 = Point2[];
export type Line3 = Point3[];

export function dist2(
    [ax, ay]: Point2 | Point3,
    [bx, by]: Point2 | Point3,
): number {
    return Math.hypot(bx - ax, by - ay);
}

export function along2<T extends Point2 | Point3>(line: T[], dist: number): T {
    if (dist <= 0) {
        return line[0];
    }
    let d = 0;
    for (let i = 1; i < line.length; i++) {
        d += dist2(line[i], line[i - 1]);
        if (d >= dist) {
            return line[i];
        }
    }
    return line[line.length - 1];
}
