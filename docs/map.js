var scale = 0.8;

var width = window.innerWidth * scale,
    height = 500 * scale;

var projection = d3.geoMercator()
    .center([20, 45])
    .scale(300);
    // .rotate([-180,0]);

var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

// load and display the World
d3.json("eu.json").then(function(topology) {

    g.selectAll("path")
       .data(topojson.feature(topology, topology.objects.europe)
           .features)
       .enter().append("path")
       .attr("d", path)
       .attr('class', 'country');

});

var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function(event) {
          g.selectAll('path')
           .attr('transform', event.transform);
});


//sample places
/*const markers = [
    {lng: 9.083, lat: 42.149, name: "Corsica"}, // corsica
    {lng: 7.26, lat: 43.71, name: "Nice"}, // nice
    {lng: 2.349, lat: 48.864, name: "Paris"}, // Paris
    {lng: -1.397, lat: 43.664, name: "Hossegor"}, // Hossegor
    {lng: 3.075, lat: 50.640, name: "Lille"}, // Lille
    {lng: -3.83, lat: 58, name: "Morlaix"}, // Morlaix
  ];*/

//const markers = JSON.parse("hotel_loc.json");

console.log(hotel_locs);

// create a tooltip
const Tooltip = d3.select("container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 1)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
const mouseover = function(event, d) {
Tooltip.style("opacity", 1)
}
var mousemove = function(event, d) {
Tooltip
    .html(d.Hotel_Name + "<br>" + "long: " + d.lng + "<br>" + "lat: " + d.lat)
    .style("left", (event.x)/2 + "px")
    .style("top", (event.y)/2 - 30 + "px")
}
var mouseleave = function(event, d) {
Tooltip.style("opacity", 0)
}

var hotel_locs = $.getJSON("hotel_loc.json", function(markers) {
    svg.selectAll("myCircles")
    .data(markers)
    .join("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1])
        .attr("r", 14)
        .attr("class", "circle")
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
});

// Add circles:
/*svg
    .selectAll("myCircles")
    .data(markers)
    .join("circle")
        .attr("cx", d => projection([d.lng, d.lat])[0])
        .attr("cy", d => projection([d.lng, d.lat])[1])
        .attr("r", 14)
        .attr("class", "circle")
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
*/

svg.call(zoom);