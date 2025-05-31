type RBush<T> = import("rbush").default<T>;
type BBox = import("rbush").BBox;

declare module "rbush-knn" {
    declare function knn<T extends BBox>(
        tree: RBush<T>,
        x: number,
        y: number,
        k: number = Infinity,
        filterFn: ((item: T) => bool) | undefined = undefined,
        maxDistance: number = Infinity,
    ): T[];

    export = knn;
}
