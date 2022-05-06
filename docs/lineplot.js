let svg_line = d3.select("#lineplot").append("svg").attr("width", 700).attr("height", 300)

let y_scale = d3.scaleLinear().domain([10,0]).range([50,250]);
let y_axis = d3.axisRight()
.scale(y_scale);
svg_line.append("g").attr("transform", "translate(50, 0)").call(y_axis);

let x_scale = d3.scaleTime().domain([new Date("2015-01-01T00:01"), new Date("2017-12-31T00:01")])
.range([50, 650]);
let x_axis = d3.axisBottom().scale(x_scale);
svg_line.append("g").attr("transform", "translate(0, 250)").attr("fill", "black").call(x_axis);
console.log(x_scale(new Date("2015-01-02T00:01")));

svg_line.append("line").style("stroke", "black")
.style("stroke-width", 1.5)
.attr("x1", 50)
.attr("y1", 100)
.attr("x2", 650)
.attr("y2", 100); 

svg_line.append("rectangle").attr("width", 700).attr("height", 300)
.attr("style", "fill:rgb(255,255,255);stroke-width:3;stroke:rgb(0,0,0)");


