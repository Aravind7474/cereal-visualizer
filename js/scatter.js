const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#scatterPlot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/a1-cereals.csv").then(data => {
  data.forEach(d => {
    d.sugars = +d["Sugars"];
    d.fiber = +d["Fiber"];
    d.name = d["Cereal"];
  });

  const filtered = data.filter(d => !isNaN(d.sugars) && !isNaN(d.fiber));

  const x = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.sugars)]).nice()
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.fiber)]).nice()
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Sugar (grams)");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Fiber (grams)");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll("circle")
    .data(filtered)
    .enter().append("circle")
    .attr("id", d => `scatter-${d.name.replace(/\s+/g, '_')}`)
    .attr("cx", d => x(d.sugars))
    .attr("cy", d => y(d.fiber))
    .attr("r", 5)
    .attr("fill", "#3498db")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`<strong>${d.name}</strong><br/>Sugar: ${d.sugars}<br/>Fiber: ${d.fiber}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");

      // 🔥 highlight matching parallel line
      d3.select(`#parallel-${d.name.replace(/\s+/g, '_')}`)
        .raise()
        .style("stroke", "orange")
        .style("stroke-width", 3);
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().duration(300).style("opacity", 0);

      d3.select(`#parallel-${d.name.replace(/\s+/g, '_')}`)
        .style("stroke", "steelblue")
        .style("stroke-width", 1)
        .style("opacity", 0.4);
    });
});
