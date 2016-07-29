// Author: lixun910 at gmail.com

// 1. simplest MapCola Example
var MapCola = require('../lib/index.js');

var cmap = new MapCola("mymap", {
  tileLayer : "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
  width : "800px",
  height : "600px"
  });

cmap.AddLayer("test/data/nat.shp", {'fill_color':'red'});
//cmap.AddLayer("test/data/nat.json", {'fill_color':'green'});



// 2. MapCola work with existing LeafletMap project
var L = require('leaflet'),
    LeafletMap = require('leaflet-map');

var lmap = LeafletMap().setView([0,0],4);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  .addTo(lmap);

var cmap2 = new MapCola(lmap);

cmap2.AddLayer("test/data/nat.shp", {'fill_color':'blue'});
