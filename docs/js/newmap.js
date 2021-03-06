/*New map.*/
var hotel_data_filename = "data/json_eu_map/hotel_data.geojson"; // change this to the aws eventually
var map = L.map('map').setView([47.811195, 13.033229], 4);
var markerList;
var hotelData;
var current_lineplot_city = "whole";
var whatever_the_f_this_is = $.getJSON(hotel_data_filename);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  //attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiaGhpbGRhYSIsImEiOiJjbDM4bndzNGowMW9pM2pxbWo5aWdnMTR3In0.7VwzpEqRUIHqyO85CB3xJg'
}).addTo(map);

map.on('zoomend', function(event) {
  console.log(map.getZoom());
  if (current_lineplot_city != "whole" && map.getZoom() <= 7) {
    update_line("whole");
  }
})

// select visible hotels (currently unused)
function intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top);
  }
  
function getVisibleMarkers() {
    console.log('called');
    var cc = map.getContainer();
    var els = cc.getElementsByClassName('leaflet-marker-icon');
    var ccRect = cc.getBoundingClientRect();
    var visibles = [];
    for (var i = 0; i < els.length; i++) {
      var el = els.item(i);
      var elRect = el.getBoundingClientRect();
      intersectRect(ccRect, elRect) && visibles.push(el);
    }
    if (visibles.length > 0) return(visibles);
}

function getVisibleMarkerIDs(){
  ref = markerList;
  visible = getVisibleMarkers();

  var IDs = []
  for (let i = 0; i < visible.length; i++) {
    const ID = ref.indexOf(visible[i]);
    IDs.push(ID);
  }
  return IDs;
}

// helper functions
function Counter(array) {
  array.forEach(val => this[val] = (this[val] || 0) + 1);
}

function toList(dict){
  var arr = [];
  for (var key in dict) {
    if (dict.hasOwnProperty(key)) {
      arr.push( [ key, dict[key] ] );
    }
  }
  return arr;
}


// gets all the words from reviews of a list of hotel indexes
function getWords(cur_IDs){
  posWords = []
  negWords = []
  for (let i = 0; i < cur_IDs.length; i++) {
    var id = cur_IDs[i];
    var reviews = hotelData.features[id].properties.reviews
    for (let j = 0; j < reviews.length; j++) {
      posWords = posWords.concat(reviews[j].pos_review_words)
      negWords = negWords.concat(reviews[j].neg_review_words)
    }
  }
  
  return [posWords, negWords]
}


// wordclouds
class WordCloud {
  constructor(container_id, top_word_num, color){
    
    var data = anychart.data.set([]);
    for (let _ = 0; _ < top_word_num; _++) {
      data.append({'x': 'unselected', 'value': 1})
    }
    
    var chart = anychart.tagCloud(data);
    chart.container(container_id);
    chart.normal().fill(color);
    chart.draw();
    
    // this.view = cloudview;
    this.view = data.mapAs();
    this.top_word_num = top_word_num;
  }
  
  _setView(data){
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      this.view.set(i, 'x', el['x']);
      this.view.set(i, 'value', el['value']); 
    }
  }
  
  setWords(words){
    var counts = new Counter(words);
    delete counts[''];
    // keep only top n words
    var list = Object.keys(counts).map(function(key) {
      return [key, counts[key]];
    });
    
    list.sort(function(first, second) {
      return second[1] - first[1];
    });
    
    
    var top_words = list.slice(0, this.top_word_num);
    
    var data = [];
    for (let i = 0; i < top_words.length; i++) {
      const el = top_words[i];
      data = data.concat([{'x': el[0], 'value': el[1]}]);
    };
    this._setView(data);
    
  }
}

pos_cloud = new WordCloud('pos-cloud', 8, 'green');
neg_cloud = new WordCloud('neg-cloud', 8, 'red');


// function for popups
function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
      layer.bindPopup("<b>Name:</b> "+feature.properties.name+" <b>Average Score:</b> "+ calculate_average(feature.properties).toFixed(1));
  }
}

//get icons for the markers
var darkgreenIcon =  L.AwesomeMarkers.icon({
  markerColor: 'darkgreen'
});
var blueIcon =  L.AwesomeMarkers.icon({
  markerColor: 'blue'
});
var greenIcon =  L.AwesomeMarkers.icon({
  markerColor: 'green'
});
var darkredIcon =  L.AwesomeMarkers.icon({
  markerColor: 'darkred'
});
var orangeIcon =  L.AwesomeMarkers.icon({
  markerColor: 'orange'
});
var redIcon =  L.AwesomeMarkers.icon({
  markerColor: 'red'
});

// calculateing average score on a specific time domain for a hotel (used for colors and tooltip)
function calculate_average(properties){
  var reviews = properties.reviews;
  var sum = 0;
  let count = 0;
  for (let j = 0; j < reviews.length; j++) {
    var rev_date = Date.parse(reviews[j]['date']);
    if (rev_date < start_date || rev_date > end_date){continue;}
    sum += (reviews[j].rating);
    count += 1;
}
return sum / count
}

//function for different markers
function myStyle(feature, latlng) {
  var score = calculate_average(feature.properties);
  if (score >= 9.5) {
    return L.marker(latlng,{ icon: darkgreenIcon  }); 
  } 
  if (score >= 9) {
    return L.marker(latlng,{ icon: greenIcon  }); 
  } 
  if (score >= 8.5) {
    return L.marker(latlng,{ icon: blueIcon  }); 
  } 
  else if (score >= 8.) {
    return L.marker(latlng,{ icon: orangeIcon  });
  } 
  else if (score >= 7.5) {
    return L.marker(latlng,{ icon: redIcon });
  } 
  else {
    return L.marker(latlng,{ icon: darkredIcon });
  }};


// load the lemmaized hotel reviews, then draw wordclouds from them
function load(){
  fetch(hotel_data_filename)
  .then(function(response) {
  return response.json();
  })
  .then(function(data) {
  L.geoJSON(data,
      {   
        pointToLayer: myStyle,
        onEachFeature: onEachFeature
          
      }
    ).addTo(map);
  markerList = getVisibleMarkers();
  hotelData = whatever_the_f_this_is.responseJSON;

  update_line("whole");
  });
}
// put it in function, because we load it for different timeframes again
load();

//updating wordclouds when clicking
var _last_hotel = '';
function update_clouds(hotel_name) {
  
  console.log(hotelData);
  var hotel_info = hotelData['features'].find(el => hotel_name.includes(el['properties']['name']));
  var reviews = hotel_info['properties']['reviews'];

  posWords = [];
  negWords = [];
  for (let j = 0; j < reviews.length; j++) {
    var rev_date = Date.parse(reviews[j]['date']);
    if (rev_date < start_date || rev_date > end_date){continue;}

    posWords = posWords.concat(reviews[j]['pos_review_words']);
    negWords = negWords.concat(reviews[j]['neg_review_words']);
  }
  pos_cloud.setWords(posWords);
  neg_cloud.setWords(negWords);

  _last_hotel = hotel_name;
}

//credits for the map
const credits = L.control.attribution().addTo(map);
credits.addAttribution(
  `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`
);


//default views on map, functions used by buttons
document.getElementById('map-Vienna').onclick = function changezoomVienna(){
    map.flyTo([48.210033, 16.363449], 12);
    update_line("Vienna");}
document.getElementById('map-Amsterdam').onclick = function changezoomAmsterdam(){
    map.flyTo([52.377956, 4.897070], 12);
    update_line("Amsterdam");}
document.getElementById('map-London').onclick = function changezoomLondon(){
  map.flyTo([51.509865, -0.118092], 11);
  update_line("London");}
document.getElementById('map-Paris').onclick = function changezoomParis(){
  map.flyTo([48.85341, 2.3488], 12);
  update_line("Paris");}
document.getElementById('map-Milan').onclick = function changezoomMilan(){
  map.flyTo([45.464664, 9.188540], 12);
  update_line("Milan");}
document.getElementById('map-Barcelona').onclick = function changezoomBarcelona(){
  map.flyTo([41.390205, 2.154007], 12);
  update_line("Barcelona");}
document.getElementById('map-Europe').onclick = function changezoomEurope(){
  map.flyTo([47.811195, 13.033229], 4);
  update_line("whole");}

// get popup content 
map.on('popupopen', function(e) {
  var popup_text = e.popup._content;
  let hotel_name = popup_text.split("<b>")[1].split("</b>")[1].trim();
  d3.select('[id="' + hotel_name + '"]').dispatch('click');
  try {
    update_clouds(popup_text); 
  } catch (error) {
  }
});

