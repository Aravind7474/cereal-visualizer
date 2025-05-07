const margin = { top: 60, right: 40, bottom: 60, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#scatterPlot").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

svg.append("text")
  .attr("x", width / 2)
  .attr("y", -30)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .text("Scatter Plot: Select Axes");

let scatterData, xScale, yScale, circles, scatterZoom;

// ✅ FIRST define brushed()
function brushed(event) {
  const selection = event.selection;
  if (!selection) {
    d3.selectAll("#parallelPlot path").style("opacity", 0.4);
    d3.selectAll("#brandChart rect").style("opacity", 0.85);
    return;
  }
  const [[x0, y0], [x1, y1]] = selection;
  const xAttr = d3.select("#xAxisSelect").property("value");
  const yAttr = d3.select("#yAxisSelect").property("value");

  const selected = scatterData.filter(d => {
    const xVal = xScale(d[xAttr]);
    const yVal = yScale(d[yAttr]);
    return xVal >= x0 && xVal <= x1 && yVal >= y0 && yVal <= y1;
  });

  const selectedNames = selected.map(d => d.name);
  const selectedBrands = [...new Set(selected.map(d => d.brand))];

  d3.selectAll("#parallelPlot path").each(function () {
    const p = d3.select(this).datum();
    d3.select(this).style("opacity", selectedNames.includes(p.name) ? 1 : 0.1);
  });

  d3.selectAll("#brandChart rect").each(function () {
    const r = d3.select(this).datum();
    d3.select(this).style("opacity", selectedBrands.includes(r[0]) ? 1 : 0.2);
  });
}

const brush = d3.brush().extent([[0, 0], [width, height]]).on("brush end", brushed);

d3.csv("data/a1-cereals.csv").then(data => {
  const attributes = ["Calories", "Protein", "Fat", "Sodium", "Fiber", "Sugars", "Carbohydrates"];
  data.forEach(d => {
    attributes.forEach(attr => d[attr] = +d[attr]);
    d.name = d.Cereal;
    d.brand = d.Manufacturer;
  });

  scatterData = data;
  initializeZoom();
  updateScatter("Sugars", "Fiber");

  d3.select("#xAxisSelect").on("change", () => {
    updateScatter(d3.select("#xAxisSelect").property("value"), d3.select("#yAxisSelect").property("value"));
  });

  d3.select("#yAxisSelect").on("change", () => {
    updateScatter(d3.select("#xAxisSelect").property("value"), d3.select("#yAxisSelect").property("value"));
  });

  d3.select("#resetScatter").on("click", () => {
    svg.select(".brush").call(brush.move, null);
    svg.transition().duration(500).call(scatterZoom.transform, d3.zoomIdentity);
    svg.selectAll("circle").style("opacity", 0.85);
  });

  function updateScatter(xAttr, yAttr) {
    svg.selectAll(".axis").remove();
    svg.selectAll(".x-label").remove();
    svg.selectAll(".y-label").remove();
    svg.selectAll("circle").remove();
    svg.selectAll(".brush").remove();

    xScale = d3.scaleLinear().domain([0, d3.max(data, d => d[xAttr])]).nice().range([0, width]);
    yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[yAttr])]).nice().range([height, 0]);

    svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(yScale));

    svg.append("text").attr("class", "x-label").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text(xAttr);
    svg.append("text").attr("class", "y-label").attr("x", -height / 2).attr("y", -40).attr("transform", "rotate(-90)").attr("text-anchor", "middle").text(yAttr);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    circles = svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("id", d => `scatter-${d.name.replace(/\s+/g, '_')}`)
      .attr("cx", d => xScale(d[xAttr]))
      .attr("cy", d => yScale(d[yAttr]))
      .attr("r", 5)
      .attr("fill", d => window.colorScale(d.brand))
      .attr("opacity", 0.85)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.95).html(`<b>${d.name}</b><br>${xAttr}: ${d[xAttr]}<br>${yAttr}: ${d[yAttr]}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);
        const safeId = CSS.escape(`parallel-${d.name.replace(/\s+/g, '_')}`);
        d3.select(`#${safeId}`).raise().style("stroke", "#E94E77").style("stroke-width", 3);
      })
      .on("mouseout", (event, d) => {
        tooltip.style("opacity", 0);
        const safeId = CSS.escape(`parallel-${d.name.replace(/\s+/g, '_')}`);
        d3.select(`#${safeId}`).style("stroke", window.colorScale(d.brand)).style("stroke-width", 1);
      });

    svg.append("g").attr("class", "brush").call(brush);
    svg.transition().duration(500).call(scatterZoom.transform, d3.zoomIdentity);
  }

  function initializeZoom() {
    scatterZoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);
        svg.select(".x-axis").call(d3.axisBottom(newX));
        svg.select(".y-axis").call(d3.axisLeft(newY));
        circles.attr("cx", d => newX(d[d3.select("#xAxisSelect").property("value")]))
               .attr("cy", d => newY(d[d3.select("#yAxisSelect").property("value")]));
      });

    d3.select("#scatterPlot svg").call(scatterZoom);
  }
});
