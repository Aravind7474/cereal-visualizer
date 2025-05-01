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
  });

  const validData = data.filter(d => dimensions.every(col => !isNaN(d[col])));

  const y = {};
  for (let dim of dimensions) {
    y[dim] = d3.scaleLinear()
      .domain(d3.extent(validData, d => d[dim]))
      .range([heightParallel, 0]);
  }

  const x = d3.scalePoint()
    .range([0, widthParallel])
    .padding(1)
    .domain(dimensions);

  function path(d) {
    return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
  }

  svgParallel.selectAll("path")
    .data(validData)
    .enter().append("path")
    .attr("id", d => `parallel-${d.name.replace(/\s+/g, '_')}`)
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("opacity", 0.4);

  svgParallel.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", d => `translate(${x(d)})`)
    .each(function(d) {
      d3.select(this).call(d3.axisLeft(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(d => d)
    .style("fill", "black");
});
