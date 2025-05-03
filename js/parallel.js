const marginParallel = { top: 50, right: 50, bottom: 10, left: 50 };
const widthParallel = 1000 - marginParallel.left - marginParallel.right;
const heightParallel = 400 - marginParallel.top - marginParallel.bottom;

const svgParallel = d3.select("#parallelPlot")
  .append("svg")
  .attr("width", widthParallel + marginParallel.left + marginParallel.right)
  .attr("height", heightParallel + marginParallel.top + marginParallel.bottom)
  .append("g")
  .attr("transform", `translate(${marginParallel.left},${marginParallel.top})`);

d3.csv("data/a1-cereals.csv").then(data => {
  const dimensions = ["Calories", "Protein", "Fat", "Sodium", "Fiber", "Sugars", "Carbohydrates"];

  data.forEach(d => {
    dimensions.forEach(col => d[col] = +d[col]);
    d.name = d["Cereal"];
    d.brand = d["Manufacturer"];
  });

  const validData = data.filter(d => dimensions.every(col => !isNaN(d[col])));

  const y = {};
  for (let dim of dimensions) {
    y[dim] = d3.scaleLinear().domain(d3.extent(validData, d => d[dim])).range([heightParallel, 0]);
  }

  const x = d3.scalePoint().range([0, widthParallel]).padding(1).domain(dimensions);

  function path(d) {
    return d3.line().curve(d3.curveMonotoneX)(dimensions.map(p => [x(p), y[p](d[p])]));
  }

  svgParallel.selectAll("path")
    .data(validData)
    .enter().append("path")
    .attr("id", d => `parallel-${d.name.replace(/\s+/g, '_')}`)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1)
    .style("transition", "stroke 0.2s, stroke-width 0.2s");

  const dimensionGroup = svgParallel.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", d => `translate(${x(d)})`);

  dimensionGroup.each(function(d) {
    d3.select(this).call(d3.axisLeft(y[d]));
  });

  dimensionGroup.append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(d => d)
    .style("fill", "black");

  dimensionGroup.append("g")
    .attr("class", "brush")
    .each(function(d) {
      d3.select(this).call(d3.brushY()
        .extent([[-10, 0], [10, heightParallel]])
        .on("brush end", brush));
    });

  function brush(event) {
    const actives = [];
    svgParallel.selectAll(".brush")
      .filter(function(d) { return d3.brushSelection(this); })
      .each(function(d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this).map(y[d].invert)
        });
      });

    const selected = validData.filter(d =>
      actives.every(active => d[active.dimension] >= Math.min(...active.extent) &&
                              d[active.dimension] <= Math.max(...active.extent))
    );

    d3.selectAll("#scatterPlot circle")
      .style("opacity", d => selected.some(s => s.name === d.name) ? 1 : 0.1);

    const selectedBrands = [...new Set(selected.map(d => d.brand))];
    d3.selectAll("#brandChart rect")
      .style("opacity", d => selectedBrands.includes(d[0]) ? 1 : 0.2);
  }

  const zoomParallel = d3.zoom()
    .scaleExtent([1, 5])
    .translateExtent([[0, 0], [widthParallel, heightParallel]])
    .on("zoom", (event) => {
      svgParallel.attr("transform", event.transform);
    });

  d3.select("#parallelPlot svg").call(zoomParallel);
});
