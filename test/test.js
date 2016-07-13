// Author: lixun910 at gmail.com

var L = require('leaflet'),
    LeafletMap = require('leaflet-map'),
    MapCola = require('../lib/index.js').MapCola;

var map = LeafletMap();
map.setView([0,0],4);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  .addTo(map);

var mapCola = new MapCola();
var test_url = "test/data/nat.shp";

var xhr = new XMLHttpRequest();
xhr.open("GET", test_url, true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(evt) {
  var content = xhr.response;
  var prj = null;
  var shp_reader = new MapCola.ShpReader(content);
  var shp_map = new MapCola.ShpMap("pubhsg", shp_reader, L, map);

  //L.DomUtil.create('Canvas', '', document.body);
  var elCanvas = document.createElement("Canvas");
  elCanvas.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none');
  document.body.appendChild(elCanvas);

  var hlCanvas = document.createElement("Canvas");
  elCanvas.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;');
  document.body.appendChild(hlCanvas);

  var params = {'fill_color':'red'}
  var mapCanvas = new MapCola.MapCanvas(shp_map, elCanvas, hlCanvas, params);
};
xhr.send(null);
