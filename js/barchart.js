const marginBar = { top: 60, right: 30, bottom: 100, left: 60 };
const widthBar = 800 - marginBar.left - marginBar.right;
const heightBar = 400 - marginBar.top - marginBar.bottom;

const svgBar = d3.select("#brandChart").append("svg")
  .attr("width", widthBar + marginBar.left + marginBar.right)
  .attr("height", heightBar + marginBar.top + marginBar.bottom)
  .append("g")
  .attr("transform", `translate(${marginBar.left},${marginBar.top})`);

svgBar.append("text")
  .attr("x", widthBar / 2)
  .attr("y", -30)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .text("Average Calories by Brand");

d3.csv("data/a1-cereals.csv").then(data => {
  const brandStats = d3.rollups(
    data,
    v => ({
      avgCalories: d3.mean(v, d => +d.Calories),
      cereals: v.map(d => d.Cereal)
    }),
    d => d.Manufacturer
  );

  const x = d3.scaleBand().domain(brandStats.map(d => d[0])).range([0, widthBar]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(brandStats, d => d[1].avgCalories)]).nice().range([heightBar, 0]);

  svgBar.append("g")
    .attr("transform", `translate(0,${heightBar})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svgBar.append("g").call(d3.axisLeft(y));

  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  svgBar.selectAll("rect")
    .data(brandStats)
    .enter().append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1].avgCalories))
    .attr("width", x.bandwidth())
    .attr("height", d => heightBar - y(d[1].avgCalories))
    .attr("fill", d => window.colorScale(d[0]))
    .attr("opacity", 0.85)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 0.95)
        .html(`<b>${d[0]}</b><br>Avg Calories: ${d[1].avgCalories.toFixed(2)}<br>Cereals: ${d[1].cereals.length}`)
        .style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 30}px`);
      d3.select(event.currentTarget).transition().duration(150).attr("fill", "#E94E77").attr("opacity", 1);
    })
    .on("mouseout", (event, d) => {
      tooltip.style("opacity", 0);
      d3.select(event.currentTarget).transition().duration(150).attr("fill", window.colorScale(d[0])).attr("opacity", 0.85);
    })
    .on("click", (event, d) => {
      const cereals = d[1].cereals;
      d3.selectAll("#scatterPlot circle").each(function () {
        const c = d3.select(this).datum();
        d3.select(this).style("opacity", cereals.includes(c.name) ? 1 : 0.1);
      });
      d3.selectAll("#parallelPlot path").each(function () {
        const p = d3.select(this).datum();
        d3.select(this).style("opacity", cereals.includes(p.name) ? 1 : 0.1);
      });
    });

  d3.select("#resetBar").on("click", () => {
    d3.selectAll("#brandChart rect").style("opacity", 0.85);
  });
});
