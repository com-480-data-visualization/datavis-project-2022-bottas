/*New map.*/
var map = L.map('map').setView([47.811195, 13.033229], 4);
var markerList;
var hotelData;
var whatever_the_f_this_is = $.getJSON("hotel_data.geojson");

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiaGhpbGRhYSIsImEiOiJjbDM4bndzNGowMW9pM2pxbWo5aWdnMTR3In0.7VwzpEqRUIHqyO85CB3xJg'
}).addTo(map);


// select visible hotels
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


fetch("hotel_data.geojson")
.then(function(response) {
return response.json();
})
.then(function(data) {
// console.log(L.geoJSON(data));
L.geoJSON(data).addTo(map);
markerList = getVisibleMarkers();
hotelData = whatever_the_f_this_is.responseJSON;
});


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



// wordclouds
function getWords(cur_IDs){
  // cur_IDs = getVisibleMarkerIDs();
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

var cloud;

function drawCloud(words, top_n, id){
  counts = new Counter(words);
  delete counts[''];
  // keep only top n words
  var list = Object.keys(counts).map(function(key) {
    return [key, counts[key]];
  });

  list.sort(function(first, second) {
    return second[1] - first[1];
  });

  console.log(list);

  list = list.slice(0, top_n);
  // WordCloud.minFontSize = "150px";
  WordCloud(document.getElementById('wordclouds'), { list: list} );
}