// svg size
var scale = 0.8
var svg_width = window.innerWidth * scale,
    svg_height = 500 * scale;

var geo_json;
var current_transform = null;
var hotel_name_to_lonlat = {};

var geo_projection = d3.geoMercator()
    .center([20, 45])
    .scale(100);

var map_svg = d3.select("#container2").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height);
var path2 = d3.geoPath()
    .projection(geo_projection);
var g_countries = map_svg.append("g");
var g_hotels = map_svg.append("g");
var hotel_tooltip = d3.select("body").append("div")
     .attr("class", "tooltip-hotel")
     .style("opacity", 0);
var line_tooltip = d3.select("body").append("div")
     .attr("class", "tooltip-line")
     .style("opacity", 0);

// add hotel markings
$.getJSON("./data/json_world_map/hotel_loc.json", function(markers) {
    g_hotels.selectAll("myCircles")
    .data(markers)
    .join("circle")
        .attr("cx", d => geo_projection([d.lng, d.lat])[0])
        .attr("cy", d => geo_projection([d.lng, d.lat])[1])
        .attr("r", 5)
        .attr("id", d => d.Hotel_Name)
        .attr("class", "circle")
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
        .style('vector-effect', 'non-scaling-stroke')
        .on('click', function(d, i) {
            // get position of svg on webpage
            let matrix = this.getScreenCTM().translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));

            current_hotel = this.id;
            draw_lines(current_hotel);
            draw_colors(current_hotel);

            hotel_tooltip.html("Current Hotel:  " + current_hotel).style("opacity", 1)
            .style("left", 
                   (window.pageXOffset + matrix.e - this.getAttribute("cx")) + "px")
            .style("top",
                   (window.pageYOffset + matrix.f - this.getAttribute("cy") + 30) + "px");
        });

    markers.forEach(function(d) {
        hotel_name_to_lonlat[d.Hotel_Name] = [d.lng, d.lat];  
    })
});

// load and display the World
d3.json("./data/json_world_map/countries-110m.json").then(function(topology) {
    g_countries.selectAll("path")
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
d3.json("./data/json_world_map/countries.geojson").then(function(json) {
    json.features.forEach(function(d) {
        country_to_lonlat[d.properties.COUNTRY] = d.geometry.coordinates;
    }
    );
});


function draw_lines(hotel) {
d3.json('./data/json_world_map/reviewer_nationalities.json').then(function(json) {
    map_svg.selectAll('line').remove();

    current_hotel_lonlat = hotel_name_to_lonlat[hotel];

    json.forEach(function(d) {
        if (d.Hotel_Name == hotel) {
            //console.log(d);
            country_lonlat = country_to_lonlat[d.Reviewer_Nationality];
            map_svg.append("line").attr("x1", geo_projection(country_lonlat)[0])
            .attr("y1", geo_projection(country_lonlat)[1])
            .attr("x2", geo_projection(current_hotel_lonlat)[0])
            .attr("y2", geo_projection(current_hotel_lonlat)[1])
            .style('stroke', 'black').style('stroke-width',  Math.log(0.2*d.Number)).style('vector-effect', 'non-scaling-stroke')
            .attr('id', d.Reviewer_Nationality).attr('no_reviewers', d.Number).attr('transform', current_transform);
        }
    });

    let lines = map_svg.selectAll('line');
    
    lines.on('mouseover', function (d, i) {
        let line = d3.select(this);
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '.85');
        line_tooltip.transition()
            .duration(50)
            .style("opacity", 1);
        line_tooltip.html(this.id + ': ' + line.attr('no_reviewers')).style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
   .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
        line_tooltip.transition()
             .duration('50')
             .style("opacity", 0);    
        });
    });

    map_svg.call(zoom2);
};

// change colors based on number of reviewers from that country
function draw_colors(hotel) {
    d3.json('./data/json_world_map/reviewer_nationalities.json').then(function(json) {
        var myColor = d3.scaleSequential().domain([0,6]).interpolator(d3.interpolateViridis);    
            
                    g_countries.selectAll("path")
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
    map_svg.call(zoom2);
};


// Zoom while keeping circles on same size
var zoom2 = d3.zoom()
      .scaleExtent([1, 500])
      .on('zoom', function(event) {
          g_countries.attr('transform', event.transform);
          g_hotels.attr('transform', event.transform);
          const new_r = 5/event.transform.k;
          g_hotels.selectAll('circle').attr("r", new_r);
          map_svg.selectAll("line").attr('transform', event.transform);
          current_transform = event.transform;
});

map_svg.call(zoom2);
