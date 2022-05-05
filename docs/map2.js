var width2 = window.innerWidth * scale,
    height2 = 500 * scale;

var projection2 = d3.geoMercator()
    .center([20, 45])
    .scale(100);
    // .rotate([-180,0]);

var svg2 = d3.select("#container2").append("svg")
    .attr("width", width2)
    .attr("height", height2);

var path2 = d3.geoPath()
    .projection(projection2);

var g2 = svg2.append("g");

// load and display the World
d3.json("world.json").then(function(topology) {
    g2.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries)
           .features)
       .enter().append("path")
       .attr("d", path2)
       .attr('class', 'country2');

});

var zoom2 = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', function(event) {
          g2.selectAll('path')
           .attr('transform', event.transform);
});

svg2.call(zoom2);