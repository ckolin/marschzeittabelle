type Feature = import("geojson").Feature;
type FeatureCollection = import("geojson").FeatureCollection;
type Geometry = import("geojson").Geometry;

type Input =
    | [number, number]
    | [number, number][]
    | Feature
    | FeatureCollection
    | Geometry;

declare module "swiss-projection" {
    declare function LV95toWGS<T extends Input>(input: T): T;
    declare function WGStoLV95<T extends Input>(input: T): T;
}
