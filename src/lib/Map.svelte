<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import {
        GeoJSONSource,
        LngLat,
        Map,
        MapMouseEvent,
        Marker,
        type MapGeoJSONFeature,
        type SourceSpecification,
        type StyleSpecification,
    } from "maplibre-gl";
    import {
        Router,
        type RoutePoint,
        RouteMode,
        type RouteSegment,
        type Point,
    } from "./routing";
    import type { Feature, FeatureCollection, LineString } from "geojson";
    import { LV95toWGS, WGStoLV95 } from "swiss-projection";

    let container: HTMLElement;

    let map: Map;
    let markers: Marker[] = [];

    let floatingMarker: Marker;
    let floatingFixed: boolean = false;
    let floatingIndex: number;

    let router = new Router((l) => (loading = l));
    let loading = $state(0);
    let points: RoutePoint[] = [];
    let mode: RouteMode = RouteMode.PreferRoads;
    let route: RouteSegment[];

    const BASE_MAPS = ["pixelkarte", "base", "imagerybase"] as const;
    type BaseMap = (typeof BASE_MAPS)[number];
    let baseMap: BaseMap = "pixelkarte";

    const OVERLAYS = ["wanderwege", "veloland", "haltestellen"] as const;
    type Overlay = (typeof OVERLAYS)[number];
    let overlays: Set<Overlay> = new Set(["wanderwege"]);

    function insertPoint(lngLat: LngLat, i = points.length) {
        const pt = WGStoLV95([lngLat.lng, lngLat.lat]);
        router.snap(pt).then((rp) => {
            points.splice(i, 0, rp);
            recalculate();
        });
    }

    function recalculate() {
        updateMarkers();
        router.route(points, mode).then((r) => {
            route = r;
            updateFeatures();
        });
    }

    function initializeMap() {
        map = new Map({
            container,
            style: getStyle(),
            center: [8.23, 46.8],
            zoom: 8,
        });
        map.on("load", initializeOverlays);
        map.dragRotate.disable();
        map.keyboard.disableRotation();
        map.touchZoomRotate.disableRotation();
        map.on("contextmenu", () => {
            points.pop();
            recalculate();
        });
        const mouseMove = (
            e: MapMouseEvent & { features?: MapGeoJSONFeature[] },
        ) => {
            if (!floatingFixed) {
                floatingIndex = e.features![0].properties.i;
                floatingMarker!.setLngLat(e.lngLat).addTo(map);
            }
        };
        map.on("mousemove", "routeOnRoad", mouseMove);
        map.on("mousemove", "routeOffRoad", mouseMove);
        map.on("click", (e) => {
            if (!e.defaultPrevented) {
                insertPoint(e.lngLat);
            }
        });
    }

    function getStyle(): string | StyleSpecification {
        if (baseMap === "base") {
            return "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.basemap_world.vt/style.json?key=elL5I2rTshJ5j6y7kifu";
        } else if (baseMap === "imagerybase") {
            return "https://vectortiles.geo.admin.ch/styles/ch.swisstopo.imagerybasemap_world.vt/style.json?key=elL5I2rTshJ5j6y7kifu";
        } else {
            return {
                version: 8,
                sources: {
                    pixelkarte: makeRasterSource(
                        "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
                    ),
                },
                layers: [
                    {
                        id: "pixelkarte",
                        type: "raster",
                        source: "pixelkarte",
                        paint: {
                            "raster-saturation": -0.1,
                        },
                    },
                ],
            };
        }
    }

    function initializeOverlays() {
        map.addSource(
            "wanderwege",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-wanderwege/default/current/3857/{z}/{x}/{y}.png",
            ),
        );
        map.addLayer({
            id: "wanderwege",
            type: "raster",
            source: "wanderwege",
            paint: {
                "raster-opacity": 0.7,
            },
        });
        map.addSource(
            "veloland",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.astra.veloland/default/current/3857/{z}/{x}/{y}.png",
                "© ASTRA",
            ),
        );
        map.addLayer({
            id: "veloland",
            type: "raster",
            source: "veloland",
            paint: {
                "raster-opacity": 0.7,
            },
        });
        map.addSource(
            "haltestellen",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.bav.haltestellen-oev/default/current/3857/{z}/{x}/{y}.png",
            ),
        );
        map.addLayer({
            id: "haltestellen",
            type: "raster",
            source: "haltestellen",
        });
        updateOverlays();
    }

    function makeRasterSource(
        url: string,
        attribution: string = "© swisstopo",
    ): SourceSpecification {
        return {
            type: "raster",
            tiles: [url],
            tileSize: 256,
            attribution,
            bounds: [5.02, 45.25, 11.5, 48.27],
            maxzoom: 18,
        };
    }

    function updateOverlays() {
        for (const o of OVERLAYS) {
            map.setLayoutProperty(
                o,
                "visibility",
                overlays.has(o) ? "visible" : "none",
            );
        }
    }

    function updateFeatures() {
        const features: Feature<LineString>[] = [];
        for (const [i, seg] of route!.entries()) {
            features.push({
                type: "Feature",
                properties: { i, onRoad: seg.onRoad },
                geometry: {
                    type: "LineString",
                    coordinates: LV95toWGS(seg.path),
                },
            });
        }
        const collection: FeatureCollection<LineString> = {
            type: "FeatureCollection",
            features,
        };
        const source: GeoJSONSource | undefined = map.getSource("route");
        if (source == null) {
            map.addSource("route", { type: "geojson", data: collection });
            map.addLayer({
                id: "routeOnRoad",
                type: "line",
                source: "route",
                filter: ["==", "onRoad", true],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": "#c12",
                    "line-opacity": 0.8,
                    "line-width": 8,
                },
            });
            map.addLayer({
                id: "routeOffRoad",
                type: "line",
                source: "route",
                filter: ["==", "onRoad", false],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": "#c12",
                    "line-opacity": 0.8,
                    "line-width": 8,
                    "line-dasharray": [2, 1],
                },
            });
        } else {
            source.setData(collection);
        }
    }

    function initializeFloatingMarker() {
        const el = document.createElement("div");
        el.classList.add("marker", "floating");
        floatingMarker = new Marker({
            draggable: true,
            element: el,
        });
        el.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                floatingFixed = true;
            }
        });
        el.addEventListener("mouseleave", () => {
            if (!floatingFixed) {
                floatingMarker.remove();
            }
        });
        const insert = () => {
            const lnglat = floatingMarker.getLngLat();
            insertPoint(lnglat, floatingIndex + 1);
            floatingMarker.remove();
            floatingFixed = false;
        };
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            insert();
        });
        floatingMarker.on("dragend", insert);
    }

    function updateMarkers() {
        // Remove surplus markers
        for (let i = markers.length - 1; i >= points.length; i--) {
            const marker = markers.pop()!;
            marker.remove();
        }
        // Add markers as needed
        for (let i = markers.length; i < points.length; i++) {
            const el = document.createElement("div");
            el.classList.add("marker");
            el.addEventListener("mouseenter", () => {
                if (!floatingFixed) {
                    floatingMarker.remove();
                }
            });
            el.addEventListener("mousemove", (e) => e.stopPropagation());
            el.addEventListener("click", (e) => e.stopPropagation());
            el.addEventListener("contextmenu", () => {
                floatingMarker.remove();
                points.splice(i, 1);
                recalculate();
            });
            const marker = new Marker({
                draggable: true,
                element: el,
            });
            marker.on("dragend", () => {
                const lngLat = marker.getLngLat();
                const pt: Point = WGStoLV95([lngLat.lng, lngLat.lat]);
                router.snap(pt).then((pt) => {
                    points[i] = pt;
                    recalculate();
                });
            });
            markers.push(marker);
        }
        for (let i = 0; i < points.length; i++) {
            markers[i].setLngLat(LV95toWGS(points[i].point)).addTo(map);
        }
    }

    $effect(() => {
        initializeMap();
        initializeFloatingMarker();
    });
</script>

<div id="container" bind:this={container}></div>
<p>{loading} loading...</p>

<style>
    #container {
        height: 60rem;
    }

    #container :global {
        .marker {
            z-index: 2;
            width: 20px;
            height: 20px;
            background: #c12;
            border-radius: 50%;
            cursor: move;
            box-shadow: 0 0 3px #0003;
        }

        .marker:hover {
            filter: brightness(125%);
        }

        .marker.floating {
            z-index: 1;
        }
    }
</style>
