const marginParallel = { top: 50, right: 50, bottom: 10, left: 50 };
const widthParallel = 1000 - marginParallel.left - marginParallel.right;
const heightParallel = 400 - marginParallel.top - marginParallel.bottom;

const svgParallel = d3.select("#parallelPlot")
  .append("svg")
  .attr("width", widthParallel + marginParallel.left + marginParallel.right)
  .attr("height", heightParallel + marginParallel.top + marginParallel.bottom)
  .append("g")
  .attr("transform", `translate(${marginParallel.left},${marginParallel.top})`);

// ✅ Debug rectangle to confirm SVG is rendering
// svgParallel.append("rect")
//    .attr("width", widthParallel)
//    .attr("height", heightParallel)
//    .attr("fill", "lightgrey")
//    .attr("opacity", 0.1);

d3.csv("data/a1-cereals.csv").then(data => {
  console.log("✅ Loaded rows:", data.length);
  console.log("🔍 First row:", data[0]);

  const dimensions = ["Calories", "Protein", "Fat", "Sodium", "Fiber", "Sugars", "Carbohydrates"];

  data.forEach(d => {
    dimensions.forEach(col => {
      d[col] = +d[col];  // convert strings to numbers
    });
  });

  console.log("📊 Parsed example:", data[0]);

  // Check for NaN values
  const validData = data.filter(d => dimensions.every(col => !isNaN(d[col])));
  console.log("✅ Valid rows after filtering NaN:", validData.length);

  // Y scale for each dimension
  const y = {};
  for (let dim of dimensions) {
    y[dim] = d3.scaleLinear()
      .domain(d3.extent(validData, d => d[dim]))
      .range([height, 0]);
  }

  // X scale (position of axes)
  const x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // Path generator for a row
  function path(d) {
    return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
  }

  // Draw data lines
  svgParallel.selectAll("path")
    .data(validData)
    .enter().append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("opacity", 0.4);

  // Draw axis for each dimension
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
})
.catch(error => {
  console.error("❌ CSV Load Error:", error);
});
