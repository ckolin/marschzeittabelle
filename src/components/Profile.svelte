<script lang="ts">
    import * as d3 from "d3";
    import type { RouteSegment } from "../lib/routing";
    import { fetchProfile } from "../lib/geoadmin";
    import { along, dist2, type Line3, type Point2 } from "../lib/points";
    import { theme } from "../lib/theme";
    import Spinner from "./Spinner.svelte";
    import Icon from "./Icon.svelte";
    import { fade } from "svelte/transition";

    const {
        route,
        onSelect: onSelect,
    }: { route: RouteSegment[]; onSelect: (p: Point2) => void } = $props();

    let chartElement: HTMLElement;
    let profile: Line3 = $state([]);

    let timeout: number;
    let loading = $state(false);
    $effect(() => {
        clearTimeout(timeout);
        const line = route.flatMap((r) => r.path);
        timeout = setTimeout(
            () =>
                fetchProfile(line).then((p) => {
                    profile = p;
                    loading = false;
                }),
            200,
        );
        loading = true;
    });

    $effect(() => {
        const width = 400;
        const height = 150;
        const margin = {
            top: 10,
            right: 20,
            bottom: 20,
            left: 40,
        };

        const dz: [number, number][] = [];
        let d = 0;
        for (let i = 0; i < profile.length; i++) {
            if (i !== 0) {
                d += dist2(profile[i], profile[i - 1]) / 1000;
            }
            dz.push([d, profile[i][2]]);
        }

        const x = d3
            .scaleLinear()
            .domain([0, d])
            .range([margin.left, width - margin.right]);
        const y = d3
            .scaleLinear()
            .domain(d3.extent(dz, ([d, z]) => z) as [number, number])
            .nice()
            .range([height - margin.bottom, margin.top]);
        const area = d3
            .area()
            .x(([d, _]) => x(d))
            .y0(y.range()[0])
            .y1(([_, z]) => y(z));
        const line = d3
            .line()
            .x(([d, _]) => x(d))
            .y(([_, z]) => y(z));
        const svg = d3
            .create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);
        svg.append("path")
            .attr("fill", theme("secondary-light"))
            .attr("d", area(dz));
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", theme("secondary"))
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("d", line(dz));
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickFormat((v) => `${v} km`)
                    .ticks(width / 80)
                    .tickSizeOuter(0),
            );
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat((v) => v.toString())
                    .ticks(height / 30),
            )
            .call((g) => g.select(".domain").remove())
            .call((g) =>
                g
                    .selectAll(".tick line")
                    .clone()
                    .attr("x2", width - margin.left - margin.right)
                    .attr("stroke-opacity", 0.1),
            );
        const rule = svg
            .append("g")
            .append("line")
            .attr("y1", height)
            .attr("y2", 0)
            .attr("stroke", "black");
        const hideRule = () => rule.attr("transform", "translate(-1, 0)");
        hideRule();
        svg.on("pointerenter pointermove", (e) => {
            const ex = d3.pointer(e)[0];
            if (ex > x.range()[0] && ex < x.range()[1]) {
                rule.attr("transform", `translate(${ex}, 0)`);
            } else {
                hideRule();
            }
        });
        svg.on("click", (e) => {
            const d = x.invert(d3.pointer(e)[0]) * 1000;
            const p = along(
                route.flatMap((r) => r.path),
                d,
            );
            onSelect(p);
        });
        svg.on("pointerleave", () =>
            rule.attr("transform", "translate(-1, 0)"),
        );

        while (chartElement.firstChild) {
            chartElement.removeChild(chartElement.firstChild);
        }
        chartElement.appendChild(svg.node()!);
    });
</script>

<span>
    <Icon name="elevation" />
    Höhe (m.ü.M.)
    {#if loading}
        <span out:fade><Spinner inline /></span>
    {/if}
</span>
<div bind:this={chartElement} class:loading></div>

<style>
    div {
        transition: opacity 100ms;
    }

    .loading {
        opacity: 0.5;
    }
</style>
