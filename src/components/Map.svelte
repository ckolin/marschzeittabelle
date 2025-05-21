<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import {
        AttributionControl,
        GeoJSONSource,
        LngLat,
        Map,
        MapMouseEvent,
        Marker,
        NavigationControl,
        type MapGeoJSONFeature,
        type SourceSpecification,
        type StyleSpecification,
    } from "maplibre-gl";
    import {
        Router,
        type RoutePoint,
        RouteMode,
        type RouteSegment,
    } from "../lib/routing";
    import type { Feature, FeatureCollection, LineString } from "geojson";
    import { LV95toWGS, WGStoLV95 } from "swiss-projection";
    import { onMount } from "svelte";
    import { theme } from "../lib/theme";
    import Search from "./Search.svelte";
    import MapSelector, { type BaseMap } from "./MapSelector.svelte";
    import Spinner from "./Spinner.svelte";
    import { fade, slide } from "svelte/transition";
    import Icon from "./Icon.svelte";
    import Profile from "./Profile.svelte";
    import type { Point2 } from "../lib/points";

    let mapElement: HTMLElement;

    let map: Map;
    let markers: Marker[] = [];

    let floatingMarker: Marker;
    let floatingFixed: boolean = false;
    let floatingIndex: number;

    let router = new Router((l, t) => {
        loaded = l;
        total = t;
    });
    let loaded = $state(0);
    let total = $state(0);
    let points: RoutePoint[] = [];
    let route: RouteSegment[] = $state([]);

    const modes = [
        {
            value: RouteMode.OffRoad,
            icon: "diagonal_line",
            label: "Luftlinie",
        },
        {
            value: RouteMode.PreferRoads,
            icon: "route",
            label: "Alle Wege",
        },
        {
            value: RouteMode.PreferPaved,
            icon: "road",
            label: "Hartbelag",
        },
        {
            value: RouteMode.PreferHikingTrails,
            icon: "hiking",
            label: "Wanderwege",
        },
    ] as const;
    let mode = $state(RouteMode.PreferRoads);

    let baseMap: BaseMap = $state("pixelkarte");

    const overlays = [
        { id: "+wanderwege", icon: "hiking", label: "Wanderwege" },
        { id: "+veloland", icon: "directions_bike", label: "Veloland Schweiz" },
        { id: "+haltestellen", icon: "bus_railway", label: "ÖV-Haltestellen" },
    ] as const;
    let activeOverlays: (typeof overlays)[number]["id"][] = $state([]);

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
            container: mapElement,
            style: getStyle(),
            center: [8.23, 46.8],
            zoom: 8,
            minZoom: 7,
            attributionControl: false,
        });
        map.addControl(new AttributionControl(), "bottom-right");
        map.addControl(
            new NavigationControl({
                showZoom: true,
                showCompass: false,
            }),
            "bottom-right",
        );
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
        map.on("mousemove", "+routeOnRoad", mouseMove);
        map.on("mousemove", "+routeOffRoad", mouseMove);
        map.on("click", (e) => {
            if (!e.defaultPrevented) {
                insertPoint(e.lngLat);
            }
        });
    }

    function updateStyle() {
        map.setStyle(getStyle(), {
            transformStyle: (prev, next) => {
                const sources = next.sources;
                for (const id of Object.keys(prev!.sources)) {
                    if (id.startsWith("+")) {
                        sources[id] = prev!.sources[id];
                    }
                }
                const layers = next.layers;
                for (const layer of prev!.layers) {
                    if (layer.id.startsWith("+")) {
                        layers.push(layer);
                    }
                }
                return { ...next, sources, layers };
            },
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
            "+wanderwege",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-wanderwege/default/current/3857/{z}/{x}/{y}.png",
            ),
        );
        map.addLayer({
            id: "+wanderwege",
            type: "raster",
            source: "+wanderwege",
            paint: {
                "raster-opacity": 0.7,
            },
        });
        map.addSource(
            "+veloland",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.astra.veloland/default/current/3857/{z}/{x}/{y}.png",
                "© ASTRA",
            ),
        );
        map.addLayer({
            id: "+veloland",
            type: "raster",
            source: "+veloland",
            paint: {
                "raster-opacity": 0.7,
            },
        });
        map.addSource(
            "+haltestellen",
            makeRasterSource(
                "https://wmts.geo.admin.ch/1.0.0/ch.bav.haltestellen-oev/default/current/3857/{z}/{x}/{y}.png",
            ),
        );
        map.addLayer({
            id: "+haltestellen",
            type: "raster",
            source: "+haltestellen",
        });
        updateOverlays();
    }

    function updateOverlays() {
        for (const overlay of overlays) {
            map.setLayoutProperty(
                overlay.id,
                "visibility",
                activeOverlays.includes(overlay.id) ? "visible" : "none",
            );
        }
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
        const source: GeoJSONSource | undefined = map.getSource("+route");
        if (source == null) {
            map.addSource("+route", { type: "geojson", data: collection });
            map.addLayer({
                id: "+routeOnRoad",
                type: "line",
                source: "+route",
                filter: ["==", "onRoad", true],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": theme("secondary"),
                    "line-opacity": 0.8,
                    "line-width": 8,
                },
            });
            map.addLayer({
                id: "+routeOffRoad",
                type: "line",
                source: "+route",
                filter: ["==", "onRoad", false],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": theme("secondary"),
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
                const pt: Point2 = WGStoLV95([lngLat.lng, lngLat.lat]);
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

    onMount(() => {
        initializeMap();
        initializeFloatingMarker();
    });
</script>

<div class="container">
    <div class="map" bind:this={mapElement}></div>
    <div class="overlay box" style="top: 0; left: 0">
        <span>
            <Icon name="directions" />
            Wegfindung
            {#if loaded < total}
                <span out:fade><Spinner inline /></span>
            {/if}
        </span>
        {#each modes as { value, icon, label }}
            <label>
                <input
                    type="radio"
                    {value}
                    bind:group={mode}
                    onchange={recalculate}
                />
                <Icon name={icon} />
                {label}
            </label>
        {/each}
    </div>
    <div class="overlay box" style="top: 0; right: 0">
        <span><Icon name="search" /> Suche</span>
        <Search onSelect={(r) => map.flyTo({ center: r.lngLat, zoom: 12 })} />
    </div>
    <div class="overlay" style="bottom: 0; left: 0;">
        <div class="box">
            <span><Icon name="layers" /> Ebenen</span>
            {#each overlays as { id, icon, label }}
                <label>
                    <input
                        type="checkbox"
                        value={id}
                        bind:group={activeOverlays}
                        onchange={updateOverlays}
                    />
                    <Icon name={icon} />
                    {label}
                </label>
            {/each}
            <span><Icon name="map" /> Hintergrund</span>
            <MapSelector bind:baseMap onchange={updateStyle} />
        </div>
        {#if route.length > 0}
            <div transition:slide class="box">
                <Profile {route} />
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        position: relative;
        background: #bbb;
    }

    .map {
        height: 100vh;
    }

    .map :global {
        .marker {
            z-index: 2;
            width: 20px;
            height: 20px;
            background: var(--secondary);
            border: 3px solid var(--secondary-dark);
            border-radius: 50%;
            cursor: move;
            box-shadow: 0 0 3px var(--shadow-color);
        }

        .marker:hover {
            background: var(--secondary-light);
        }

        .marker.floating {
            z-index: 1;
        }
    }

    .overlay {
        position: absolute;
        z-index: 10;
    }

    .box {
        width: fit-content;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 1rem;
        margin: 0.75rem;
        border: 1px solid var(--shadow-color);
        border-radius: 0.5rem;
        background: #fff8;
        backdrop-filter: blur(12px);
        box-shadow: 0 0 1rem var(--shadow-color);
    }
</style>
