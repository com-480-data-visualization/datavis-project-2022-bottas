/*New map.*/
var map = L.map('map').setView([47.811195, 13.033229], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiaGhpbGRhYSIsImEiOiJjbDM4bndzNGowMW9pM2pxbWo5aWdnMTR3In0.7VwzpEqRUIHqyO85CB3xJg'
}).addTo(map);

fetch("result.geojson")
.then(function(response) {
return response.json();
})
.then(function(data) {
L.geoJSON(data).addTo(map);
});

/*$.getJSON("hotel_loc.geoJSON", function (cities) { // pull data from external file
    L.geoJson(cities, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        switch (feature.properties.Remember) {
          case '1': return L.marker(latlng, {icon: visitedIcon});
          case '?': return L.marker(latlng, {icon: uncertainIcon});
          case '0': return L.marker(latlng, {icon: uncertainIcon});
        }
      }
    }).addTo(map);
  })*/