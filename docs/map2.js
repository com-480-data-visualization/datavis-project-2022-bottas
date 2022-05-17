var width2 = window.innerWidth * scale,
    height2 = 500 * scale;

var geo_json = null;

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


var hotel_name_to_lonlat = {};
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
    markers.forEach(function(d) {
        hotel_name_to_lonlat[d.Hotel_Name] = [d.lng, d.lat];  
    })
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

// Create mapping of countries to their centroids
// data from https://github.com/gavinr/world-countries-centroids
var country_to_lonlat = {};
d3.json("countries.geojson").then(function(json) {
    json.features.forEach(function(d) {
        country_to_lonlat[d.properties.COUNTRY] = d.geometry.coordinates;
    }
    );
});
console.log(country_to_lonlat);

const current_hotel = "Kube Hotel Ice Bar";

d3.json('reviewer_nationalities.json').then(function(json) {
    current_hotel_lonlat = hotel_name_to_lonlat[current_hotel];

    json.forEach(function(d) {
        if (d.Hotel_Name == current_hotel) {
            country_lonlat = country_to_lonlat[d.Reviewer_Nationality]
            svg2.append("line").attr("x1", projection2(country_lonlat)[0])
            .attr("y1", projection2(country_lonlat)[1])
            .attr("x2", projection2(current_hotel_lonlat)[0])
            .attr("y2", projection2(current_hotel_lonlat)[1])
            .style('stroke', 'black').style('stroke-width', 0.5*d.Number);
            console.log();
            console.log(d.Number);            
        }
    })
}
)

// Zoom while keeping circles on same size
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
          svg2.selectAll("line").attr('transform', event.transform);
          //g3.selectAll("circle").attr("r", 5/event.transform.k);
});

svg2.call(zoom2);