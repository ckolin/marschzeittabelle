<script lang="ts">
    import * as d3 from "d3";
    import type { RouteSegment } from "../lib/routing";
    import { fetchProfile } from "../lib/geoadmin";
    import { along2, dist2, type Line3, type Point2 } from "../lib/points";
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
                d += dist2(profile[i], profile[i - 1]);
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

        const svg = d3
            .create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        const area = d3
            .area()
            .x(([d, _]) => x(d))
            .y0(y.range()[0])
            .y1(([_, z]) => y(z));
        const grad = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "grad")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");
        grad.append("stop")
            .attr("class", "start")
            .attr("offset", "0%")
            .attr("stop-color", theme("secondary"))
            .attr("stop-opacity", 0.2);
        grad.append("stop")
            .attr("class", "end")
            .attr("offset", "100%")
            .attr("stop-color", theme("secondary"))
            .attr("stop-opacity", 0.2);
        svg.append("path").attr("fill", "url(#grad)").attr("d", area(dz));

        const line = d3
            .line()
            .x(([d, _]) => x(d))
            .y(([_, z]) => y(z));
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
                    .tickFormat((v: any) => `${v / 1000} km`)
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

        const hide = (e: any) => e.attr("display", "none");
        const show = (e: any) => e.attr("display", null);

        const rule = svg
            .append("g")
            .append("line")
            .attr("y1", height)
            .attr("y2", 0)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        hide(rule);

        const tip = svg.append("g");
        const tipRect = tip
            .append("rect")
            .attr("fill", "black")
            .attr("rx", 2)
            .attr("ry", 2);
        const tipText = tip
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "white");
        hide(tip);

        svg.on("pointerenter pointermove", (e) => {
            const ex = d3.pointer(e)[0];
            const d = x.invert(ex);
            const pz = along2(profile, d)[2];
            if (ex > x.range()[0] && ex < x.range()[1]) {
                show(rule);
                rule.attr("transform", `translate(${ex}, 0)`);
                show(tip);
                tipText.text(Math.round(pz));
                const bbox = tipText.node()!.getBBox();
                const px = 2;
                tipRect
                    .attr("x", bbox.x - px)
                    .attr("y", bbox.y)
                    .attr("width", bbox.width + 2 * px)
                    .attr("height", bbox.height);
                tip.attr(
                    "transform",
                    `translate(${ex}, ${y(pz) + bbox.width * 0.2})`,
                );
            } else {
                hide(rule);
                hide(tip);
            }
        });
        svg.on("click", (e) => {
            const d = x.invert(d3.pointer(e)[0]);
            const [px, py] = along2(profile, d);
            onSelect([px, py]);
        });
        svg.on("pointerleave", () => {
            hide(rule);
            hide(tip);
        });

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
