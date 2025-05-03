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
    d.brand = d["Manufacturer"];
  });

  const filtered = data.filter(d => !isNaN(d.sugars) && !isNaN(d.fiber));

  const x = d3.scaleLinear().domain([0, d3.max(filtered, d => d.sugars)]).nice().range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(filtered, d => d.fiber)]).nice().range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  svg.append("text").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text("Sugar (grams)");
  svg.append("text").attr("x", -height / 2).attr("y", -40).attr("transform", "rotate(-90)").attr("text-anchor", "middle").text("Fiber (grams)");

  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  const circles = svg.selectAll("circle")
    .data(filtered)
    .enter().append("circle")
    .attr("id", d => `scatter-${d.name.replace(/\s+/g, '_')}`)
    .attr("cx", d => x(d.sugars))
    .attr("cy", d => y(d.fiber))
    .attr("r", 5)
    .attr("fill", "#4A90E2")
    .attr("opacity", 0.85)
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.95);
      tooltip.html(`<b>${d.name}</b><br>Sugar: ${d.sugars}<br>Fiber: ${d.fiber}`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 30) + "px");
      d3.select(event.currentTarget)
        .transition().duration(150)
        .attr("r", 8).attr("fill", "#E94E77");
      d3.select(`#parallel-${d.name.replace(/\s+/g, '_')}`)
        .raise().style("stroke", "#E94E77").style("stroke-width", 3);
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().duration(300).style("opacity", 0);
      d3.select(event.currentTarget)
        .transition().duration(150)
        .attr("r", 5).attr("fill", "#4A90E2");
      d3.select(`#parallel-${d.name.replace(/\s+/g, '_')}`)
        .style("stroke", "steelblue").style("stroke-width", 1).style("opacity", 0.4);
    });

  const brush = d3.brush().extent([[0, 0], [width, height]]).on("brush end", brushed);

  svg.append("g").attr("class", "brush").call(brush);

  function brushed(event) {
    const selection = event.selection;
    if (!selection) {
      d3.selectAll("#parallelPlot path").style("opacity", 0.4);
      d3.selectAll("#brandChart rect").style("opacity", 1);
      return;
    }
    const [[x0, y0], [x1, y1]] = selection;
    const selected = filtered.filter(d => {
      const xVal = x(d.sugars);
      const yVal = y(d.fiber);
      return xVal >= x0 && xVal <= x1 && yVal >= y0 && yVal <= y1;
    });
    d3.selectAll("#parallelPlot path")
      .style("opacity", d => selected.some(s => s.name === d.name) ? 1 : 0.1);
    const selectedBrands = [...new Set(selected.map(d => d.brand))];
    d3.selectAll("#brandChart rect")
      .style("opacity", d => selectedBrands.includes(d[0]) ? 1 : 0.2);
  }

  const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [width, height]]).on("zoom", (event) => {
    svg.attr("transform", event.transform);
  });

  d3.select("#scatterPlot svg").call(zoom);
});
