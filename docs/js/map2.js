var scale = 0.8
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

var current_hotel = "Doubletree by Hilton London Kensington";
var current_transform = null;

var div_hotel = d3.select("body").append("div")
     .attr("class", "tooltip-hotel")
     .style("opacity", 0);
var hotel_name_to_lonlat = {};
var hotel_locs = $.getJSON("./json_world_map/hotel_loc.json", function(markers) {
    g3.selectAll("myCircles")
    .data(markers)
    .join("circle")
        .attr("cx", d => projection2([d.lng, d.lat])[0])
        .attr("cy", d => projection2([d.lng, d.lat])[1])
        .attr("r", 5)
        .attr("id", d => d.Hotel_Name)
        .attr("class", "circle")
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
        .style('vector-effect', 'non-scaling-stroke')
        .on('click', function(d, i) {
            let matrix = this.getScreenCTM().translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));
            current_hotel = this.id;
            draw_lines(current_hotel);
            draw_colors(current_hotel);
            div_hotel.html(current_hotel).style("opacity", 1)
            .style("left", 
                   (window.pageXOffset + matrix.e) + "px")
            .style("top",
                   (window.pageYOffset + matrix.f + 30) + "px");
        });
    markers.forEach(function(d) {
        hotel_name_to_lonlat[d.Hotel_Name] = [d.lng, d.lat];  
    })
});

// load and display the World
d3.json("./json_world_map/countries-110m.json").then(function(topology) {
    g2.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries)
           .features)
       .enter().append("path")
       .attr("d", path2)
       .attr('class', d => d.properties.name)
       .style("fill", ()=> "grey");
});

// Create mapping of countries to their centroids
// data from https://github.com/gavinr/world-countries-centroids
var country_to_lonlat = {};
d3.json("./json_world_map/countries.geojson").then(function(json) {
    json.features.forEach(function(d) {
        country_to_lonlat[d.properties.COUNTRY] = d.geometry.coordinates;
    }
    );
});

var div = d3.select("body").append("div")
     .attr("class", "tooltip-line")
     .style("opacity", 0);


function draw_lines(hotel) {
d3.json('./json_world_map/reviewer_nationalities.json').then(function(json) {
    svg2.selectAll('line').remove();

    current_hotel_lonlat = hotel_name_to_lonlat[hotel];

    json.forEach(function(d) {
        if (d.Hotel_Name == hotel) {
            //console.log(d);
            country_lonlat = country_to_lonlat[d.Reviewer_Nationality];
            svg2.append("line").attr("x1", projection2(country_lonlat)[0])
            .attr("y1", projection2(country_lonlat)[1])
            .attr("x2", projection2(current_hotel_lonlat)[0])
            .attr("y2", projection2(current_hotel_lonlat)[1])
            .style('stroke', 'black').style('stroke-width',  Math.log(0.2*d.Number)).style('vector-effect', 'non-scaling-stroke')
            .attr('id', d.Reviewer_Nationality).attr('no_reviewers', d.Number).attr('transform', current_transform);
        }
    });

    let lines = svg2.selectAll('line');
    
    lines.on('mouseover', function (d, i) {
        let line = d3.select(this);
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '.85');
        div.transition()
            .duration(50)
            .style("opacity", 1);
        div.html(this.id + ': ' + line.attr('no_reviewers')).style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
   .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
        div.transition()
             .duration('50')
             .style("opacity", 0);    
});
});

svg2.call(zoom2);
};

function draw_colors(hotel) {
d3.json('./json_world_map/reviewer_nationalities.json').then(function(json) {
    var myColor = d3.scaleSequential().domain([0,6]).interpolator(d3.interpolateViridis);    
        
                g2.selectAll("path")
                    .style("fill", function(g){
                        for (const d of json) {
                            if (d.Hotel_Name == hotel) {
                                if (d.Reviewer_Nationality == g.properties.name){
                                    console.log(myColor(d.Number));
                                    return myColor(Math.log(d.Number));
                                    };    
                                } 
                        };
                        return myColor(0);
                    })
})
svg2.call(zoom2);
};


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
          const new_r = 5/event.transform.k;
          g3.selectAll('circle').attr("r", new_r);
          svg2.selectAll("line").attr('transform', event.transform);
          current_transform = event.transform;
          //g3.selectAll("circle").attr("r", 5/event.transform.k);
});

draw_lines(current_hotel);
draw_colors(current_hotel);
svg2.call(zoom2);

let hotels = g3.selectAll("*");
for (const hotel of hotels) {
    console.log(hotel);
}
