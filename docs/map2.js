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
var g3 = svg2.append("g");

var hotel_locs = $.getJSON("hotel_loc.json", function(markers) {
    g3.selectAll("myCircles")
    .data(markers)
    .join("circle")
        .attr("cx", d => projection2([d.lng, d.lat])[0])
        .attr("cy", d => projection2([d.lng, d.lat])[1])
        .attr("r", 5)
        .attr("class", "circle")
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4);
});

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
      .scaleExtent([1, 500])
      .on('zoom', function(event) {
          //g2.selectAll('path')
          // .attr('transform', event.transform);
          g2.attr('transform', event.transform);
          //var newX = event.transform.rescale(projection2);
          //var newY = event.transform.rescaleY(projection2);
          g3.attr('transform', event.transform);
          g3.selectAll('circle').attr("r", 5/event.transform.k).attr("stroke-width", 3/event.transform.k);
          //g3.selectAll("circle").attr("r", 5/event.transform.k);
          console.log(event.transform);
});

svg2.call(zoom2);