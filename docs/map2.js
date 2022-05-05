var width = window.innerWidth,
    height = 500;

var projection = d3.geoMercator()
    .center([20, 45])
    .scale(100);
    // .rotate([-180,0]);

var svg2 = d3.select("#container2").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath()
    .projection(projection);

var g2 = svg2.append("g");

// load and display the World
d3.json("world.json").then(function(topology) {
    g2.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries)
           .features)
       .enter().append("path")
       .attr("d", path)
       .attr('class', 'country2');

});

var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function(event) {
          g2.selectAll('path')
           .attr('transform', event.transform);
});

svg2.call(zoom);