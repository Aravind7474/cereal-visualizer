const marginParallel = { top: 60, right: 50, bottom: 10, left: 50 };
const widthParallel = 800 - marginParallel.left - marginParallel.right;
const heightParallel = 400 - marginParallel.top - marginParallel.bottom;

const svgParallel = d3.select("#parallelPlot").append("svg")
  .attr("width", widthParallel + marginParallel.left + marginParallel.right)
  .attr("height", heightParallel + marginParallel.top + marginParallel.bottom)
  .append("g")
  .attr("transform", `translate(${marginParallel.left},${marginParallel.top})`);

svgParallel.append("text")
  .attr("x", widthParallel / 2)
  .attr("y", -40)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .text("Parallel Coordinates: Nutrient Profiles");

d3.csv("data/a1-cereals.csv").then(data => {
  const dimensions = ["Calories", "Protein", "Fat", "Sodium", "Fiber", "Sugars", "Carbohydrates"];

  data.forEach(d => {
    dimensions.forEach(col => d[col] = +d[col]);
    d.name = d.Cereal;
    d.brand = d.Manufacturer;
  });

  const y = {};
  dimensions.forEach(dim => {
    y[dim] = d3.scaleLinear().domain(d3.extent(data, d => d[dim])).range([heightParallel, 0]);
  });

  const x = d3.scalePoint().domain(dimensions).range([0, widthParallel]).padding(1);

  const paths = svgParallel.selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("id", d => `parallel-${d.name.replace(/\s+/g, '_')}`)
    .attr("d", d => d3.line()(dimensions.map(p => [x(p), y[p](d[p])])))
    .attr("fill", "none")
    .attr("stroke", d => window.colorScale(d.brand))
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      d3.select(`#scatter-${d.name.replace(/\s+/g, '_')}`)
        .attr("r", 8)
        .attr("fill", "#E94E77");
    })
    .on("mouseout", (event, d) => {
      d3.select(`#scatter-${d.name.replace(/\s+/g, '_')}`)
        .attr("r", 5)
        .attr("fill", window.colorScale(d.brand));
    });

  const dimensionGroup = svgParallel.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", d => `translate(${x(d)})`);

  dimensionGroup.each(function(d) {
    d3.select(this).call(d3.axisLeft(y[d]));
  });

  // ✅ axis labels (above axes, no collision)
  dimensionGroup.append("text")
    .attr("x", 0)
    .attr("y", -12)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .text(d => d);

  function brushParallel(event, dim) {
    const actives = [];
    svgParallel.selectAll(".brush")
      .filter(function() { return d3.brushSelection(this); })
      .each(function(d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this).map(y[d].invert)
        });
      });

    const selectedNames = data.filter(d =>
      actives.every(active =>
        d[active.dimension] >= Math.min(...active.extent) &&
        d[active.dimension] <= Math.max(...active.extent))
    ).map(d => d.name);

    d3.selectAll("#scatterPlot circle").each(function() {
      const c = d3.select(this).datum();
      d3.select(this).style("opacity", selectedNames.includes(c.name) ? 1 : 0.1);
    });

    d3.selectAll("#brandChart rect").each(function() {
      const r = d3.select(this).datum();
      const match = data.some(s => s.brand === r[0] && selectedNames.includes(s.name));
      d3.select(this).style("opacity", match ? 1 : 0.2);
    });
  }

  svgParallel.selectAll(".brush")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "brush")
    .attr("transform", d => `translate(${x(d)})`)
    .each(function(d) {
      d3.select(this).call(d3.brushY()
        .extent([[-10, 0], [10, heightParallel]])
        .on("brush end", function(event) { brushParallel(event, d); }));
    });

  window.parallelZoom = d3.zoom()
    .scaleExtent([1, 5])
    .translateExtent([[0, 0], [widthParallel, heightParallel]])
    .on("zoom", (event) => {
      svgParallel.attr("transform", event.transform);
    });

  d3.select("#parallelPlot svg").call(window.parallelZoom);

  d3.select("#resetParallel").on("click", () => {
    svgParallel.selectAll(".brush").call(d3.brushY().move, null);
    d3.selectAll("#parallelPlot path").style("opacity", 0.4);
    d3.select("#parallelPlot svg").transition().duration(500).call(window.parallelZoom.transform, d3.zoomIdentity);
  });
});
