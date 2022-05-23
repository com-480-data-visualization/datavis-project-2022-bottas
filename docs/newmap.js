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
  constructor(container_id, top_word_num){
    
    var data = anychart.data.set([]);
    for (let _ = 0; _ < top_word_num; _++) {
      data.append({'x': 'loading', 'value': 1})
    }
    
    var chart = anychart.tagCloud(data);
    chart.container(container_id);
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

pos_cloud = new WordCloud('pos-cloud', 20);
neg_cloud = new WordCloud('neg-cloud', 20);

// load the lemmaized hotel reviews, then draw wordclouds from them
// from aws: fetch("https://dataviz-bottas.s3.eu-central-1.amazonaws.com/hotel_data.geojson")
//fetch("hotel_data.geojson")
fetch("https://dataviz-bottas.s3.eu-central-1.amazonaws.com/hotel_data.geojson")
.then(function(response) {
return response.json();
})
.then(function(data) {
L.geoJSON(data).addTo(map);
markerList = getVisibleMarkers();
hotelData = whatever_the_f_this_is.responseJSON;
[pos, neg] = getWords([0]);
pos_cloud.setWords(pos);
neg_cloud.setWords(neg);
});