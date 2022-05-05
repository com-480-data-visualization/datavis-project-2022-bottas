var width = 800,
    height = 500;

var projection = d3.geoMercator()
    .center([20, 45])
    .scale(800);
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
       .attr("d", path);

});

var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function(event) {
          g.selectAll('path')
           .attr('transform', event.transform);
});

svg.call(zoom);