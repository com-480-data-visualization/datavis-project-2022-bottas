// Setting up the svg element for D3 to draw in
let width = 1000, height = 1000

let svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height)

let europeProjection = d3.geoMercator()
  .center([ 13, 52 ])
  .scale([ width / 1.5 ])
  .translate([ width / 2, height / 2 ])


pathGenerator = d3.geoPath().projection(europeProjection)
geoJsonUrl = "https://gist.githubusercontent.com/spiker830/3eab0cb407031bf9f2286f98b9d0558a/raw/7edae936285e77be675366550e20f9166bed0ed5/europe_features.json"


d3.json(geoJsonUrl).then(geojson => {
    // Tell D3 to render a path for each GeoJSON feature
    svg.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator) // This is where the magic happens
      .attr("stroke", "grey") // Color of the lines themselves
      .attr("fill", "white") // Color uses to fill in the lines
  })

