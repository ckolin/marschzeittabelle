<script>
    import * as d3 from "../modules/d3";
    import { distance } from "../modules/vec";
    import { getTheme } from "../modules/theme";

    export let width = 750;
    export let height = 200;
    export let route;

    let chartElement;

    $: {
        const theme = getTheme();
        const margin = {
            top: 10,
            right: 20,
            bottom: 20,
            left: 40,
        };

        const dz = [];
        let d = 0;
        for (let i = 0; i < route.lineProfile.length; i++) {
            if (i !== 0) {
                d += distance(
                    route.lineProfile[i].point,
                    route.lineProfile[i - 1].point,
                );
            }
            dz.push([d, route.lineProfile[i].height]);
        }

        const x = d3
            .scaleLinear()
            .domain([0, d])
            .range([margin.left, width - margin.right]);
        const y = d3
            .scaleLinear()
            .domain(d3.extent(dz, ([, z]) => z))
            .nice()
            .range([height - margin.bottom, margin.top]);

        const svg = d3
            .create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        const area = d3
            .area()
            .x(([d]) => x(d))
            .y0(y.range()[0])
            .y1(([, z]) => y(z));
        svg.append("path")
            .attr("fill", theme.lighterAccentColor)
            .attr("d", area(dz));

        const line = d3
            .line()
            .x(([d]) => x(d))
            .y(([, z]) => y(z));
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", theme.accentColor)
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("d", line(dz));

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickFormat((v) => `${v / 1000} km`)
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
                    .attr("stroke-opacity", 0.25),
            );

        for (let i = 0; i < route.markerProfile.length; i++) {
            const g = svg
                .append("g")
                .attr(
                    "transform",
                    `translate(${x(route.distanceSum[route.markers[i].index])}, ${y(route.markerProfile[i].height)})`,
                );
            g.append("circle")
                .attr("r", 8)
                .attr("fill", theme.darkerAccentColor);
            g.append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("fill", theme.backgroundColor)
                .text(i + 1)
                .style("font-weight", "bold")
                .style("font-size", "12px");
        }

        while (chartElement?.firstChild) {
            chartElement?.removeChild(chartElement.firstChild);
        }
        chartElement?.appendChild(svg.node());
    }
</script>

<div bind:this={chartElement} class="chart"></div>

<style>
    @media print {
        .chart {
            max-width: 100%;
        }
    }
</style>
