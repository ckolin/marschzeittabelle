<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { slide } from "svelte/transition";
    import type { Feature, FeatureCollection, LineString } from "geojson";
    import { LV95toWGS, WGStoLV95 } from "swiss-projection";
    import "maplibre-gl/dist/maplibre-gl.css";
    import {
        AttributionControl,
        GeoJSONSource,
        LngLat,
        Map,
        MapMouseEvent,
        Marker,
        ScaleControl,
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
    import type { Point2 } from "../lib/points";
    import { theme } from "../lib/theme";
    import MapSearch from "./MapSearch.svelte";
    import MapSelector, { type BaseMap } from "./MapSelector.svelte";
    import Profile from "./Profile.svelte";
    import Icon from "./Icon.svelte";
    import Spinner from "./Spinner.svelte";

    let mapElement: HTMLElement;
    let map: Map;
    let markers: Marker[] = [];

    let intermediateMarker: Marker;
    let intermediateFixed = false;
    let intermediateIndex: number;

    let highlightMarker: Marker;

    let tooltipElement: HTMLElement;
    let tooltipState: "outside" | "map" | "marker" | "route" =
        $state("outside");
    let tooltipPosition: [number, number] = $state([0, 0]);

    let baseMap: BaseMap = $state("pixelkarte");

    const overlays = [
        {
            id: "+wanderwege",
            icon: "hiking",
            label: "Wanderwege",
        },
        {
            id: "+sperrungen",
            icon: "dangerous",
            label: "Sperrungen/Umleitungen",
        },
        {
            id: "+veloland",
            icon: "directions_bike",
            label: "Veloland Schweiz",
        },
        {
            id: "+haltestellen",
            icon: "bus_railway",
            label: "ÖV-Haltestellen",
        },
    ] as const;
    let activeOverlays: (typeof overlays)[number]["id"][] = $state([]);

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

    let router = new Router((l, t) => (routerLoading = l < t));
    let routerLoading = $state(false);
    let points: RoutePoint[] = $state([]);
    let route: RouteSegment[] = $state([]);

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
        map.addControl(new ScaleControl({ maxWidth: 300 }), "bottom-right");
        map.addControl(new AttributionControl(), "bottom-right");
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
            if (!intermediateFixed) {
                intermediateIndex = e.features![0].properties.i;
                intermediateMarker!.setLngLat(e.lngLat).addTo(map);
            }
            tooltipState = "route";
        };
        map.on("mousemove", "+route-on-road", mouseMove);
        map.on("mousemove", "+route-off-road", mouseMove);
        const mouseLeave = () => (tooltipState = "map");
        map.on("mouseleave", "+route-on-road", mouseLeave);
        map.on("mouseleave", "+route-off-road", mouseLeave);
        map.on("click", (e) => {
            if (!e.defaultPrevented) {
                insertPoint(e.lngLat);
            }
        });
        mapElement.addEventListener("mouseenter", () => (tooltipState = "map"));
        mapElement.addEventListener("mousemove", (e) => {
            const o = 15;
            const w = tooltipElement.offsetWidth;
            const h = tooltipElement.offsetHeight;
            const x =
                e.pageX + o + w < window.innerWidth
                    ? e.pageX + o
                    : e.pageX - o - w;
            const y =
                e.pageY + o + h < window.innerHeight
                    ? e.pageY + o
                    : e.pageY - o - h;
            tooltipPosition = [x, y];
        });
        mapElement.addEventListener(
            "mouseleave",
            () => (tooltipState = "outside"),
        );
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
                            "raster-saturation": 0,
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
            "+sperrungen",
            makeRasterSource(
                "https://wms.geo.admin.ch/?REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&FORMAT=image/png&LAYERS=ch.astra.wanderland-sperrungen_umleitungen&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}",
            ),
        );
        map.addLayer({
            id: "+sperrungen",
            type: "raster",
            source: "+sperrungen",
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
                id: "+route-on-road",
                type: "line",
                source: "+route",
                filter: ["==", "onRoad", true],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": theme("accent"),
                    "line-opacity": 0.8,
                    "line-width": 8,
                },
            });
            map.addLayer({
                id: "+route-off-road",
                type: "line",
                source: "+route",
                filter: ["==", "onRoad", false],
                layout: {
                    "line-cap": "butt",
                    "line-join": "bevel",
                },
                paint: {
                    "line-color": theme("accent"),
                    "line-opacity": 0.8,
                    "line-width": 8,
                    "line-dasharray": [2, 1],
                },
            });
        } else {
            source.setData(collection);
        }
    }

    function initializeIntermediate() {
        const el = document.createElement("div");
        el.classList.add("marker", "intermediate");
        intermediateMarker = new Marker({
            draggable: true,
            element: el,
        });
        el.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                intermediateFixed = true;
            }
        });
        el.addEventListener("mouseleave", () => {
            if (!intermediateFixed) {
                intermediateMarker.remove();
            }
        });
        const insert = () => {
            const lnglat = intermediateMarker.getLngLat();
            insertPoint(lnglat, intermediateIndex + 1);
            intermediateMarker.remove();
            intermediateFixed = false;
        };
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            insert();
        });
        intermediateMarker.on("dragend", insert);
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
                if (!intermediateFixed) {
                    intermediateMarker.remove();
                }
                tooltipState = "marker";
            });
            el.addEventListener("mousemove", (e) => e.stopPropagation());
            el.addEventListener("mouseleave", () => (tooltipState = "map"));
            el.addEventListener("click", (e) => e.stopPropagation());
            el.addEventListener("contextmenu", () => {
                intermediateMarker.remove();
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

    function onHighlight(point: Point2) {
        if (highlightMarker == null) {
            const el = document.createElement("div");
            el.classList.add("marker", "highlight");
            highlightMarker = new Marker({
                draggable: false,
                element: el,
            });
        }
        highlightMarker.setLngLat(LV95toWGS(point)).addTo(map);
    }

    function onHighlightEnd() {
        highlightMarker?.remove();
    }

    function onNavigate(point: Point2, zoom: number | undefined = undefined) {
        map.flyTo({ center: LV95toWGS(point), zoom });
    }

    onMount(() => {
        initializeMap();
        initializeIntermediate();
    });

    onDestroy(() => map.remove());
</script>

<div class="container">
    <div class="map" bind:this={mapElement}></div>
    <div
        bind:this={tooltipElement}
        class="box tooltip"
        style:left={`${tooltipPosition[0]}px`}
        style:top={`${tooltipPosition[1]}px`}
        class:hidden={tooltipState === "outside"}
    >
        {#if routerLoading}
            <Spinner />
        {:else if tooltipState === "map" && points.length === 0}
            <span><Icon name="mouse" />L - Startpunkt setzen</span>
        {:else if tooltipState === "map"}
            <span><Icon name="mouse" />L - Punkt hinzufügen</span>
            <span><Icon name="mouse" />R - Letzten Punkt entfernen</span>
        {:else if tooltipState === "marker"}
            <span><Icon name="mouse" />R - Punkt entfernen</span>
        {:else if tooltipState === "route"}
            <span><Icon name="mouse" />L - Punkt einfügen</span>
        {/if}
    </div>
    <div class="overlay" style="top: 0; left: 0">
        <div class="box">
            <span>
                <Icon name="directions" /> Wegfindung
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
    </div>
    <div class="overlay" style="top: 0; right: 0; flex-direction: row">
        <div class="box">
            <MapSearch
                {onHighlight}
                {onHighlightEnd}
                onNavigate={(p) => onNavigate(p, 13)}
            />
        </div>
        <div class="box">
            <button onclick={() => map.zoomIn()}>
                <Icon name="add" big />
            </button>
            <button onclick={() => map.zoomOut()}>
                <Icon name="remove" big />
            </button>
        </div>
    </div>
    <div class="overlay" style="bottom: 0; left: 0">
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
                <Profile {route} {onHighlight} {onHighlightEnd} {onNavigate} />
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        position: relative;
        background: #222;
    }

    .map {
        height: 100vh;
    }

    .map :global {
        .marker {
            z-index: 2;
            width: 20px;
            height: 20px;
            background: var(--accent);
            border: 3px solid #000;
            border-radius: 50%;
            cursor: move;
        }

        .marker.intermediate {
            z-index: 1;
        }

        .marker.highlight {
            border: none;
            pointer-events: none;
        }
    }

    .overlay {
        z-index: 10;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        margin: 0.5rem;
        pointer-events: none;
    }

    .box {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 1rem;
        border: 1px solid #fff4;
        background: color-mix(in srgb, var(--background), transparent 30%);
        backdrop-filter: blur(16px);
        box-shadow: 0 0 1rem var(--shadow);
        pointer-events: initial;
    }

    .box:has(button) {
        gap: 0;
        padding: 0;
    }

    .box button {
        padding: 1rem;
        background: none;
        border: none;
    }

    .tooltip {
        z-index: 20;
        padding: 0.75rem;
        white-space: nowrap;
        position: absolute;
        pointer-events: none;
    }

    .tooltip.hidden {
        visibility: hidden;
    }
</style>
