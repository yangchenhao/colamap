// Author: lixun910 at gmail.com

// simplest MapCola Example
var MapCola = require('../lib/index.js');

var cmap = new MapCola("mymap", {
  tileLayer : "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
  width : "800px",
  height : "600px"
  });

cmap.AddLayer("test/data/nat.shp", {'fill_color':'red'});


// MapCola work with existing LeafletMap project
var L = require('leaflet'),
    LeafletMap = require('leaflet-map');

var map = LeafletMap();
map.setView([0,0],4);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  .addTo(map);

var cmap2 = new MapCola(map);

cmap2.AddLayer("test/data/nat.shp", {'fill_color':'blue'});
