// 1. simplest MapCola Example

// Add CSS links
function help_AddCssLink(css_url)
{
  var mapStyle = document.createElement('link')
  mapStyle.setAttribute('rel','stylesheet')
  mapStyle.setAttribute('href', css_url)
  document.body.appendChild(mapStyle);
}
help_AddCssLink('//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css');
help_AddCssLink("//issues.wenzhixin.net.cn/bootstrap-table/assets/bootstrap-table/src/bootstrap-table.css");

// Add js links
global.$ = global.jQuery = require('jquery/dist/jquery.min.js');
require('bootstrap/dist/js/bootstrap.min.js');
var bootstrapTable = require('bootstrap-table/dist/bootstrap-table.js')
var MapCola = require('../lib/index.js');

// main code body
var cmap = new MapCola("mymap", {
  //tileLayer : "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
  width : "800px",
  height : "600px",
  showScale : true,
  showTable : true
  });

cmap.AddLayer("test/data/nat.json", {'fill_color':'red'}
  , function(map, data) {
    //console.log(map, data);

    // do spatial analysis here
    // clr_schema = geoda.quantile(data.income, k=5, colors=colorbrew.gry);

    // create a result map
    // map_canvas.update({colorSchema: clr_schema})

    // * share the map  on canvas not via code
  });

/*
// 2. MapCola works with existing LeafletMap project
var L = require('leaflet'),
    LeafletMap = require('leaflet-map');

var lmap = LeafletMap().setView([0,0],4);


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  .addTo(lmap);

var cmap2 = new MapCola(lmap);
cmap2.AddLayer("test/data/nat.shp", {'fill_color':'blue'});
*/
