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
