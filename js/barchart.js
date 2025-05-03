const marginBar = { top: 50, right: 30, bottom: 100, left: 60 };
const widthBar = 800 - marginBar.left - marginBar.right;
const heightBar = 400 - marginBar.top - marginBar.bottom;

const svgBar = d3.select("#brandChart")
  .append("svg")
  .attr("width", widthBar + marginBar.left + marginBar.right)
  .attr("height", heightBar + marginBar.top + marginBar.bottom)
  .append("g")
  .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

d3.csv("data/a1-cereals.csv").then(data => {
  const brandStats = d3.rollups(
    data,
    v => ({
      avgMetric: d3.mean(v, d => +d["Calories"]),
      count: v.length,
      cereals: v.map(d => d["Cereal"])
    }),
    d => d["Manufacturer"]
  );

  const x = d3.scaleBand()
    .domain(brandStats.map(d => d[0]))
    .range([0, widthBar])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(brandStats, d => d[1].avgMetric)]).nice()
    .range([heightBar, 0]);

  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(brandStats.map(d => d[0]));

  svgBar.append("g")
    .attr("transform", `translate(0,${heightBar})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "11px");

  svgBar.append("g").call(d3.axisLeft(y));

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svgBar.selectAll("rect")
    .data(brandStats)
    .enter().append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1].avgMetric))
    .attr("width", x.bandwidth())
    .attr("height", d => heightBar - y(d[1].avgMetric))
    .attr("fill", d => color(d[0]))
    .attr("opacity", 0.85)
    .style("transition", "fill 0.2s, opacity 0.2s")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.95);
      tooltip.html(`<b>${d[0]}</b><br>Avg Calories: ${d[1].avgMetric.toFixed(2)}<br>Cereals: ${d[1].count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
      d3.select(event.currentTarget)
        .transition().duration(150)
        .attr("fill", "#E94E77")
        .attr("opacity", 1);
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().duration(300).style("opacity", 0);
      d3.select(event.currentTarget)
        .transition().duration(150)
        .attr("fill", color(d[0]))
        .attr("opacity", 0.85);
    })
    .on("click", (event, d) => {
      const cereals = d[1].cereals;

      d3.selectAll("#scatterPlot circle")
        .style("opacity", s => cereals.includes(s.name) ? 1 : 0.1);

      d3.selectAll("#parallelPlot path")
        .style("opacity", p => cereals.includes(p.name) ? 1 : 0.1);
    });
});
