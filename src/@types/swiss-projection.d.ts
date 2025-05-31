type P = [number, number];

declare module "swiss-projection" {
    declare function LV95toWGS<T extends P | P[]>(pt: T): T;
    declare function WGStoLV95<T extends P | P[]>(pt: T): T;
}
